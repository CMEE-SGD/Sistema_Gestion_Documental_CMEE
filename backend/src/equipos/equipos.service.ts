import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta si es necesario
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

/** Módulo controlador o servicio para gestionar la entidad Equipos. */
@Injectable()
export class EquiposService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ejecuta la operación de negocio create.
   * @param data - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Entidad | PrismaResponse
   */
  async create(data: CreateEquipoDto) {
    return this.prisma.equipo.create({ data });
  }

  /**
   * Ejecuta la operación de negocio findAll.
   * @returns Array<Entidad>
   */
  async findAll() {
    return this.prisma.equipo.findMany({
      //where: { activo: true },
      // Traemos el nombre y código del laboratorio asociado
      include: {
        laboratorio: { select: { nombre: true, codigo: true } },
      },
    });
  }

  /**
   * Ejecuta la operación de negocio findOne.
   * @param id - Datos o identificador requerido (number)
   * @returns Entidad | PrismaResponse
   */
  async findOne(id: number) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id },
      include: { laboratorio: true },
    });
    if (!equipo)
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    return equipo;
  }

  /**
   * Ejecuta la operación de negocio update.
   * @param id - Datos o identificador requerido (number)
   * @param data - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Entidad | PrismaResponse
   */
  async update(id: number, data: UpdateEquipoDto) {
    await this.findOne(id); // Valida existencia
    return this.prisma.equipo.update({
      where: { id },
      data,
    });
  }

  /**
   * Ejecuta la operación de negocio remove.
   * @param id - Datos o identificador requerido (number)
   * @returns Entidad | PrismaResponse
   */
  async remove(id: number) {
    await this.findOne(id);
    // Soft delete para mantener la trazabilidad de los certificados calibrados con este equipo
    return this.prisma.equipo.update({
      where: { id },
      data: { activo: false },
    });
  }
}
