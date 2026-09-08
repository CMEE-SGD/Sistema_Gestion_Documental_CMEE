import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CarpetasService {
  constructor(private prisma: PrismaService) {}

  async verificarPermiso(usuarioId: number, carpetaId: number, permiso: 'permiso_docs' | 'permiso_carpetas'): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { persona_id: true },
    });
    if (!usuario?.persona_id) return false;

    const puestos = await this.prisma.personaPuesto.findMany({
      where: { persona_id: usuario.persona_id, activo: true },
      select: { departamento_id: true },
    });
    const deptosIds = puestos.map(p => p.departamento_id);

    const totalPermisos = await this.prisma.carpetaPermiso.count({
      where: { carpeta_id: carpetaId },
    });
    // Si la carpeta no tiene permisos configurados, se permite (backward compatibility)
    if (totalPermisos === 0) return true;

    const permisoRecord = await this.prisma.carpetaPermiso.findFirst({
      where: {
        carpeta_id: carpetaId,
        OR: [
          { persona_id: usuario.persona_id },
          ...(deptosIds.length > 0 ? [{ departamento_id: { in: deptosIds } }] : []),
        ],
        [permiso]: true,
      },
    });
    return !!permisoRecord;
  }

  async verificarNivelPermiso(usuarioId: number, carpetaId: number, nivelMinimo: number): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { persona_id: true },
    });
    if (!usuario?.persona_id) return false;

    const puestos = await this.prisma.personaPuesto.findMany({
      where: { persona_id: usuario.persona_id, activo: true },
      select: { departamento_id: true },
    });
    const deptosIds = puestos.map(p => p.departamento_id);

    const totalPermisos = await this.prisma.carpetaPermiso.count({
      where: { carpeta_id: carpetaId },
    });
    if (totalPermisos === 0) return true;

    const permiso = await this.prisma.carpetaPermiso.findFirst({
      where: {
        carpeta_id: carpetaId,
        OR: [
          { persona_id: usuario.persona_id },
          ...(deptosIds.length > 0 ? [{ departamento_id: { in: deptosIds } }] : []),
        ],
        nivel_permiso: { gte: nivelMinimo },
      },
    });
    return !!permiso;
  }

  async obtenerPermisosUsuario(usuarioId: number, carpetaId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { persona_id: true },
    });
    if (!usuario?.persona_id) return { permiso_docs: false, permiso_carpetas: false, nivel_permiso: 0 };

    const puestos = await this.prisma.personaPuesto.findMany({
      where: { persona_id: usuario.persona_id, activo: true },
      select: { departamento_id: true },
    });
    const deptosIds = puestos.map(p => p.departamento_id);

    const totalPermisos = await this.prisma.carpetaPermiso.count({
      where: { carpeta_id: carpetaId },
    });
    if (totalPermisos === 0) return { permiso_docs: true, permiso_carpetas: true, nivel_permiso: 5 };

    const whereBase = {
      carpeta_id: carpetaId,
      OR: [
        { persona_id: usuario.persona_id },
        ...(deptosIds.length > 0 ? [{ departamento_id: { in: deptosIds } }] : []),
      ],
    };

    const [permisoRecord, docs, carpetas] = await Promise.all([
      this.prisma.carpetaPermiso.findFirst({
        where: whereBase,
        orderBy: { nivel_permiso: 'desc' },
        select: { nivel_permiso: true },
      }),
      this.prisma.carpetaPermiso.findFirst({ where: { ...whereBase, permiso_docs: true } }),
      this.prisma.carpetaPermiso.findFirst({ where: { ...whereBase, permiso_carpetas: true } }),
    ]);

    return {
      permiso_docs: !!docs,
      permiso_carpetas: !!carpetas,
      nivel_permiso: permisoRecord?.nivel_permiso ?? 0,
    };
  }

  async obtenerRutaFisica(carpetaId: number): Promise<string> {
    const partes = [];
    let actualId: number | null = carpetaId;

    while (actualId) {
      const carpeta = await this.prisma.carpeta.findUnique({
        where: { id: actualId },
      });
      if (!carpeta) break;

      const nombreSeguro = carpeta.nombre
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ -_]/g, '')
        .trim();
      partes.unshift(nombreSeguro);

      actualId = carpeta.carpeta_padre_id;
    }

    return path.join(process.cwd(), 'uploads', 'Gestor_Documental', ...partes);
  }

  async create(data: any, usuarioId?: number) { 
    const { permisos, carpeta_padre_id, ...carpetaData } = data;

    if (carpeta_padre_id && usuarioId) {
      const tienePermiso = await this.verificarPermiso(usuarioId, carpeta_padre_id, 'permiso_carpetas');
      if (!tienePermiso) {
        throw new ForbiddenException('No tienes permiso para crear subcarpetas aquí');
      }
    }

    const nuevaCarpeta = await this.prisma.carpeta.create({
      data: { ...carpetaData, carpeta_padre_id: carpeta_padre_id || undefined },
    });

    if (permisos && permisos.length > 0) {
      const permisosData = permisos.map((p: any) => ({
        carpeta_id: nuevaCarpeta.id,
        departamento_id: p.departamento_id || null,
        persona_id: p.persona_id || null,
        nivel_permiso: p.nivel_permiso ?? 1,
        permiso_docs: p.permiso_docs ?? false,
        permiso_carpetas: p.permiso_carpetas ?? false,
      }));
      await this.prisma.carpetaPermiso.createMany({ data: permisosData });
    }

    const rutaFisica = await this.obtenerRutaFisica(nuevaCarpeta.id);

    if (!fs.existsSync(rutaFisica)) {
      fs.mkdirSync(rutaFisica, { recursive: true });
    }

    return this.prisma.carpeta.findUnique({
      where: { id: nuevaCarpeta.id },
      include: { permisos: true },
    });
  }

  findAll() {
    return this.prisma.carpeta.findMany();
  }

  findOne(id: number) {
    return this.prisma.carpeta.findUnique({
      where: { id },
      include: { permisos: true },
    });
  }

  async update(id: number, data: any) {
    const { permisos, ...carpetaData } = data;

    const updated = await this.prisma.carpeta.update({
      where: { id },
      data: carpetaData,
    });

    if (Array.isArray(permisos)) {
      await this.prisma.carpetaPermiso.deleteMany({ where: { carpeta_id: id } });
      if (permisos.length > 0) {
        const permisosData = permisos.map((p: any) => ({
          carpeta_id: id,
          departamento_id: p.departamento_id || null,
          persona_id: p.persona_id || null,
          nivel_permiso: p.nivel_permiso ?? 1,
          permiso_docs: p.permiso_docs ?? false,
          permiso_carpetas: p.permiso_carpetas ?? false,
        }));
        await this.prisma.carpetaPermiso.createMany({ data: permisosData });
      }
    }

    return this.prisma.carpeta.findUnique({
      where: { id },
      include: { permisos: true },
    });
  }

  async remove(id: number) {
    return this.prisma.carpeta.delete({
      where: { id },
    });
  }
}