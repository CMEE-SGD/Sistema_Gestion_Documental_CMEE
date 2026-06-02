import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPersonaDto: CreatePersonaDto) {
    const { roles, puestos_asignados, ...personaData } = createPersonaDto;

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
        
        roles: roles?.length > 0 ? {
          connect: roles.map(id => ({ id }))
        } : undefined,

        // CORRECCIÓN: Usamos connect para las llaves foráneas y agregamos orden_puesto
        puestos: puestos_asignados?.length > 0 ? {
          create: puestos_asignados.map((puesto, index) => ({
            orden_puesto: index + 1,
            departamento: { connect: { id: puesto.departamento_id } },
            puesto: { connect: { id: puesto.puesto_id } }
          }))
        } : undefined
      },
      include: { 
        roles: true,
        puestos: true
      },
    });
  }

  findAll() {
    return this.prisma.persona.findMany({
      include: { 
        roles: { select: { id: true, nombre: true } },
        puestos: { include: { puesto: true, departamento: true } },
        usuario: { select: { nombre_usuario: true, estado_cuenta: true } }

      },
    });
  }

  async findOne(id: number) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: { 
        roles: { select: { id: true, nombre: true } },
        puestos: { include: { puesto: true, departamento: true } },
        usuario: { select: { nombre_usuario: true, estado_cuenta: true } }
      },
    });
    if (!persona) throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    await this.findOne(id);
    const { roles, puestos_asignados, ...personaData } = updatePersonaDto;

    if (puestos_asignados) {
      await this.prisma.personaPuesto.deleteMany({ where: { persona_id: id } });
    }

    return this.prisma.persona.update({
      where: { id },
      data: {
        ...personaData,
        fecha_nacimiento: personaData.fecha_nacimiento ? new Date(personaData.fecha_nacimiento) : undefined,
        
        roles: roles ? { set: roles.map(id => ({ id })) } : undefined,

        // CORRECCIÓN: Aplicamos la misma estructura de connect y orden_puesto
        puestos: puestos_asignados ? {
          create: puestos_asignados.map((puesto, index) => ({
            orden_puesto: index + 1,
            departamento: { connect: { id: puesto.departamento_id } },
            puesto: { connect: { id: puesto.puesto_id } }
          }))
        } : undefined
      },
      include: { 
        roles: true,
        puestos: { include: { puesto: true, departamento: true } }
      },
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