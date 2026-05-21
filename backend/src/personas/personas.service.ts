import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPersonaDto: CreatePersonaDto) {
    const { roleIds, ...personaData } = createPersonaDto;

    if (personaData.cedula_identidad) {
      const existeCedula = await this.prisma.persona.findUnique({ where: { cedula_identidad: personaData.cedula_identidad } });
      if (existeCedula) throw new ConflictException('La cédula de identidad ya está registrada');
    }

    if (personaData.codigo) {
      const existeCodigo = await this.prisma.persona.findUnique({ where: { codigo: personaData.codigo } });
      if (existeCodigo) throw new ConflictException('El código de persona ya existe');
    }

    return this.prisma.persona.create({
      data: {
        ...personaData,
        fecha_nacimiento: personaData.fecha_nacimiento ? new Date(personaData.fecha_nacimiento) : null,
        // Conecta los múltiples roles en la tabla intermedia implícita
        roles: roleIds ? { connect: roleIds.map(id => ({ id })) } : undefined,
      },
      include: { roles: true },
    });
  }

  findAll() {
    return this.prisma.persona.findMany({
      where: { activo: true },
      include: { roles: { select: { id: true, nombre: true } } },
    });
  }

  async findOne(id: number) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: { 
        roles: { select: { id: true, nombre: true } },
        puestos: { include: { puesto: true, departamento: true } } // Trae su historial de puestos asignados
      },
    });
    if (!persona) throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    await this.findOne(id);
    const { roleIds, ...personaData } = updatePersonaDto;

    return this.prisma.persona.update({
      where: { id },
      data: {
        ...personaData,
        fecha_nacimiento: personaData.fecha_nacimiento ? new Date(personaData.fecha_nacimiento) : undefined,
        // Reemplaza por completo el arreglo de roles anterior por el nuevo
        roles: roleIds ? { set: roleIds.map(id => ({ id })) } : undefined,
      },
      include: { roles: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.persona.update({
      where: { id },
      data: { activo: false },
    });
  }
}