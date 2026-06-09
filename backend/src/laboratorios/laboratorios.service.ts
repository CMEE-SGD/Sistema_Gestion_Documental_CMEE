import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';

@Injectable()
export class LaboratoriosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLaboratorioDto) {
    return this.prisma.laboratorio.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.laboratorio.findMany({
      where: { activo: true },
      // Traemos los datos relacionados principales
      include: { 
        responsable: { select: { nombre: true, apellidos: true } }, 
        equipos: true, 
        servicios: true 
      },
    });
  }

  async findOne(id: number) {
    const laboratorio = await this.prisma.laboratorio.findUnique({
      where: { id },
      include: { responsable: true, equipos: true, servicios: true },
    });

    if (!laboratorio) throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    return laboratorio;
  }

  async update(id: number, data: UpdateLaboratorioDto) {
    await this.findOne(id); // Verificamos que exista
    return this.prisma.laboratorio.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Soft delete: no borramos el registro, solo lo desactivamos por trazabilidad
    return this.prisma.laboratorio.update({
      where: { id },
      data: { activo: false },
    });
  }
}