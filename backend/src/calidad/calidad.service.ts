import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { CreateNcDto } from './dto/create-nc.dto';
import { UpdateNcDto } from './dto/update-nc.dto';

@Injectable()
export class CalidadService {
  constructor(private prisma: PrismaService) {}

  // ==================== AUDITORÍAS INTERNAS ====================

  async createAuditoria(data: any) {
    return this.prisma.auditoriaInterna.create({
      data: {
        codigo: data.codigo,
        tipo: data.tipo,
        alcance: data.alcance,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
        responsable_id: data.responsable_id,
        estado: data.estado,
        observaciones: data.observaciones,
        archivo_planificacion: data.archivo_planificacion,
      },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
  }

  async findAllAuditorias() {
    return this.prisma.auditoriaInterna.findMany({
      where: { activo: true },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
        _count: { select: { no_conformidades: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAuditoria(id: number) {
    const auditoria = await this.prisma.auditoriaInterna.findUnique({
      where: { id },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
        no_conformidades: {
          where: { activo: true },
          include: {
            responsable: { select: { id: true, nombre: true, apellidos: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!auditoria) throw new NotFoundException(`Auditoría con ID ${id} no encontrada`);
    return auditoria;
  }

  async updateAuditoria(id: number, data: UpdateAuditoriaDto) {
    await this.findOneAuditoria(id);
    return this.prisma.auditoriaInterna.update({
      where: { id },
      data: {
        ...data,
        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
      },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
  }

  async removeAuditoria(id: number) {
    await this.findOneAuditoria(id);
    return this.prisma.auditoriaInterna.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ==================== NO CONFORMIDADES ====================

  async createNc(data: CreateNcDto) {
    return this.prisma.noConformidad.create({
      data: {
        codigo: data.codigo,
        auditoria_id: data.auditoria_id,
        categoria: data.categoria,
        requisito: data.requisito,
        hallazgo: data.hallazgo,
        evidencia: data.evidencia,
        aceptada_oec: data.aceptada_oec,
        reiterada: data.reiterada,
        descripcion: data.descripcion,
        requisito_incumplido: data.requisito_incumplido,
        clasificacion: data.clasificacion,
        causa_raiz: data.causa_raiz,
        acciones_inmediatas: data.acciones_inmediatas,
        estado: data.estado,
        responsable_id: data.responsable_id,
        fecha_cierre: data.fecha_cierre ? new Date(data.fecha_cierre) : null,
      },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
  }

  async findNcsByAuditoria(auditoriaId: number) {
    return this.prisma.noConformidad.findMany({
      where: { auditoria_id: auditoriaId, activo: true },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneNc(id: number) {
    const nc = await this.prisma.noConformidad.findUnique({
      where: { id },
      include: {
        auditoria: { select: { id: true, codigo: true, alcance: true } },
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
    if (!nc) throw new NotFoundException(`No conformidad con ID ${id} no encontrada`);
    return nc;
  }

  async updateNc(id: number, data: UpdateNcDto) {
    await this.findOneNc(id);
    return this.prisma.noConformidad.update({
      where: { id },
      data: {
        ...data,
        fecha_cierre: data.fecha_cierre ? new Date(data.fecha_cierre) : undefined,
      },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
  }

  async removeNc(id: number) {
    await this.findOneNc(id);
    return this.prisma.noConformidad.update({
      where: { id },
      data: { activo: false },
    });
  }
}
