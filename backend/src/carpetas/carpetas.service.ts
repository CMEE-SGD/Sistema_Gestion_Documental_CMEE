import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CarpetasService {
  constructor(private prisma: PrismaService) {}

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

  findAll() {
    return this.prisma.carpeta.findMany();
  }

  findOne(id: number) {
    return this.prisma.carpeta.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.carpeta.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    return this.prisma.carpeta.delete({
      where: { id },
    });
  }
}