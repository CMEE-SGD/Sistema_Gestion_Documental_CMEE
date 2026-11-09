import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrigenAccion, TipoAccion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccionDto, UpdateAccionDto } from './dto/create-accion.dto';

export interface OrigenResuelto {
  tipo: OrigenAccion;
  id: number;
  codigo: string | null;
  // Solo para AUDITORIA_NC: la ruta del detalle de una NC necesita la auditoría.
  auditoria_id: number | null;
}

@Injectable()
export class AccionesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Código correlativo por tipo: AC-0001 (correctiva) / AP-0001 (preventiva). */
  private async siguienteCodigo(tipo: TipoAccion) {
    const prefijo = tipo === 'PREVENTIVA' ? 'AP' : 'AC';
    const items = await this.prisma.accionCorrectivaPreventiva.findMany({
      where: { tipo },
      select: { codigo: true },
    });
    let max = 0;
    for (const item of items) {
      const n = parseInt(item.codigo.split('-')[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return `${prefijo}-${String(max + 1).padStart(4, '0')}`;
  }

  /** Busca el registro de origen; null si no existe o está dado de baja. */
  private async resolverOrigen(tipo: OrigenAccion, id: number): Promise<OrigenResuelto | null> {
    switch (tipo) {
      case 'AUDITORIA_NC': {
        const r = await this.prisma.noConformidad.findUnique({
          where: { id },
          select: { codigo: true, auditoria_id: true, activo: true },
        });
        return r?.activo ? { tipo, id, codigo: r.codigo, auditoria_id: r.auditoria_id } : null;
      }
      case 'QUEJA': {
        const r = await this.prisma.queja.findUnique({ where: { id }, select: { codigo: true, activo: true } });
        return r?.activo ? { tipo, id, codigo: r.codigo, auditoria_id: null } : null;
      }
      case 'RIESGO': {
        const r = await this.prisma.riesgoOportunidad.findUnique({ where: { id }, select: { codigo: true, activo: true } });
        return r?.activo ? { tipo, id, codigo: r.codigo, auditoria_id: null } : null;
      }
      case 'TRABAJO_NC': {
        const r = await this.prisma.trabajoNoConforme.findUnique({ where: { id }, select: { codigo: true, activo: true } });
        return r?.activo ? { tipo, id, codigo: r.codigo, auditoria_id: null } : null;
      }
    }
  }

  private async conOrigen<T extends { origen_tipo: OrigenAccion; origen_id: number }>(accion: T) {
    const origen = await this.resolverOrigen(accion.origen_tipo, accion.origen_id);
    return {
      ...accion,
      origen: origen ?? { tipo: accion.origen_tipo, id: accion.origen_id, codigo: null, auditoria_id: null },
    };
  }

  private fechas(data: Record<string, any>) {
    const salida = { ...data };
    for (const campo of ['fecha_limite', 'fecha_cierre']) {
      if (salida[campo] === undefined) continue;
      salida[campo] = salida[campo] ? new Date(salida[campo]) : null;
    }
    return salida;
  }

  async create(dto: CreateAccionDto) {
    const origen = await this.resolverOrigen(dto.origen_tipo, dto.origen_id);
    if (!origen) throw new BadRequestException('El registro de origen no existe');

    const creada = await this.prisma.accionCorrectivaPreventiva.create({
      data: { ...this.fechas(dto), codigo: await this.siguienteCodigo(dto.tipo) } as any,
    });
    return this.conOrigen(creada);
  }

  /** Listado con filtros opcionales; cada fila incluye el código del origen. */
  async findAll(filtros: { tipo?: TipoAccion; origen_tipo?: OrigenAccion; origen_id?: number; estado?: string }) {
    const filas = await this.prisma.accionCorrectivaPreventiva.findMany({
      where: {
        activo: true,
        ...(filtros.tipo && { tipo: filtros.tipo }),
        ...(filtros.origen_tipo && { origen_tipo: filtros.origen_tipo }),
        ...(filtros.origen_id && { origen_id: filtros.origen_id }),
        ...(filtros.estado && { estado: filtros.estado as any }),
      },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(filas.map((f) => this.conOrigen(f)));
  }

  async findOne(id: number) {
    const accion = await this.prisma.accionCorrectivaPreventiva.findUnique({ where: { id } });
    if (!accion || !accion.activo) throw new NotFoundException(`Acción con ID ${id} no encontrada`);
    return this.conOrigen(accion);
  }

  async update(id: number, dto: UpdateAccionDto) {
    const existente = await this.findOne(id);
    const datos = this.fechas(dto);

    const estado = datos.estado ?? existente.estado;
    const eficaz = datos.eficaz !== undefined ? datos.eficaz : existente.eficaz;
    if (estado === 'CERRADA' && (eficaz === null || eficaz === undefined)) {
      throw new BadRequestException('Para cerrar la acción debe registrar si fue eficaz');
    }
    if (estado === 'CERRADA' && !datos.fecha_cierre && !existente.fecha_cierre) {
      datos.fecha_cierre = new Date();
    }

    const actualizada = await this.prisma.accionCorrectivaPreventiva.update({ where: { id }, data: datos });
    return this.conOrigen(actualizada);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.accionCorrectivaPreventiva.update({ where: { id }, data: { activo: false } });
  }
}
