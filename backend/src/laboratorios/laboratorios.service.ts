import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';

/** Módulo controlador o servicio para gestionar la entidad Laboratorios. */
@Injectable()
export class LaboratoriosService {
  constructor(private prisma: PrismaService) {}

  /**
     * Ejecuta la operación de negocio create.
     * @param data - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async create(data: CreateLaboratorioDto) {
    return this.prisma.laboratorio.create({
      data,
    });
  }

  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Array<Entidad>
     */
    async findAll() {
    return this.prisma.laboratorio.findMany({
      //where: { activo: true },
      // Traemos los datos relacionados principales
      include: { 
        responsable: { select: { nombre: true, apellidos: true } }, 
        equipos: true, 
        servicios: true 
      },
    });
  }

  /**
     * Ejecuta la operación de negocio findOne.
     * @param id - Datos o identificador requerido (number)
     * @returns Array<Entidad>
     */
    async findOne(id: number) {
    const laboratorio = await this.prisma.laboratorio.findUnique({
      where: { id },
      include: { responsable: true, equipos: true, servicios: true },
    });

    if (!laboratorio) throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    return laboratorio;
  }

  /**
     * Ejecuta la operación de negocio update.
     * @param id - Datos o identificador requerido (number)
     * @param data - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async update(id: number, data: UpdateLaboratorioDto) {
    await this.findOne(id); // Verificamos que exista
    return this.prisma.laboratorio.update({
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
    // Soft delete: no borramos el registro, solo lo desactivamos por trazabilidad
    return this.prisma.laboratorio.update({
      where: { id },
      data: { activo: false },
    });
  }
}