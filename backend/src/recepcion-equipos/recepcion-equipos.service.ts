import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecepcionEquipoDto } from './dto/create-recepcion-equipo.dto';
import { UpdateRecepcionEquipoDto } from './dto/update-recepcion-equipo.dto';

@Injectable()
export class RecepcionEquiposService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateRecepcionEquipoDto) {
    // Validar que no ingresen dos veces el mismo número rojo impreso
    const existeOrden = await this.prisma.recepcionEquipo.findUnique({
      where: { orden_trabajo_fisica: createDto.orden_trabajo_fisica },
    });

    if (existeOrden) {
      throw new ConflictException(`La Orden Física #${createDto.orden_trabajo_fisica} ya está registrada en el sistema.`);
    }

    return this.prisma.recepcionEquipo.create({
      data: createDto,
      include: {
        cliente: true,
        laboratorio: true,
      }
    });
  }

  findAll() {
    // Retornamos las recepciones más recientes primero (DESC) e incluimos las relaciones
    // para que el frontend pueda mostrar req.cliente.nombre y req.laboratorio.nombre
    return this.prisma.recepcionEquipo.findMany({
      orderBy: { fecha_ingreso: 'desc' },
      include: {
        cliente: {
          select: { id: true, nombre: true, tipo: true }
        },
        laboratorio: {
          select: { id: true, nombre: true }
        }
      },
    });
  }

  async findOne(id: number) {
    const recepcion = await this.prisma.recepcionEquipo.findUnique({
      where: { id },
      include: { cliente: true, laboratorio: true },
    });
    
    if (!recepcion) {
      throw new NotFoundException(`Recepción con ID ${id} no encontrada`);
    }
    return recepcion;
  }

  async update(id: number, updateDto: UpdateRecepcionEquipoDto) {
    await this.findOne(id); // Validar existencia
    return this.prisma.recepcionEquipo.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.recepcionEquipo.delete({
      where: { id },
    });
  }
}