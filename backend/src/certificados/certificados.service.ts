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
    recepcionEquipoId: number,
    user: HydratedUser,
  ) {
    // 1. Validar existencia y estado de la recepción
    const recepcion = await this.prisma.recepcionEquipo.findUnique({
      where: { id: recepcionEquipoId },
    });

    if (!recepcion) {
      throw new NotFoundException(
        `Recepción de equipo con ID ${recepcionEquipoId} no encontrada`,
      );
    }

    if (recepcion.estado !== EstadoRecepcion.EN_CALIBRACION) {
      throw new BadRequestException(
        'El equipo no se encuentra en estado de calibración activa',
      );
    }

    // 2. Hidratar datos del usuario (persona_id, puesto, laboratorio)
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

    // 3. ABAC: verificar permiso según el puesto del usuario
    if (!user.isGod) {
      const n = puesto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const esObservador = n.includes('observador');
      const esTecnico = n.includes('tecnico') && !n.includes('observador');

      if (esObservador && recepcion.laboratorio_id !== labId) {
        throw new ForbiddenException(
          'No tienes permiso para subir certificados a equipos de otro laboratorio',
        );
      }

      if (esTecnico && recepcion.tecnico_id !== personaId) {
        throw new ForbiddenException(
          'No tienes permiso para subir certificados a equipos que no te fueron asignados',
        );
      }
    }

    // 4. Transacción atómica: crear certificado + avanzar a revisión OBT
    return this.prisma.$transaction(async (tx) => {
      const certificado = await tx.certificado.create({
        data: {
          recepcion_equipo_id: recepcionEquipoId,
          ruta_archivo: file.path,
          nombre_original: file.originalname,
          tecnico_id: user.isGod ? 1 : personaId,
        },
      });

      await tx.recepcionEquipo.update({
        where: { id: recepcionEquipoId },
        data: { estado: EstadoRecepcion.REVISION_OBT },
      });

      await tx.historialEstado.create({
        data: {
          recepcion_equipo_id: recepcionEquipoId,
          estado_anterior: EstadoRecepcion.EN_CALIBRACION,
          estado_nuevo: EstadoRecepcion.REVISION_OBT,
          accion: 'APROBAR',
          realizado_por_id: personaId ?? 1,
        },
      });

      return tx.certificado.findUnique({
        where: { id: certificado.id },
        include: {
          recepcion_equipo: {
            select: {
              id: true,
              orden_trabajo_fisica: true,
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
        recepcion_equipo: {
          select: {
            id: true,
            tecnico_id: true,
            laboratorio_id: true,
            orden_trabajo_fisica: true,
          },
        },
      },
    });

    if (!certificado) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }

    const recepcion = certificado.recepcion_equipo;

    // Hidratar datos del usuario
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

      if (esObservador && recepcion.laboratorio_id !== labId) {
        throw new ForbiddenException(
          'No tienes permiso para ver certificados de otro laboratorio',
        );
      }

      if (esTecnico && recepcion.tecnico_id !== personaId) {
        throw new ForbiddenException(
          'No tienes permiso para ver certificados que no te fueron asignados',
        );
      }
    }

    return path.resolve(certificado.ruta_archivo);
  }

  async findAll(recepcionEquipoId?: number) {
    const where = recepcionEquipoId
      ? { recepcion_equipo_id: recepcionEquipoId }
      : {};

    return this.prisma.certificado.findMany({
      where,
      orderBy: { fecha_subida: 'desc' },
      include: {
        recepcion_equipo: {
          select: { id: true, orden_trabajo_fisica: true, estado: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { id },
      include: {
        recepcion_equipo: {
          select: { id: true, orden_trabajo_fisica: true },
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
