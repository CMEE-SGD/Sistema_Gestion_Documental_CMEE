import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';
import { PrismaService } from '../prisma/prisma.service';

/** Módulo controlador o servicio para gestionar la entidad Circuitos. */
@Injectable()
export class CircuitosService {
  constructor(private prisma: PrismaService) { }

  /**
     * Ejecuta la operación de negocio create.
     * @param createCircuitoDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async create(createCircuitoDto: CreateCircuitoDto) {
    // Verificamos si ya existe para devolver un error amigable
    const existe = await this.prisma.circuito.findUnique({
      where: { nombre: createCircuitoDto.nombre },
    });

    if (existe) {
      throw new BadRequestException(`El circuito ${createCircuitoDto.nombre} ya existe.`);
    }

    return this.prisma.circuito.create({
      data: createCircuitoDto,
    });
  }

  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Array<Entidad>
     */
    findAll() {
    return this.prisma.circuito.findMany({
      orderBy: { nombre: 'asc' }, // Los ordenamos alfabéticamente
    });
  }

  /**
     * Ejecuta la operación de negocio findOne.
     * @param id - Datos o identificador requerido (number)
     * @returns Entidad | PrismaResponse
     */
    findOne(id: number) {
    return this.prisma.circuito.findUnique({
      where: { id },
    });
  }

  /**
     * Ejecuta la operación de negocio update.
     * @param id - Datos o identificador requerido (number)
     * @param updateCircuitoDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Entidad | PrismaResponse
     */
    update(id: number, updateCircuitoDto: UpdateCircuitoDto) {
    return this.prisma.circuito.update({
      where: { id },
      data: updateCircuitoDto,
    });
  }

  /**
     * Ejecuta la operación de negocio remove.
     * @param id - Datos o identificador requerido (number)
     * @returns Entidad | PrismaResponse
     */
    remove(id: number) {
    return this.prisma.circuito.delete({
      where: { id },
    });
  }
  /**
     * Ejecuta la operación de negocio saveFase.
     * @param circuitoId - Datos o identificador requerido (number)
     * @param data - Datos o identificador requerido (any)
     * @returns Promise<void>
     */
    async saveFase(circuitoId: number, data: any) {
    const circuito = await this.prisma.circuito.findUnique({ where: { id: circuitoId } });
    if (!circuito) throw new NotFoundException('Circuito no encontrado');

    // 1. Preparamos los datos básicos de la fase
    const faseData = {
      nombre: data.nombre,
      orden: Number(data.orden) || 10,
      etiqueta_singular: data.etiqueta_singular,
      etiqueta_plural: data.etiqueta_plural,
      individual_paralelo: data.individual_paralelo || false,
      mostrar_hora: data.mostrar_hora !== false, // Por defecto true
      ocultar_enviar_correo: data.ocultar_enviar_correo || false,
      activo: data.activo !== false, // Por defecto true
      en_vigor: data.en_vigor || false,
      obligatorio_todos: data.obligatorio_todos || false,
    };

    let faseId = data.id;

    if (faseId) {
      // 2a. Si ya existe, la ACTUALIZAMOS
      await this.prisma.fase.update({
        where: { id: faseId },
        data: faseData,
      });

      // Si nos envían una lista de usuarios, borramos los anteriores y metemos los nuevos
      if (Array.isArray(data.usuarios_asignados)) {
        await this.prisma.faseParticipante.deleteMany({ where: { fase_id: faseId } });
        const participantes = data.usuarios_asignados.map(personaId => ({
          fase_id: faseId,
          persona_id: Number(personaId)
        }));
        if (participantes.length > 0) {
          await this.prisma.faseParticipante.createMany({ data: participantes });
        }
      }

    } else {
      // 2b. Si es nueva, la CREAMOS
      const nuevaFase = await this.prisma.fase.create({
        data: {
          ...faseData,
          circuito_id: circuitoId,
        }
      });
      faseId = nuevaFase.id;

      // Si nos envían una lista de usuarios, los asignamos
      if (Array.isArray(data.usuarios_asignados) && data.usuarios_asignados.length > 0) {
        const participantes = data.usuarios_asignados.map(personaId => ({
          fase_id: faseId,
          persona_id: Number(personaId)
        }));
        await this.prisma.faseParticipante.createMany({ data: participantes });
      }
    }
  }
  // 👉 NUEVO: Método para obtener las fases de un circuito
  // 👉 ACTUALIZADO: Traemos la fase + participantes + datos de la persona
  /**
     * Ejecuta la operación de negocio getFases.
     * @param circuitoId - Datos o identificador requerido (number)
     * @returns Array<Entidad>
     */
    async getFases(circuitoId: number) {
    return this.prisma.fase.findMany({
      where: { circuito_id: circuitoId },
      orderBy: { orden: 'asc' },
      include: { 
        participantes: {
          include: { persona: true } // Esto nos permite leer persona.nombre en el frontend
        }
      } 
    });
  }
  // 👉 REVISA QUE ESTE MÉTODO EXISTA EN TU ARCHIVO circuitos.service.ts
  /**
     * Ejecuta la operación de negocio getFase.
     * @param faseId - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async getFase(faseId: number) {
    return this.prisma.fase.findUnique({
      where: { id: faseId },
      include: { participantes: true } // Trae a los usuarios asignados
    });
  }

  
}