import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServicioDto) {
    return this.prisma.servicio.create({ data });
  }

  async findAll() {
    return this.prisma.servicio.findMany({
      //where: { activo: true },
      include: { 
        laboratorio: { select: { nombre: true, codigo: true } } 
      },
    });
  }

  async findOne(id: number) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id },
      include: { laboratorio: true },
    });
    if (!servicio) throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
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
    // Soft delete
    return this.prisma.servicio.update({
      where: { id },
      data: { activo: false },
    });
  }
}