import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';

@Injectable()
export class PuestosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPuestoDto: CreatePuestoDto) {
    const existe = await this.prisma.puesto.findUnique({
      where: { codigo: createPuestoDto.codigo },
    });
    if (existe) throw new ConflictException('El código del puesto ya existe');

    return this.prisma.puesto.create({ data: createPuestoDto });
  }

  findAll() {
    return this.prisma.puesto.findMany({
      orderBy: { orden: 'asc' },
      include: {
        padre: { select: { id: true, nombre: true } },
      },
    });
  }

  async findOne(id: number) {
    const puesto = await this.prisma.puesto.findUnique({
      where: { id },
      include: {
        padre: { select: { id: true, nombre: true } },
        hijos: { select: { id: true, nombre: true, activo: true } },
      },
    });
    if (!puesto) throw new NotFoundException(`Puesto con ID ${id} no encontrado`);
    return puesto;
  }

  async update(id: number, updatePuestoDto: UpdatePuestoDto) {
    await this.findOne(id);
    
    // Evitar dependencia circular (un puesto no puede depender de sí mismo)
    if (updatePuestoDto.dependencia_id === id) {
      throw new ConflictException('Un puesto no puede depender de sí mismo');
    }

    return this.prisma.puesto.update({
      where: { id },
      data: updatePuestoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.puesto.update({
      where: { id },
      data: { activo: false },
    });
  }
}