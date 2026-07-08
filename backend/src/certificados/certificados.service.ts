import * as path from 'path';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoRecepcion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { HydratedUser } from '../common/helpers/lab-scope';

@Injectable()
export class CertificadosService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    file: Express.Multer.File,
    equipoRecepcionId: number,
    user: HydratedUser,
  ) {
    const equipo = await this.prisma.equipoRecepcion.findUnique({
      where: { id: equipoRecepcionId },
    });

    if (!equipo) {
      throw new NotFoundException(
        `Equipo con ID ${equipoRecepcionId} no encontrado`,
      );
    }

    if (equipo.estado !== EstadoRecepcion.EN_CALIBRACION) {
      throw new BadRequestException(
        'El equipo no se encuentra en estado de calibración activa',
      );
    }

    let personaId = user.persona_id;
    let puesto = user.puesto ?? '';
    let labId: number | null = user.laboratorio_id ?? null;

    if (!puesto && user.id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          persona: {
            select: {
              id: true,
              puestos: {
                where: { activo: true },
                orderBy: { orden_puesto: 'asc' },
                take: 1,
                select: {
                  puesto: { select: { nombre: true } },
                  departamento: {
                    select: { laboratorio: { select: { id: true } } },
                  },
                },
              },
            },
          },
        },
      });

      const puestos = usuario?.persona?.puestos ?? [];
      personaId = usuario?.persona?.id;
      puesto = puestos[0]?.puesto?.nombre ?? '';
      labId = puestos[0]?.departamento?.laboratorio?.id ?? null;
    }

    if (!user.isGod) {
      const n = puesto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const esObservador = n.includes('observador');
      const esTecnico = n.includes('tecnico') && !n.includes('observador');

      if (esObservador && equipo.laboratorio_id !== labId) {
        throw new ForbiddenException(
          'No tienes permiso para subir certificados a equipos de otro laboratorio',
        );
      }

      if (esTecnico && equipo.tecnico_id !== personaId) {
        throw new ForbiddenException(
          'No tienes permiso para subir certificados a equipos que no te fueron asignados',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const certificado = await tx.certificado.create({
        data: {
          equipo_recepcion_id: equipoRecepcionId,
          ruta_archivo: file.path,
          nombre_original: file.originalname,
          tecnico_id: user.isGod ? 1 : personaId,
        },
      });

      await tx.equipoRecepcion.update({
        where: { id: equipoRecepcionId },
        data: { estado: EstadoRecepcion.REVISION_OBT },
      });

      await tx.historialEstado.create({
        data: {
          equipo_recepcion_id: equipoRecepcionId,
          estado_anterior: EstadoRecepcion.EN_CALIBRACION,
          estado_nuevo: EstadoRecepcion.REVISION_OBT,
          accion: 'APROBAR',
          realizado_por_id: personaId ?? 1,
        },
      });

      return tx.certificado.findUnique({
        where: { id: certificado.id },
        include: {
          equipo_recepcion: {
            select: {
              id: true,
              estado: true,
            },
          },
        },
      });
    });
  }

  async download(id: number, user: HydratedUser) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id },
      include: {
        equipo_recepcion: {
          select: {
            id: true,
            tecnico_id: true,
            laboratorio_id: true,
          },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }

    const equipo = certificado.equipo_recepcion;

    let personaId = user.persona_id;
    let puesto = user.puesto ?? '';
    let labId: number | null = user.laboratorio_id ?? null;

    if (!puesto && user.id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          persona: {
            select: {
              id: true,
              puestos: {
                where: { activo: true },
                orderBy: { orden_puesto: 'asc' },
                take: 1,
                select: {
                  puesto: { select: { nombre: true } },
                  departamento: {
                    select: { laboratorio: { select: { id: true } } },
                  },
                },
              },
            },
          },
        },
      });

      const puestos = usuario?.persona?.puestos ?? [];
      personaId = usuario?.persona?.id;
      puesto = puestos[0]?.puesto?.nombre ?? '';
      labId = puestos[0]?.departamento?.laboratorio?.id ?? null;
    }

    if (!user.isGod) {
      const n = puesto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const esObservador = n.includes('observador');
      const esTecnico = n.includes('tecnico') && !n.includes('observador');

      if (esObservador && equipo.laboratorio_id !== labId) {
        throw new ForbiddenException(
          'No tienes permiso para ver certificados de otro laboratorio',
        );
      }

      if (esTecnico && equipo.tecnico_id !== personaId) {
        throw new ForbiddenException(
          'No tienes permiso para ver certificados que no te fueron asignados',
        );
      }
    }

    return path.resolve(certificado.ruta_archivo);
  }

  async findAll(equipoRecepcionId?: number) {
    const where = equipoRecepcionId
      ? { equipo_recepcion_id: equipoRecepcionId }
      : {};

    return this.prisma.certificado.findMany({
      where,
      orderBy: { fecha_subida: 'desc' },
      include: {
        equipo_recepcion: {
          select: { id: true, estado: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id },
      include: {
        equipo_recepcion: {
          select: { id: true },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }

    return certificado;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.certificado.delete({ where: { id } });
  }
}
