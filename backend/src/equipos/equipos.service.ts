import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EstadoEquipo } from '@prisma/client';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { isRestrictedToLab } from '../common/helpers/lab-scope';

const ESTADO_EQUIPO_LABELS: Record<EstadoEquipo, string> = {
  OPERATIVO: 'Operativo',
  EN_CALIBRACION: 'En Calibración',
  FUERA_DE_SERVICIO: 'Fuera de Servicio',
};

@Injectable()
export class EquiposService {
  constructor(private prisma: PrismaService) {}

  // Catálogo del enum EstadoEquipo para que el frontend no tenga que
  // hardcodear las opciones del select — si se agrega un estado nuevo en el
  // schema, este endpoint lo refleja automáticamente.
  getEstados() {
    return Object.values(EstadoEquipo).map((value) => ({
      value,
      label: ESTADO_EQUIPO_LABELS[value],
    }));
  }

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

  async update(id: number, data: UpdateEquipoDto, user?: HydratedUser) {
    await this.findOne(id, user);

    if (data.codigo) {
      const existeCodigo = await this.prisma.equipo.findUnique({
        where: { codigo: data.codigo },
      });
      if (existeCodigo && existeCodigo.id !== id) {
        throw new ConflictException('Ya existe un equipo con ese código');
      }
    }

    // El campo `activo` solo se cambia a través de remove()/reactivar(),
    // que exigen nivel 5 — así edición (nivel 4) nunca puede usarse como
    // puerta trasera para desactivar o reactivar.
    const { activo: _activo, ...resto } = data;

    try {
      return await this.prisma.equipo.update({
        where: { id },
        data: resto,
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

  async remove(id: number, user?: HydratedUser) {
    await this.findOne(id, user);
    return this.prisma.equipo.update({
      where: { id },
      data: { activo: false },
    });
  }

  async reactivar(id: number, user?: HydratedUser) {
    await this.findOne(id, user);
    return this.prisma.equipo.update({
      where: { id },
      data: { activo: true },
    });
  }
}
