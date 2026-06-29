import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';

/** Módulo controlador o servicio para gestionar la entidad Grupos. */
@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta la operación de negocio create.
   * @param createGrupoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  async create(createGrupoDto: CreateGrupoDto) {
    const { aplicaciones, ...grupoData } = createGrupoDto;

    const existe = await this.prisma.grupo.findUnique({
      where: { nombre: grupoData.nombre },
    });
    if (existe)
      throw new ConflictException('El nombre del grupo ya está en uso');

    return this.prisma.grupo.create({
      data: {
        ...grupoData,
        // Insertamos en la tabla intermedia al mismo tiempo
        aplicaciones:
          aplicaciones?.length > 0
            ? {
                create: aplicaciones.map((app) => ({
                  aplicacion_id: app.aplicacion_id,
                  nivel: app.nivel,
                  orden: app.orden || 0,
                })),
              }
            : undefined,
      },
      include: {
        aplicaciones: { include: { aplicacion: true } },
      },
    });
  }

  /**
   * Ejecuta la operación de negocio findAll.
   * @returns Array<Entidad>
   */
  findAll() {
    return this.prisma.grupo.findMany({
      include: {
        aplicaciones: {
          include: { aplicacion: true },
          orderBy: { orden: 'asc' },
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
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        aplicaciones: {
          include: { aplicacion: true },
          orderBy: { orden: 'asc' },
        },
        usuarios: {
          select: {
            id: true,
            nombre_usuario: true,
            persona: { select: { nombre: true, apellidos: true } },
          },
        },
      },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    return grupo;
  }

  /**
   * Ejecuta la operación de negocio update.
   * @param id - Datos o identificador requerido (number)
   * @param updateGrupoDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  async update(id: number, updateGrupoDto: UpdateGrupoDto) {
    await this.findOne(id); // Validar que existe

    const { aplicaciones, ...grupoData } = updateGrupoDto as any;

    // Transacción: Actualiza el grupo, borra permisos viejos y escribe los nuevos
    return this.prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos
      if (Object.keys(grupoData).length > 0) {
        await tx.grupo.update({ where: { id }, data: grupoData });
      }

      // 2. Resincronizar aplicaciones si vienen en el payload
      if (aplicaciones) {
        await tx.grupoAplicacion.deleteMany({ where: { grupo_id: id } }); // Limpiar

        if (aplicaciones.length > 0) {
          await tx.grupoAplicacion.createMany({
            data: aplicaciones.map((app: any) => ({
              grupo_id: id,
              aplicacion_id: app.aplicacion_id,
              nivel: app.nivel,
              orden: app.orden || 0,
            })),
          });
        }
      }

      // 3. Retornar grupo con sus nuevos datos
      return tx.grupo.findUnique({
        where: { id },
        include: {
          aplicaciones: {
            include: { aplicacion: true },
            orderBy: { orden: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Ejecuta la operación de negocio remove.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.grupo.update({
      where: { id },
      data: { activo: false }, // Borrado lógico
    });
  }
}
