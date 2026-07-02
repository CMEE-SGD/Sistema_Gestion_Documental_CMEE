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
    return this.prisma.laboratorio.update({
      where: { id },
      data,
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
}
