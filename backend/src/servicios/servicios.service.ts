import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

/** Módulo controlador o servicio para gestionar la entidad Servicios. */
@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  /**
     * Ejecuta la operación de negocio create.
     * @param data - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async create(data: CreateServicioDto) {
    return this.prisma.servicio.create({ data });
  }

  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Objeto complejo / PrismaResponse
     */
    async findAll() {
    return this.prisma.servicio.findMany({
      //where: { activo: true },
      include: { 
        laboratorio: { select: { nombre: true, codigo: true } } 
      },
    });
  }

  /**
     * Ejecuta la operación de negocio findOne.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async findOne(id: number) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id },
      include: { laboratorio: true },
    });
    if (!servicio) throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    return servicio;
  }

  /**
     * Ejecuta la operación de negocio update.
     * @param id - Datos o identificador requerido (number)
     * @param data - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async update(id: number, data: UpdateServicioDto) {
    await this.findOne(id);
    return this.prisma.servicio.update({
      where: { id },
      data,
    });
  }

  /**
     * Ejecuta la operación de negocio remove.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async remove(id: number) {
    await this.findOne(id);
    // Soft delete
    return this.prisma.servicio.update({
      where: { id },
      data: { activo: false },
    });
  }
}