import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Módulo controlador o servicio para gestionar la entidad Aplicaciones. */
@Injectable()
export class AplicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta la operación de negocio create.
   * @param nombre - Datos o identificador requerido (string)
   * @param descripcion - Datos o identificador requerido (string)
   * @returns Objeto complejo / PrismaResponse
   */
  async create(nombre: string, descripcion?: string) {
    const existe = await this.prisma.aplicacion.findUnique({
      where: { nombre },
    });
    if (existe) throw new ConflictException('La aplicación ya existe');

    return this.prisma.aplicacion.create({
      data: { nombre, descripcion },
    });
  }

  /**
   * Ejecuta la operación de negocio findAll.
   * @returns Array<Entidad>
   */
  findAll() {
    return this.prisma.aplicacion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Ejecuta la operación de negocio remove.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async remove(id: number) {
    const app = await this.prisma.aplicacion.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Aplicación no encontrada');

    return this.prisma.aplicacion.update({
      where: { id },
      data: { activo: false },
    });
  }
}
