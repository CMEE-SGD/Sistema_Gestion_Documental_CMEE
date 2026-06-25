import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

/** Módulo controlador o servicio para gestionar la entidad Carpetas. */
@Injectable()
export class CarpetasService {
  constructor(private prisma: PrismaService) {}

  /**
     * Ejecuta la operación de negocio obtenerRutaFisica.
     * @param carpetaId - Datos o identificador requerido (number)
     * @returns Promise<string>
     */
    async obtenerRutaFisica(carpetaId: number): Promise<string> {
    const partes = [];
    let actualId: number | null = carpetaId;

    while (actualId) {
      const carpeta = await this.prisma.carpeta.findUnique({ where: { id: actualId } });
      if (!carpeta) break;
      
      const nombreSeguro = carpeta.nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ -_]/g, '').trim();
      partes.unshift(nombreSeguro);
      
      actualId = carpeta.carpeta_padre_id;
    }

    // 👉 CAMBIO AQUÍ: Añadimos 'uploads' a la ruta principal
    return path.join(process.cwd(), 'uploads', 'Gestor_Documental', ...partes);
  }

  /**
     * Ejecuta la operación de negocio create.
     * @param data - Datos o identificador requerido (any)
     * @returns Entidad | PrismaResponse
     */
    async create(data: any) { 
    const nuevaCarpeta = await this.prisma.carpeta.create({
      data: data,
    });

    const rutaFisica = await this.obtenerRutaFisica(nuevaCarpeta.id);
    
    if (!fs.existsSync(rutaFisica)) {
      fs.mkdirSync(rutaFisica, { recursive: true }); 
    }

    return nuevaCarpeta;
  }

  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Array<Entidad>
     */
    findAll() {
    return this.prisma.carpeta.findMany();
  }

  /**
     * Ejecuta la operación de negocio findOne.
     * @param id - Datos o identificador requerido (number)
     * @returns Entidad | PrismaResponse
     */
    findOne(id: number) {
    return this.prisma.carpeta.findUnique({
      where: { id },
    });
  }

  /**
     * Ejecuta la operación de negocio update.
     * @param id - Datos o identificador requerido (number)
     * @param data - Datos o identificador requerido (any)
     * @returns Entidad | PrismaResponse
     */
    async update(id: number, data: any) {
    return this.prisma.carpeta.update({
      where: { id },
      data: data,
    });
  }

  /**
     * Ejecuta la operación de negocio remove.
     * @param id - Datos o identificador requerido (number)
     * @returns Entidad | PrismaResponse
     */
    async remove(id: number) {
    return this.prisma.carpeta.delete({
      where: { id },
    });
  }
}