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

/** Módulo controlador o servicio para gestionar la entidad Personas. */
@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) { }

  /**
     * Ejecuta la operación de negocio create.
     * @param createPersonaDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Array<Entidad>
     */
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

  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Array<Entidad>
     */
    findAll() {
    return this.prisma.persona.findMany({
      include: {
        roles: { select: { id: true, nombre: true } },
        puestos: { include: { puesto: true, departamento: true } },
        usuario: { select: { nombre_usuario: true, estado_cuenta: true } }
      },
    });
  }

  /**
     * Ejecuta la operación de negocio findOne.
     * @param id - Datos o identificador requerido (number)
     * @returns Array<Entidad>
     */
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

  /**
     * Ejecuta la operación de negocio eliminarDocumento.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
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

  /**
     * Ejecuta la operación de negocio update.
     * @param id - Datos o identificador requerido (number)
     * @param updatePersonaDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Array<Entidad>
     */
    async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    // 1. Extraemos los datos que NO pertenecen a la tabla Persona
    const { 
      eliminar_foto, 
      roles, 
      puestos_asignados, 
      ...datosBasicosPrisma 
    } = updatePersonaDto;

    // 2. Si el usuario pidió eliminar la foto, seteamos la ruta en null
    if (eliminar_foto === 'true' || eliminar_foto === true) {
      datosBasicosPrisma.foto_ruta = null;
    }

    // 3. Limpiamos los puestos anteriores
    await this.prisma.personaPuesto.deleteMany({ where: { persona_id: id } });

    // 4. Actualizamos pasando solo los datos que Prisma reconoce
    return this.prisma.persona.update({
      where: { id },
      data: {
        ...datosBasicosPrisma,
        
        // 👇 SOLUCIÓN: Validamos y convertimos explícitamente a Date o Null
        cedula_identidad: emptyToNull(datosBasicosPrisma.cedula_identidad),
        fecha_nacimiento: datosBasicosPrisma.fecha_nacimiento 
          ? new Date(datosBasicosPrisma.fecha_nacimiento) 
          : null,

        // Actualizamos las relaciones de roles
        roles: {
          set: roles ? roles.map(rolId => ({ id: rolId })) : []
        }
      },
      include: {
        roles: true,
        puestos: {
          include: {
            puesto: true,
            departamento: true
          }
        }
      }
    });
  }

  /**
     * Ejecuta la operación de negocio guardarDocumentos.
     * @param documentos - Datos o identificador requerido (any[])
     * @returns Entidad | PrismaResponse
     */
    async guardarDocumentos(documentos: any[]) {
    return await this.prisma.documentoPersona.createMany({
      data: documentos,
    });
  }

  /**
     * Ejecuta la operación de negocio remove.
     * @param id - Datos o identificador requerido (number)
     * @returns Entidad | PrismaResponse
     */
    async remove(id: number) {
    await this.findOne(id);
    return this.prisma.persona.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }
}