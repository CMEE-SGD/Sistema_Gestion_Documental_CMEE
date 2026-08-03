import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { isRestrictedToLab } from '../common/helpers/lab-scope';

@Injectable()
export class EquiposService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEquipoDto) {
    const existeCodigo = await this.prisma.equipo.findUnique({
      where: { codigo: data.codigo },
    });
    if (existeCodigo) {
      throw new ConflictException('Ya existe un equipo con ese código');
    }

    try {
      return await this.prisma.equipo.create({ data });
    } catch (error) {
      // Captura P2002 ante una condición de carrera entre el findUnique y el create
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe un equipo con ese código');
      }
      throw error;
    }
  }

  async findAll(user?: HydratedUser) {
    if (user?.isGod) {
      return this.prisma.equipo.findMany({
        include: {
          laboratorio: { select: { nombre: true, codigo: true } },
        },
      });
    }

    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = isRestrictedToLab(puesto)
      ? { laboratorio_id: labId ?? -1 }
      : undefined;

    return this.prisma.equipo.findMany({
      where,
      include: {
        laboratorio: { select: { nombre: true, codigo: true } },
      },
    });
  }

  async findOne(id: number, user?: HydratedUser) {
    if (user?.isGod) {
      const equipo = await this.prisma.equipo.findUnique({
        where: { id },
        include: { laboratorio: true },
      });
      if (!equipo)
        throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
      return equipo;
    }

    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = isRestrictedToLab(puesto)
      ? { id, laboratorio_id: labId ?? -1 }
      : { id };

    const equipo = await this.prisma.equipo.findFirst({
      where,
      include: { laboratorio: true },
    });

    if (!equipo)
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    return equipo;
  }

  async update(id: number, data: UpdateEquipoDto) {
    await this.findOne(id);

    if (data.codigo) {
      const existeCodigo = await this.prisma.equipo.findUnique({
        where: { codigo: data.codigo },
      });
      if (existeCodigo && existeCodigo.id !== id) {
        throw new ConflictException('Ya existe un equipo con ese código');
      }
    }

    try {
      return await this.prisma.equipo.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe un equipo con ese código');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.equipo.update({
      where: { id },
      data: { activo: false },
    });
  }
}
