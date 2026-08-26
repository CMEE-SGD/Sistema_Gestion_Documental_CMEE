import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { extname, join } from 'path';
import * as fs from 'fs';

function sanitizar(valor: string): string {
  return valor.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 100) || '_';
}

@Injectable()
export class CapacitacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCapacitacionDto) {
    const { persona_ids, ...data } = dto;
    const ahora = new Date();
    const fechaBase = data.fecha_inicio || ahora.toISOString().split('T')[0];
    const created_at = new Date(`${fechaBase}T${ahora.toTimeString().slice(0, 8)}`);

    return this.prisma.capacitacion.create({
      data: {
        nombre: data.nombre,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin),
        horas: data.horas,
        lugar: data.lugar || null,
        proveedor: data.proveedor || null,
        estado: (data.estado as any) || 'PROGRAMADA',
        observaciones: data.observaciones || null,
        created_at,
        ...(persona_ids?.length
          ? {
              participantes: {
                create: persona_ids.map((pid) => ({ persona_id: pid })),
              },
            }
          : {}),
      },
      include: {
        participantes: {
          include: { persona: { select: { id: true, nombre: true, apellidos: true } } },
        },
      },
    });
  }

  findAll() {
    return this.prisma.capacitacion.findMany({
      orderBy: { fecha_inicio: 'desc' },
      include: {
        participantes: {
          include: { persona: { select: { id: true, nombre: true, apellidos: true } } },
        },
      },
    });
  }

  async findOne(id: number) {
    const cap = await this.prisma.capacitacion.findUnique({
      where: { id },
      include: {
        participantes: {
          select: { id: true, certificado: true, persona: { select: { id: true, nombre: true, apellidos: true, cedula_identidad: true } } },
        },
      },
    });
    if (!cap) throw new NotFoundException(`Capacitación con ID ${id} no encontrada`);
    return cap;
  }

  async update(id: number, dto: UpdateCapacitacionDto) {
    await this.findOne(id);
    const { persona_ids, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.fecha_inicio !== undefined) updateData.fecha_inicio = new Date(data.fecha_inicio);
      if (data.fecha_fin !== undefined) updateData.fecha_fin = new Date(data.fecha_fin);
      if (data.horas !== undefined) updateData.horas = data.horas;
      if (data.lugar !== undefined) updateData.lugar = data.lugar || null;
      if (data.proveedor !== undefined) updateData.proveedor = data.proveedor || null;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

      const result = await tx.capacitacion.update({ where: { id }, data: updateData });

      if (persona_ids !== undefined) {
        const existing = await tx.capacitacionPersona.findMany({
          where: { capacitacion_id: id },
          select: { persona_id: true },
        });
        const existingIds = existing.map(e => e.persona_id);
        const toRemove = existingIds.filter(pid => !persona_ids.includes(pid));
        const toAdd = persona_ids.filter(pid => !existingIds.includes(pid));

        if (toRemove.length > 0) {
          await tx.capacitacionPersona.deleteMany({
            where: { capacitacion_id: id, persona_id: { in: toRemove } },
          });
        }
        if (toAdd.length > 0) {
          await tx.capacitacionPersona.createMany({
            data: toAdd.map(pid => ({ capacitacion_id: id, persona_id: pid })),
          });
        }
      }

      return tx.capacitacion.findUnique({
        where: { id },
        include: {
          participantes: {
            include: { persona: { select: { id: true, nombre: true, apellidos: true } } },
          },
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.capacitacion.delete({ where: { id } });
  }

  async findByPersonaId(personaId: number) {
    return this.prisma.capacitacion.findMany({
      where: {
        participantes: {
          some: { persona_id: personaId },
        },
      },
      orderBy: { fecha_inicio: 'desc' },
      include: {
        participantes: {
          include: { persona: { select: { id: true, nombre: true, apellidos: true } } },
        },
      },
    });
  }

  async setCertificado(capacitacionId: number, personaId: number, tmpPath: string) {
    const cap = await this.prisma.capacitacionPersona.findUnique({
      where: { capacitacion_id_persona_id: { capacitacion_id: capacitacionId, persona_id: personaId } },
      include: {
        capacitacion: { select: { nombre: true } },
        persona: { select: { grado: true, nombre: true, apellidos: true } },
      },
    });
    if (!cap) throw new NotFoundException('La persona no es participante de esta capacitación');

    const carpeta = sanitizar(cap.capacitacion.nombre);
    const destinoDir = join('.', 'uploads', 'Capacitaciones', carpeta);
    if (!fs.existsSync(destinoDir)) fs.mkdirSync(destinoDir, { recursive: true });

    const ext = extname(tmpPath);
    const grado = cap.persona.grado ? sanitizar(cap.persona.grado) + '_' : '';
    const apellidos = sanitizar(cap.persona.apellidos);
    const nombre = sanitizar(cap.persona.nombre);
    const nombreArchivo = `${grado}${apellidos}_${nombre}${ext}`;
    const destino = join(destinoDir, nombreArchivo);

    fs.renameSync(tmpPath, destino);

    const ruta = `/uploads/Capacitaciones/${carpeta}/${nombreArchivo}`;
    return this.prisma.capacitacionPersona.update({
      where: { id: cap.id },
      data: { certificado: ruta },
    });
  }
}
