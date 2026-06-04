import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) { }

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
    return path.join('uploads', 'Gestor_Documental', ...partes);
  }

  async create(file: Express.Multer.File, data: any) {
    const carpetaId = parseInt(data.carpeta_id, 10);

    const rutaDestinoRelativa = await this.obtenerRutaFisica(carpetaId);
    const rutaDestinoAbsoluta = path.resolve(process.cwd(), rutaDestinoRelativa);
    
    if (!fs.existsSync(rutaDestinoAbsoluta)) {
      fs.mkdirSync(rutaDestinoAbsoluta, { recursive: true });
    }

    const nombreArchivo = file.filename;
    const rutaFisicaFinal = path.join(rutaDestinoAbsoluta, nombreArchivo);
    
    fs.renameSync(file.path, rutaFisicaFinal); 

    const urlParaBD = path.join(rutaDestinoRelativa, nombreArchivo).replace(/\\/g, '/');

    return this.prisma.documento.create({
      data: {
        archivo_url: urlParaBD,
        nombre: data.nombre,
        version: data.version,
        empresa: data.empresa,
        circuito: data.circuito as any,
        fecha_documento: data.fecha_documento ? new Date(data.fecha_documento) : null,
        activo: data.activo === 'true',
        propietario: data.propietario,
        carpeta_id: carpetaId,
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

  async update(id: number, data: any) {
    const documentoAntiguo = await this.prisma.documento.findUnique({ where: { id } });

    if (data.carpeta_id && documentoAntiguo && documentoAntiguo.carpeta_id !== data.carpeta_id) {
      const rutaAntiguaAbsoluta = path.resolve(process.cwd(), documentoAntiguo.archivo_url);
      const nuevaRutaRelativa = await this.obtenerRutaFisica(data.carpeta_id);
      const nuevaRutaAbsoluta = path.resolve(process.cwd(), nuevaRutaRelativa);
      
      if (!fs.existsSync(nuevaRutaAbsoluta)) fs.mkdirSync(nuevaRutaAbsoluta, { recursive: true });

      const nombreArchivo = path.basename(documentoAntiguo.archivo_url);
      const rutaFisicaFinal = path.join(nuevaRutaAbsoluta, nombreArchivo);

      if (fs.existsSync(rutaAntiguaAbsoluta)) {
        fs.renameSync(rutaAntiguaAbsoluta, rutaFisicaFinal);
        data.archivo_url = path.join(nuevaRutaRelativa, nombreArchivo).replace(/\\/g, '/');
      }
    }

    return this.prisma.documento.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
    });

    if (!documento) throw new NotFoundException(`El documento con ID ${id} no existe.`);

    const documentoEliminado = await this.prisma.documento.delete({
      where: { id },
    });

    if (documento.archivo_url) {
      const filePath = path.resolve(documento.archivo_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath); 
        } catch (error) {
          console.error(`Error al intentar eliminar el archivo físico: ${filePath}`, error);
        }
      }
    }

    return documentoEliminado;
  }
}