import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRolDto: CreateRolDto) {
    // Validar código único a nivel de servicio
    const existe = await this.prisma.rol.findUnique({ where: { codigo: createRolDto.codigo } });
    if (existe) throw new ConflictException('El código del rol ya existe');

    return this.prisma.rol.create({ data: createRolDto });
  }

  findAll() {
  return this.prisma.rol.findMany({
    orderBy: { orden: 'asc' },
    include: {
      personas: {
        select: {
          nombre: true,
          apellidos: true,
          codigo: true, // Importante para el código entre paréntesis
        },
      },
    },
  });
}

  async findOne(id: number) {
    const rol = await this.prisma.rol.findUnique({ where: { id } });
    if (!rol) throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    await this.findOne(id); // Valida si existe
    return this.prisma.rol.update({
      where: { id },
      data: updateRolDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Valida si existe
    // Soft delete recomendado para RRHH
    return this.prisma.rol.update({
      where: { id },
      data: { activo: false },
    });
  }
}