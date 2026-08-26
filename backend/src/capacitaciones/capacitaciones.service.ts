import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';

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
        certificado: data.certificado || null,
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
          include: { persona: { select: { id: true, nombre: true, apellidos: true, cedula_identidad: true } } },
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
      if (data.certificado !== undefined) updateData.certificado = data.certificado || null;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

      const result = await tx.capacitacion.update({ where: { id }, data: updateData });

      if (persona_ids !== undefined) {
        await tx.capacitacionPersona.deleteMany({ where: { capacitacion_id: id } });
        if (persona_ids.length > 0) {
          await tx.capacitacionPersona.createMany({
            data: persona_ids.map((pid) => ({ capacitacion_id: id, persona_id: pid })),
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
}
