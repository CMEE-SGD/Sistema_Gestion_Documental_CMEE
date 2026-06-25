import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Módulo controlador o servicio para gestionar la entidad Auditoria. */
@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
     * Ejecuta la operación de negocio registrarLog.
     * @param data - Datos o identificador requerido (Objeto complejo / PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    async registrarLog(data: {
    usuario_id: number;
    modulo: string;
    accion: string;
    descripcion?: string;
    documento_id?: number;
    persona_afectada_id?: number;
    rol_afectado_id?: number;
    puesto_afectado_id?: number;
  }) {
    return this.prisma.auditoria.create({
      data,
    });
  }

  // NUEVO: Método para enviar los logs al frontend
  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Objeto complejo / PrismaResponse
     */
    async findAll() {
    return this.prisma.auditoria.findMany({
      orderBy: { fecha_hora: 'desc' }, // Los más recientes primero
      include: {
        // Incluimos el nombre del usuario para la tabla del frontend
        usuario: {
          select: { nombre_usuario: true }
        }
      }
    });
  }

  /**
     * Ejecuta la operación de negocio findByPersona.
     * @param personaId - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async findByPersona(personaId: number) {
    return this.prisma.auditoria.findMany({
      where: { persona_afectada_id: personaId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } }
    });
  }

  /**
     * Ejecuta la operación de negocio findByDocumento.
     * @param documentoId - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async findByDocumento(documentoId: number) {
    return this.prisma.auditoria.findMany({
      where: { documento_id: documentoId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } }
    });
  }

  /**
     * Ejecuta la operación de negocio findByRol.
     * @param rolId - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async findByRol(rolId: number) {
    return this.prisma.auditoria.findMany({
      where: { rol_afectado_id: rolId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } }
    });
  }

  /**
     * Ejecuta la operación de negocio findByPuesto.
     * @param puestoId - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async findByPuesto(puestoId: number) {
    return this.prisma.auditoria.findMany({
      where: { puesto_afectado_id: puestoId },
      orderBy: { fecha_hora: 'desc' },
      include: { usuario: { select: { nombre_usuario: true } } }
    });
  }
}
