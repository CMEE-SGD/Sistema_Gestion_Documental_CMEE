import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { isRestrictedToLab } from '../common/helpers/lab-scope';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServicioDto) {
    return this.prisma.servicio.create({ data });
  }

  async findAll(user?: HydratedUser) {
    if (user?.isGod) {
      return this.prisma.servicio.findMany({
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

    return this.prisma.servicio.findMany({
      where,
      include: {
        laboratorio: { select: { nombre: true, codigo: true } },
      },
    });
  }

  async findOne(id: number, user?: HydratedUser) {
    if (user?.isGod) {
      const servicio = await this.prisma.servicio.findUnique({
        where: { id },
        include: { laboratorio: true },
      });
      if (!servicio)
        throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
      return servicio;
    }

    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = isRestrictedToLab(puesto)
      ? { id, laboratorio_id: labId ?? -1 }
      : { id };

    const servicio = await this.prisma.servicio.findFirst({
      where,
      include: { laboratorio: true },
    });

    if (!servicio)
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    return servicio;
  }

  async update(id: number, data: UpdateServicioDto) {
    await this.findOne(id);
    return this.prisma.servicio.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.servicio.update({
      where: { id },
      data: { activo: false },
    });
  }
}
