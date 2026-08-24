import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FindAuditoriaDto } from './dto/find-auditoria.dto';
import { FindIntentosLoginDto } from './dto/find-intentos-login.dto';

/** Módulo controlador o servicio para gestionar la entidad Auditoria. */
@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta la operación de negocio registrarLog.
   * @param data - Datos o identificador requerido (Objeto complejo / PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  async registrarLog(data: {
    usuario_id: number;
    modulo: string;
    accion: string;
    descripcion?: string;
    detalle?: string | null;
    documento_id?: number;
    persona_afectada_id?: number;
    rol_afectado_id?: number;
    puesto_afectado_id?: number;
    entidad_id?: number | null;
  }) {
    return this.prisma.auditoria.create({
      data,
    });
  }

  /**
   * Lista la bitácora global con filtros y paginación reales — la tabla
   * crece sin límite, así que traerla completa en cada consulta no escala.
   */
  async findAll(filtros: FindAuditoriaDto) {
    const pagina = filtros.pagina ?? 1;
    const porPagina = filtros.porPagina ?? 20;

    const where: Prisma.AuditoriaWhereInput = {
      ...(filtros.modulo ? { modulo: filtros.modulo } : {}),
      ...(filtros.entidadId ? { entidad_id: filtros.entidadId } : {}),
      ...(filtros.accion ? { accion: { contains: filtros.accion } } : {}),
      ...(filtros.usuario
        ? {
            usuario: {
              nombre_usuario: {
                contains: filtros.usuario,
                mode: 'insensitive',
              },
            },
          }
        : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            fecha_hora: {
              ...(filtros.desde ? { gte: new Date(filtros.desde) } : {}),
              ...(filtros.hasta ? { lte: new Date(filtros.hasta) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditoria.findMany({
        where,
        orderBy: { fecha_hora: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
        include: {
          usuario: { select: { nombre_usuario: true } },
        },
      }),
      this.prisma.auditoria.count({ where }),
    ]);

    return {
      data,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    };
  }

  /**
   * Lista la bitácora de intentos de inicio de sesión (éxitos y fallos),
   * con filtros y paginación reales — igual que findAll.
   */
  async findIntentosLogin(filtros: FindIntentosLoginDto) {
    const pagina = filtros.pagina ?? 1;
    const porPagina = filtros.porPagina ?? 20;

    const where: Prisma.IntentoLoginWhereInput = {
      ...(filtros.usuario
        ? {
            nombre_usuario: {
              contains: filtros.usuario,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filtros.exito !== undefined ? { exito: filtros.exito } : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            fecha_hora: {
              ...(filtros.desde ? { gte: new Date(filtros.desde) } : {}),
              ...(filtros.hasta ? { lte: new Date(filtros.hasta) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.intentoLogin.findMany({
        where,
        orderBy: { fecha_hora: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      this.prisma.intentoLogin.count({ where }),
    ]);

    return {
      data,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    };
  }

  /**
   * Ejecuta la operación de negocio findByPersona.
   * @param personaId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByPersona(personaId: number) {
    return this.prisma.auditoria.findMany({
      where: { persona_afectada_id: personaId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } },
    });
  }

  /**
   * Ejecuta la operación de negocio findByDocumento.
   * @param documentoId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByDocumento(documentoId: number) {
    return this.prisma.auditoria.findMany({
      where: { documento_id: documentoId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } },
    });
  }

  /**
   * Ejecuta la operación de negocio findByRol.
   * @param rolId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByRol(rolId: number) {
    return this.prisma.auditoria.findMany({
      where: { rol_afectado_id: rolId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } },
    });
  }

  /**
   * Ejecuta la operación de negocio findByPuesto.
   * @param puestoId - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findByPuesto(puestoId: number) {
    return this.prisma.auditoria.findMany({
      where: { puesto_afectado_id: puestoId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } },
    });
  }
}
