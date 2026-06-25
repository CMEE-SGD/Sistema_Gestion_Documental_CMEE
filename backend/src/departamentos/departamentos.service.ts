import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartamentoDto: CreateDepartamentoDto) {
    const existe = await this.prisma.departamento.findUnique({
      where: { codigo: createDepartamentoDto.codigo },
    });
    if (existe) throw new ConflictException('El código del departamento ya existe');

    return this.prisma.departamento.create({ data: createDepartamentoDto });
  }

  findAll() {
    return this.prisma.departamento.findMany({
      orderBy: { orden: 'asc' },
      include: {
        puestos_asignados: { 
          where: { activo: true },
          // AÑADIR ESTE BLOQUE INCLUDE
          include: {
            persona: { select: { id: true, nombre: true, apellidos: true } },
            puesto: { select: { nombre: true } }
          }
        }
      }
    });
  }

  async findOne(id: number) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
      include: {
        padre: { select: { nombre: true } },
        responsable: { select: { nombre: true, apellidos: true } },
        puestos_asignados: { 
          where: { activo: true },
          include: {
            persona: { select: { id: true, nombre: true, apellidos: true } },
            puesto: { select: { nombre: true } } 
          }
        }
      },
    });
    if (!departamento) throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    return departamento;
  }

  async update(id: number, updateDepartamentoDto: UpdateDepartamentoDto) {
    await this.findOne(id);
    if (updateDepartamentoDto.dependencia_id === id) {
      throw new ConflictException('Un departamento no puede depender de sí mismo');
    }

    return this.prisma.departamento.update({
      where: { id },
      data: updateDepartamentoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.departamento.update({
      where: { id },
      data: { activo: false },
    });
  }
}