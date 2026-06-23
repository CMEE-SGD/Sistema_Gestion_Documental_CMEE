import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import * as fs from 'fs';
import { join } from 'path';

function emptyToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  return value.trim() === '' ? null : value.trim();
}

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createPersonaDto: CreatePersonaDto) {
    const { roles, puestos_asignados, ...personaData } = createPersonaDto;

    personaData.cedula_identidad = emptyToNull(personaData.cedula_identidad);

    if (personaData.cedula_identidad) {
      const existeCedula = await this.prisma.persona.findUnique({
        where: { cedula_identidad: personaData.cedula_identidad }
      });
      if (existeCedula) throw new ConflictException('La cédula de identidad ya está registrada');
    }

    return this.prisma.persona.create({
      data: {
        ...personaData,
        fecha_nacimiento: personaData.fecha_nacimiento
          ? new Date(personaData.fecha_nacimiento)
          : null,
        roles: roles?.length > 0
          ? { connect: roles.map(id => ({ id })) }
          : undefined,
        puestos: puestos_asignados?.filter(p => p.departamento_id && p.puesto_id).length > 0
          ? {
            create: puestos_asignados
              .filter(p => p.departamento_id && p.puesto_id)
              .map((puesto, index) => ({
                orden_puesto: index + 1,
                departamento: { connect: { id: Number(puesto.departamento_id) } },
                puesto: { connect: { id: Number(puesto.puesto_id) } }
              }))
          }
          : undefined
      },
      include: { roles: true, puestos: true },
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
        usuario: { select: { nombre_usuario: true, estado_cuenta: true } },
        documentos: true
      },
    });
    if (!persona) throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    return persona;
  }

  async eliminarDocumento(id: number) {
    const documento = await this.prisma.documentoPersona.findUnique({ where: { id } });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    try {
      const rutaRelativa = documento.ruta.startsWith('/') ? documento.ruta.substring(1) : documento.ruta;
      const rutaFisica = join(process.cwd(), rutaRelativa);

      if (fs.existsSync(rutaFisica)) {
        fs.unlinkSync(rutaFisica); 
      }
    } catch (error) {
      console.error(`Aviso: No se pudo borrar el archivo físico en ${documento.ruta}`, error);
    }

    return await this.prisma.documentoPersona.delete({
      where: { id },
    });
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    await this.findOne(id);
    const { roles, puestos_asignados, ...personaData } = updatePersonaDto;
    
    personaData.cedula_identidad = emptyToNull(personaData.cedula_identidad);
    
    if (puestos_asignados) {
      await this.prisma.personaPuesto.deleteMany({ where: { persona_id: id } });
    }
    
    return this.prisma.persona.update({
      where: { id },
      data: {
        ...personaData,
        fecha_nacimiento: personaData.fecha_nacimiento ? new Date(personaData.fecha_nacimiento) : undefined,
        roles: roles ? { set: roles.map(id => ({ id })) } : undefined,
        puestos: puestos_asignados?.filter(p => p.departamento_id && p.puesto_id).length > 0 ? {
          create: puestos_asignados
            .filter(p => p.departamento_id && p.puesto_id)
            .map((puesto, index) => ({
              orden_puesto: index + 1,
              departamento: { connect: { id: Number(puesto.departamento_id) } },
              puesto: { connect: { id: Number(puesto.puesto_id) } }
            }))
        } : undefined
      },
      include: {
        roles: true,
        puestos: { include: { puesto: true, departamento: true } }
      },
    });
  }

  async guardarDocumentos(documentos: any[]) {
    return await this.prisma.documentoPersona.createMany({
      data: documentos,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.persona.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }
}