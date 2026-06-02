import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) { }

  async create(file: Express.Multer.File, data: any) {
    const filePath = file.path.replace(/\\/g, '/');

    return this.prisma.documento.create({
      data: {
        archivo_url: filePath,
        nombre: data.nombre,
        version: data.version,
        empresa: data.empresa,
        circuito: data.circuito as any,
        fecha_documento: data.fecha_documento ? new Date(data.fecha_documento) : null,
        activo: data.activo === 'true',
        propietario: data.propietario,
        carpeta_id: parseInt(data.carpeta_id, 10),
      },
    });
  }

  findAll(carpetaId?: number) {
    const whereClause = carpetaId ? { carpeta_id: carpetaId } : {};

    return this.prisma.documento.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.documento.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.documento.update({
      where: { id },
      data: data, 
    });
  }

  // Único método remove con toda la lógica completa
  async remove(id: number) {
    // 1. Buscamos el documento en la BD primero para obtener la ruta del PDF
    const documento = await this.prisma.documento.findUnique({
      where: { id },
    });

    if (!documento) {
      throw new NotFoundException(`El documento con ID ${id} no existe.`);
    }

    // 2. Eliminamos el registro de la Base de Datos (PostgreSQL)
    const documentoEliminado = await this.prisma.documento.delete({
      where: { id },
    });

    // 3. Eliminamos el archivo físico del servidor
    if (documento.archivo_url) {
      // Resolvemos la ruta absoluta para evitar problemas de directorios
      const filePath = path.resolve(documento.archivo_url);

      // Verificamos si el archivo físico realmente existe en esa carpeta antes de intentar borrarlo
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath); // Elimina el archivo
          console.log(`Archivo físico eliminado: ${filePath}`);
        } catch (error) {
          // Si hay un error de permisos en el SO, no tumbamos el backend, solo lo registramos
          console.error(`Error al intentar eliminar el archivo físico: ${filePath}`, error);
        }
      } else {
        console.warn(`El archivo físico no se encontró en la ruta: ${filePath}`);
      }
    }

    return documentoEliminado;
  }
}