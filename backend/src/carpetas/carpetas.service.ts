import { Injectable } from '@nestjs/common';
import { CreateCarpetaDto } from './dto/create-carpeta.dto';
import { UpdateCarpetaDto } from './dto/update-carpeta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarpetasService {
  constructor(private prisma: PrismaService) {}

  create(createCarpetaDto: CreateCarpetaDto) {
    // Guarda la carpeta en la base de datos
    return this.prisma.carpeta.create({
      data: createCarpetaDto,
    });
  }

  findAll() {
    // Devuelve todas las carpetas
    return this.prisma.carpeta.findMany();
  }

  findOne(id: number) {
    return this.prisma.carpeta.findUnique({
      where: { id },
    });
  }

  update(id: number, updateCarpetaDto: UpdateCarpetaDto) {
    return this.prisma.carpeta.update({
      where: { id },
      data: updateCarpetaDto,
    });
  }

  remove(id: number) {
    return this.prisma.carpeta.delete({
      where: { id },
    });
  }
}