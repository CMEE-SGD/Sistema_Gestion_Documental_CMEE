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
// ── Función utilitaria (agregar al tope del archivo, fuera de la clase) ──

export class PersonasService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createPersonaDto: CreatePersonaDto) {
    const { roles, puestos_asignados, ...personaData } = createPersonaDto;

    personaData.cedula_identidad = emptyToNull(personaData.cedula_identidad);
    personaData.codigo = emptyToNull(personaData.codigo);

    if (personaData.cedula_identidad) {
      const existeCedula = await this.prisma.persona.findUnique({
        where: { cedula_identidad: personaData.cedula_identidad }
      });
      if (existeCedula) throw new ConflictException('La cédula de identidad ya está registrada');
    }

    if (personaData.codigo) {
      const existeCodigo = await this.prisma.persona.findUnique({
        where: { codigo: personaData.codigo }
      });
      if (existeCodigo) throw new ConflictException('El código de persona ya existe');
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

        // ✅ FILTRAR puestos con IDs válidos
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
        documentos: true // <--- ¡AÑADE ESTA LÍNEA!
      },
    });
    if (!persona) throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    return persona;
  }

  // 👇 VERSIÓN MEJORADA: Borra de la BD y del disco duro
  async eliminarDocumento(id: number) {
    const documento = await this.prisma.documentoPersona.findUnique({ where: { id } });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // 1. Borrar el archivo físico del disco duro
    try {
      // Como guardamos la ruta en Prisma empezando con "/" (ej. /uploads/documentosPersona/...), 
      // le quitamos ese primer slash para que Node.js no se confunda buscando en la raíz del disco C:
      const rutaRelativa = documento.ruta.startsWith('/') ? documento.ruta.substring(1) : documento.ruta;

      // join(process.cwd(), ...) nos da la ruta exacta de la carpeta de tu proyecto backend
      const rutaFisica = join(process.cwd(), rutaRelativa);

      // Verificamos si el archivo realmente existe antes de intentar borrarlo
      if (fs.existsSync(rutaFisica)) {
        fs.unlinkSync(rutaFisica); // ¡Esta es la línea mágica que borra el PDF de la carpeta uploads!
      }
    } catch (error) {
      // Si por alguna razón falla el borrado del archivo (ej. alguien lo borró manualmente),
      // solo lo imprimimos en consola pero NO detenemos la ejecución.
      console.error(`Aviso: No se pudo borrar el archivo físico en ${documento.ruta}`, error);
    }

    // 2. Borrar el registro de la base de datos (Prisma)
    return await this.prisma.documentoPersona.delete({
      where: { id },
    });
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    await this.findOne(id);
    const { roles, puestos_asignados, ...personaData } = updatePersonaDto;
    personaData.cedula_identidad = emptyToNull(personaData.cedula_identidad);
    personaData.codigo = emptyToNull(personaData.codigo);
    if (puestos_asignados) {
      await this.prisma.personaPuesto.deleteMany({ where: { persona_id: id } });
    }
    return this.prisma.persona.update({
      where: { id },
      data: {
        ...personaData,
        fecha_nacimiento: personaData.fecha_nacimiento ? new Date(personaData.fecha_nacimiento) : undefined,

        roles: roles ? { set: roles.map(id => ({ id })) } : undefined,

        // ✅ FILTRAR puestos válidos (que tengan departamento_id y puesto_id)
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

  // En el archivo personas.service.ts
  async guardarDocumentos(documentos: any[]) {
    // Usamos prisma para insertar varios registros de una vez
    return await this.prisma.documentoPersona.createMany({
      data: documentos,
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