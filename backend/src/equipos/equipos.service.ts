import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta si es necesario
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

@Injectable()
export class EquiposService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEquipoDto) {
    return this.prisma.equipo.create({ data });
  }

  async findAll() {
    return this.prisma.equipo.findMany({
      //where: { activo: true },
      // Traemos el nombre y código del laboratorio asociado
      include: { 
        laboratorio: { select: { nombre: true, codigo: true } } 
      },
    });
  }

  async findOne(id: number) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id },
      include: { laboratorio: true },
    });
    if (!equipo) throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    return equipo;
  }

  async update(id: number, data: UpdateEquipoDto) {
    await this.findOne(id); // Valida existencia
    return this.prisma.equipo.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Soft delete para mantener la trazabilidad de los certificados calibrados con este equipo
    return this.prisma.equipo.update({
      where: { id },
      data: { activo: false },
    });
  }
}