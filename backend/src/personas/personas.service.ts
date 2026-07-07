import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta la operación de negocio create.
   * @param createPersonaDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Array<Entidad>
   */
  async create(createPersonaDto: CreatePersonaDto) {
    const { roles, puestos_asignados, activo, ...personaData } = createPersonaDto as any;

    personaData.cedula_identidad = emptyToNull(personaData.cedula_identidad);

    if (personaData.cedula_identidad) {
      const existeCedula = await this.prisma.persona.findUnique({
        where: { cedula_identidad: personaData.cedula_identidad },
      });
      if (existeCedula)
        throw new ConflictException(
          'La cédula de identidad ya está registrada',
        );
    }

    try {
      return await this.prisma.persona.create({
        data: {
          ...personaData,
          fecha_nacimiento: personaData.fecha_nacimiento
            ? new Date(personaData.fecha_nacimiento)
            : null,
          roles:
            roles?.length > 0
              ? { connect: roles.map((id) => ({ id })) }
              : undefined,
          puestos:
            puestos_asignados?.filter((p) => p.departamento_id && p.puesto_id)
              .length > 0
              ? {
                  create: puestos_asignados
                    .filter((p) => p.departamento_id && p.puesto_id)
                    .map((puesto, index) => ({
                      orden_puesto: index + 1,
                      departamento: {
                        connect: { id: Number(puesto.departamento_id) },
                      },
                      puesto: { connect: { id: Number(puesto.puesto_id) } },
                    })),
                }
              : undefined,
        },
        include: { roles: true, puestos: true },
      });
      // PATCH: captura P2002 entre findUnique y create (race condition)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('La cédula de identidad ya está registrada');
      }
      throw error;
    }
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
        usuario: { select: { nombre_usuario: true, estado_cuenta: true } },
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
        documentos: true,
      },
    });
    if (!persona)
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    return persona;
  }

  /**
   * Ejecuta la operación de negocio eliminarDocumento.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async eliminarDocumento(id: number) {
    const documento = await this.prisma.documentoPersona.findUnique({
      where: { id },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    try {
      const rutaRelativa = documento.ruta.startsWith('/')
        ? documento.ruta.substring(1)
        : documento.ruta;
      const rutaFisica = join(process.cwd(), rutaRelativa);

      if (fs.existsSync(rutaFisica)) {
        fs.unlinkSync(rutaFisica);
      }
    } catch (error) {
      console.error(
        `Aviso: No se pudo borrar el archivo físico en ${documento.ruta}`,
        error,
      );
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
    // PATCH: validar existencia antes de actualizar (consistente con remove())
    await this.findOne(id);

    // PATCH: transacción atómica — deleteMany + update se ejecutan o ninguno
    return this.prisma.$transaction(async (tx) => {
      // 1. Extraemos los datos que NO pertenecen a la tabla Persona
      const { eliminar_foto, roles, puestos_asignados, puestos, activo, ...datosBasicosPrisma } =
        updatePersonaDto as any;

      // 2. Si el usuario pidió eliminar la foto, seteamos la ruta en null
      if (eliminar_foto === 'true' || eliminar_foto === true) {
        datosBasicosPrisma.foto_ruta = null;
      }

      // 3. Compatibilidad: el frontend puede enviar 'puestos' (nombre de la relación en Prisma)
      const puestosInput = puestos_asignados ?? puestos;
      const tienePuestos = 'puestos_asignados' in updatePersonaDto || 'puestos' in updatePersonaDto;

      // 4. Solo borramos si el payload trajo puestos explícitamente
      if (tienePuestos) {
        await tx.personaPuesto.deleteMany({ where: { persona_id: id } });
      }

      // 5. Preparamos puestos si vienen en el payload
      const puestosParaCrear = Array.isArray(puestosInput)
        ? puestosInput.filter((p: any) => p.departamento_id && p.puesto_id)
        : [];

      // 6. Actualizamos pasando solo los datos que Prisma reconoce
      return tx.persona.update({
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
            // PATCH: advertencia cuando un rol se descarta por NaN
            set: (() => {
              const r = roles as any;
              const raw = Array.isArray(r)
                ? r.map((item: any) => (item && typeof item === 'object' ? Number(item.id) : Number(item)))
                : r
                  ? [r && typeof r === 'object' ? Number(r.id) : Number(r)]
                  : [];
              const validos = raw.filter((id: number) => !isNaN(id));
              if (raw.length !== validos.length) {
                console.warn(`PersonasService.update: ${raw.length - validos.length} rol(es) inválido(s) ignorado(s) para persona ${id}`);
              }
              return validos.map((id: number) => ({ id }));
            })(),
          },

          // Re-creamos los puestos con activo: true por defecto
          ...(puestosParaCrear.length > 0 && {
            puestos: {
              create: puestosParaCrear.map((puesto: any, index: number) => ({
                orden_puesto: index + 1,
                activo: true,
                departamento: {
                  connect: { id: Number(puesto.departamento_id) },
                },
                puesto: { connect: { id: Number(puesto.puesto_id) } },
              })),
            },
          }),
        },
        include: {
          roles: true,
          puestos: {
            include: {
              puesto: true,
              departamento: true,
            },
          },
        },
      });
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
