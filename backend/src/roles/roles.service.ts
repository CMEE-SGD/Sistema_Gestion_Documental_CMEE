import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

/** Módulo controlador o servicio para gestionar la entidad Roles. */
@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
     * Ejecuta la operación de negocio create.
     * @param createRolDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async create(createRolDto: CreateRolDto) {
    // Validar código único a nivel de servicio
    const existe = await this.prisma.rol.findUnique({ where: { codigo: createRolDto.codigo } });
    if (existe) throw new ConflictException('El código del rol ya existe');

    return this.prisma.rol.create({ data: createRolDto });
  }

  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Array<Entidad>
     */
    findAll() {
    return this.prisma.rol.findMany({
      orderBy: { orden: 'asc' },
      include: {
        personas: {
          select: {
            nombre: true,
            apellidos: true,
            // El campo codigo fue removido de la BD
          },
        },
      },
    });
  }

  /**
     * Ejecuta la operación de negocio findOne.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async findOne(id: number) {
    const rol = await this.prisma.rol.findUnique({ where: { id } });
    if (!rol) throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    return rol;
  }

  /**
     * Ejecuta la operación de negocio update.
     * @param id - Datos o identificador requerido (number)
     * @param updateRolDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async update(id: number, updateRolDto: UpdateRolDto) {
    await this.findOne(id); // Valida si existe
    return this.prisma.rol.update({
      where: { id },
      data: updateRolDto,
    });
  }

  /**
     * Ejecuta la operación de negocio remove.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async remove(id: number) {
    await this.findOne(id); // Valida si existe
    // Soft delete recomendado para RRHH
    return this.prisma.rol.update({
      where: { id },
      data: { activo: false },
    });
  }
}