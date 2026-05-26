import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AplicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(nombre: string, descripcion?: string) {
    const existe = await this.prisma.aplicacion.findUnique({ where: { nombre } });
    if (existe) throw new ConflictException('La aplicación ya existe');

    return this.prisma.aplicacion.create({
      data: { nombre, descripcion },
    });
  }

  findAll() {
    return this.prisma.aplicacion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
  }

  async remove(id: number) {
    const app = await this.prisma.aplicacion.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Aplicación no encontrada');
    
    return this.prisma.aplicacion.update({
      where: { id },
      data: { activo: false }
    });
  }
}