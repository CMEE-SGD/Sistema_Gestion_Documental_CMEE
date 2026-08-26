import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { isRestrictedToLab } from '../common/helpers/lab-scope';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServicioDto) {
    try {
      return await this.prisma.servicio.create({ data });
    } catch (error: any) {
      throw new BadRequestException(
        'Error al crear el servicio: ' + (error.message || 'Error de base de datos')
      );
    }
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

  async update(id: number, data: UpdateServicioDto, user?: HydratedUser) {
    await this.findOne(id, user);
    // El campo `activo` solo se cambia a través de remove()/reactivar(),
    // que exigen nivel 5 — así edición (nivel 4) nunca puede usarse como
    // puerta trasera para desactivar o reactivar.
    const { activo: _activo, ...resto } = data;
    try {
      return await this.prisma.servicio.update({
        where: { id },
        data: resto,
      });
    } catch (error: any) {
      throw new BadRequestException(
        'Error al actualizar el servicio: ' + (error.message || 'Error de base de datos')
      );
    }
  }

  async remove(id: number, user?: HydratedUser) {
    await this.findOne(id, user);
    return this.prisma.servicio.update({
      where: { id },
      data: { activo: false },
    });
  }

  async reactivar(id: number, user?: HydratedUser) {
    await this.findOne(id, user);
    return this.prisma.servicio.update({
      where: { id },
      data: { activo: true },
    });
  }
}
