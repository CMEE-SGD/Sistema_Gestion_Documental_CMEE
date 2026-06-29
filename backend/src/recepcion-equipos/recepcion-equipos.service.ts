import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecepcionEquipoDto } from './dto/create-recepcion-equipo.dto';
import { UpdateRecepcionEquipoDto } from './dto/update-recepcion-equipo.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { EstadoRecepcion } from '@prisma/client';

const INCLUDE_RELATIONS = {
  cliente: { select: { id: true, nombre: true, tipo: true } },
  laboratorio: { select: { id: true, nombre: true, responsable_id: true } },
  tecnico: { select: { id: true, nombre: true, apellidos: true } },
};

@Injectable()
export class RecepcionEquiposService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateRecepcionEquipoDto) {
    const existeOrden = await this.prisma.recepcionEquipo.findUnique({
      where: { orden_trabajo_fisica: createDto.orden_trabajo_fisica },
    });

    if (existeOrden) {
      throw new ConflictException(
        `La Orden Física #${createDto.orden_trabajo_fisica} ya está registrada en el sistema.`,
      );
    }

    return this.prisma.recepcionEquipo.create({
      data: createDto,
      include: INCLUDE_RELATIONS,
    });
  }

  async findAll(user?: { id: number; isGod?: boolean }) {
    // 1. Si es GOD_MODE, retorna todo sin filtro
    if (user?.isGod) {
      return this.prisma.recepcionEquipo.findMany({
        orderBy: { fecha_ingreso: 'desc' },
        include: INCLUDE_RELATIONS,
      });
    }

    // 2. Para usuarios normales, determinar el filtro según su puesto
    let where: any = undefined;

    if (user?.id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          persona: {
            select: {
              id: true,
              puestos: {
                where: { activo: true },
                select: {
                  puesto: { select: { nombre: true } },
                  departamento: {
                    select: {
                      laboratorio: { select: { id: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const puestos = usuario?.persona?.puestos ?? [];
      const nombresPuestos = puestos.map((p) => p.puesto?.nombre);

      const esJDT = nombresPuestos.includes('Jefe de Departamento Técnico');
      const esOBT = nombresPuestos.includes('Observador Técnico');

      if (esJDT) {
        // JDT ve todos los registros — sin filtro
        where = undefined;
      } else if (esOBT) {
        // OBT ve solo los registros de su laboratorio
        const labId = puestos[0]?.departamento?.laboratorio?.id ?? null;
        if (labId) {
          where = { laboratorio_id: labId };
        }
      }
    }

    return this.prisma.recepcionEquipo.findMany({
      where,
      orderBy: { fecha_ingreso: 'desc' },
      include: INCLUDE_RELATIONS,
    });
  }

  async findOne(id: number) {
    const recepcion = await this.prisma.recepcionEquipo.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });

    if (!recepcion) {
      throw new NotFoundException(`Recepción con ID ${id} no encontrada`);
    }
    return recepcion;
  }

  async update(id: number, updateDto: UpdateRecepcionEquipoDto) {
    await this.findOne(id);
    return this.prisma.recepcionEquipo.update({
      where: { id },
      data: updateDto,
      include: INCLUDE_RELATIONS,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.recepcionEquipo.delete({
      where: { id },
    });
  }

  findPendientesByLaboratorio(laboratorioId: number) {
    return this.prisma.recepcionEquipo.findMany({
      where: {
        laboratorio_id: laboratorioId,
        estado: { not: 'FINALIZADO' },
      },
      orderBy: { fecha_ingreso: 'desc' },
      include: INCLUDE_RELATIONS,
    });
  }

  findPendientesByTecnico(tecnicoId: number) {
    return this.prisma.recepcionEquipo.findMany({
      where: {
        tecnico_id: tecnicoId,
        estado: 'EN_CALIBRACION',
      },
      orderBy: { fecha_ingreso: 'desc' },
      include: INCLUDE_RELATIONS,
    });
  }

  async asignarTecnico(id: number, dto: AsignarTecnicoDto) {
    await this.findOne(id);
    return this.prisma.recepcionEquipo.update({
      where: { id },
      data: {
        tecnico_id: dto.tecnico_id,
        estado: EstadoRecepcion.EN_CALIBRACION,
      },
      include: INCLUDE_RELATIONS,
    });
  }
}
