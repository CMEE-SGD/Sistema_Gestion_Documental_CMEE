import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { isRestrictedToLab } from '../common/helpers/lab-scope';

/** Módulo controlador o servicio para gestionar la entidad Laboratorios. */
@Injectable()
export class LaboratoriosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLaboratorioDto) {
    return this.prisma.laboratorio.create({
      data,
    });
  }

  // Candidatos válidos para "Responsable Técnico": personas activas con un
  // puesto activo de Observador Técnico (OBT). Si se pasa laboratorioId
  // (edición de un laboratorio existente), se restringe a los OBT cuyo
  // departamento pertenece a ese laboratorio; al crear un laboratorio nuevo
  // todavía no hay departamentos ligados a él, así que se listan todos los
  // OBT del sistema.
  async getCandidatosResponsable(laboratorioId?: number) {
    return this.prisma.persona.findMany({
      where: {
        estado: 'ACTIVO',
        puestos: {
          some: {
            activo: true,
            puesto: { nombre: { contains: 'Observador Técnico' } },
            ...(laboratorioId
              ? { departamento: { laboratorio_id: laboratorioId } }
              : {}),
          },
        },
      },
      select: { id: true, nombre: true, apellidos: true },
      orderBy: [{ nombre: 'asc' }, { apellidos: 'asc' }],
    });
  }

  async findAll(user?: HydratedUser) {
    if (user?.isGod) {
      return this.prisma.laboratorio.findMany({
        include: {
          responsable: { select: { nombre: true, apellidos: true } },
          equipos: true,
          servicios: true,
        },
      });
    }

    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = isRestrictedToLab(puesto)
      ? { id: labId ?? -1 }
      : undefined;

    return this.prisma.laboratorio.findMany({
      where,
      include: {
        responsable: { select: { nombre: true, apellidos: true } },
        equipos: true,
        servicios: true,
      },
    });
  }

  async findOne(id: number, user?: HydratedUser) {
    if (user?.isGod) {
      const laboratorio = await this.prisma.laboratorio.findUnique({
        where: { id },
        include: { responsable: true, equipos: true, servicios: true },
      });
      if (!laboratorio)
        throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
      return laboratorio;
    }

    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = isRestrictedToLab(puesto)
      ? { id, AND: labId ? { id: labId } : { id: -1 } }
      : { id };

    const laboratorio = await this.prisma.laboratorio.findFirst({
      where,
      include: { responsable: true, equipos: true, servicios: true },
    });

    if (!laboratorio)
      throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    return laboratorio;
  }

  async update(
    id: number,
    data: UpdateLaboratorioDto,
    user?: HydratedUser,
  ) {
    await this.findOne(id);
    if (
      user &&
      isRestrictedToLab(user.puesto ?? '') &&
      user.laboratorio_id !== id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este laboratorio',
      );
    }
    // El campo `activo` solo se cambia a través de remove()/reactivar(),
    // que exigen nivel 5 — así edición (nivel 4) nunca puede usarse como
    // puerta trasera para desactivar o reactivar.
    const { activo: _activo, ...resto } = data;
    return this.prisma.laboratorio.update({
      where: { id },
      data: resto,
    });
  }

  async remove(id: number, user?: HydratedUser) {
    await this.findOne(id);
    if (
      user &&
      isRestrictedToLab(user.puesto ?? '') &&
      user.laboratorio_id !== id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para desactivar este laboratorio',
      );
    }
    return this.prisma.laboratorio.update({
      where: { id },
      data: { activo: false },
    });
  }

  async reactivar(id: number, user?: HydratedUser) {
    await this.findOne(id);
    if (
      user &&
      isRestrictedToLab(user.puesto ?? '') &&
      user.laboratorio_id !== id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para reactivar este laboratorio',
      );
    }
    return this.prisma.laboratorio.update({
      where: { id },
      data: { activo: true },
    });
  }
}
