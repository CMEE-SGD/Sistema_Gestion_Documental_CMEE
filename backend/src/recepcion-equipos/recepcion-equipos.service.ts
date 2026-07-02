import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecepcionEquipoDto } from './dto/create-recepcion-equipo.dto';
import { UpdateRecepcionEquipoDto } from './dto/update-recepcion-equipo.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { TransicionEstadoDto } from './dto/transicion-estado.dto';
import { EstadoRecepcion } from '@prisma/client';

const INCLUDE_RELATIONS = {
  cliente: { select: { id: true, nombre: true, tipo: true } },
  laboratorio: { select: { id: true, nombre: true, responsable_id: true } },
  tecnico: { select: { id: true, nombre: true, apellidos: true } },
  certificados: { select: { id: true } },
};

/**
 * Resolve row-level where clause from the full job-title string stored in
 * the database (e.g. "Observador Técnico", no acronyms).
 *
 *   God / "Jefe…" / "Director…" / "Responsable servicio al Cliente" → no filter (all records)
 *   "Observador Técnico"                                           → filtered by lab
 *   Any other "Técnico" (not Jefe)                                 → filtered by assigned tech
 */
function normalizePuesto(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveWhere(
  puesto: string,
  personaId: number | null,
  labId: number | null,
  isGod?: boolean,
): object | undefined {
  if (isGod) return undefined;

  const n = normalizePuesto(puesto);

  // Jefes y Directores ven todos los registros (no filtro)
  if (n.includes('jefe') || n.includes('director')) return undefined;

  if (n.includes('observador'))
    return labId ? { laboratorio_id: labId } : undefined;

  if (n.includes('tecnico'))
    return personaId ? { tecnico_id: personaId } : undefined;

  return undefined; // RSEC, otros → all records
}

@Injectable()
export class RecepcionEquiposService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateRecepcionEquipoDto) {
    const existeOrden = await this.prisma.recepcionEquipo.findUnique({
      where: { orden_trabajo_fisica: createDto.orden_trabajo_fisica },
    });

    if (existeOrden) {
      throw new ConflictException(
        `La Orden Física #${createDto.orden_trabajo_fisica} ya está registrada en el sistema.`,
      );
    }

    return this.prisma.recepcionEquipo.create({
      data: createDto,
      include: INCLUDE_RELATIONS,
    });
  }

  async findAll(user?: {
    id: number;
    isGod?: boolean;
    persona_id?: number;
    puesto?: string;
    laboratorio_id?: number;
  }) {
    if (user?.isGod) {
      return this.prisma.recepcionEquipo.findMany({
        orderBy: { fecha_ingreso: 'desc' },
        include: INCLUDE_RELATIONS,
      });
    }

    let personaId = user?.persona_id;
    let puesto = user?.puesto ?? '';
    let labId: number | null = user?.laboratorio_id ?? null;

    // Fallback: if the JWT payload didn't include the fields above, hydrate from DB
    if (!puesto && user?.id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          persona: {
            select: {
              id: true,
              puestos: {
                where: { activo: true },
                orderBy: { orden_puesto: 'asc' },
                take: 1,
                select: {
                  puesto: { select: { nombre: true } },
                  departamento: {
                    select: { laboratorio: { select: { id: true } } },
                  },
                },
              },
            },
          },
        },
      });

      const puestos = usuario?.persona?.puestos ?? [];
      personaId = usuario?.persona?.id;
      puesto = puestos[0]?.puesto?.nombre ?? '';
      labId = puestos[0]?.departamento?.laboratorio?.id ?? null;
    }

    // Build the where clause from the full job-title string
    const where = resolveWhere(puesto, personaId, labId, user?.isGod);

    return this.prisma.recepcionEquipo.findMany({
      where,
      orderBy: { fecha_ingreso: 'desc' },
      include: INCLUDE_RELATIONS,
    });
  }

  async findOne(
    id: number,
    user?: {
      id: number;
      isGod?: boolean;
      persona_id?: number;
      puesto?: string;
      laboratorio_id?: number;
    },
  ) {
    if (user?.isGod) {
      const recepcion = await this.prisma.recepcionEquipo.findUnique({
        where: { id },
        include: INCLUDE_RELATIONS,
      });
      if (!recepcion) {
        throw new NotFoundException(`Recepción con ID ${id} no encontrada`);
      }
      return recepcion;
    }

    let personaId = user?.persona_id;
    let puesto = user?.puesto ?? '';
    let labId: number | null = user?.laboratorio_id ?? null;

    // Fallback: hydrate from DB if JWT payload didn't include these fields
    if (!puesto && user?.id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          persona: {
            select: {
              id: true,
              puestos: {
                where: { activo: true },
                orderBy: { orden_puesto: 'asc' },
                take: 1,
                select: {
                  puesto: { select: { nombre: true } },
                  departamento: {
                    select: { laboratorio: { select: { id: true } } },
                  },
                },
              },
            },
          },
        },
      });

      const puestos = usuario?.persona?.puestos ?? [];
      personaId = usuario?.persona?.id;
      puesto = puestos[0]?.puesto?.nombre ?? '';
      labId = puestos[0]?.departamento?.laboratorio?.id ?? null;
    }

    const scopeWhere = resolveWhere(puesto, personaId, labId, user?.isGod) ?? {};

    const recepcion = await this.prisma.recepcionEquipo.findFirst({
      where: { id, ...scopeWhere },
      include: INCLUDE_RELATIONS,
    });

    if (!recepcion) {
      throw new NotFoundException(`Recepción con ID ${id} no encontrada`);
    }
    return recepcion;
  }

  async update(id: number, updateDto: UpdateRecepcionEquipoDto) {
    await this.findOne(id);
    return this.prisma.recepcionEquipo.update({
      where: { id },
      data: updateDto,
      include: INCLUDE_RELATIONS,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.recepcionEquipo.delete({
      where: { id },
    });
  }

  async asignarTecnico(id: number, dto: AsignarTecnicoDto) {
    await this.findOne(id);
    return this.prisma.recepcionEquipo.update({
      where: { id },
      data: {
        tecnico_id: dto.tecnico_id,
        estado: EstadoRecepcion.EN_CALIBRACION,
      },
      include: INCLUDE_RELATIONS,
    });
  }

  async transicionEstado(
    id: number,
    dto: TransicionEstadoDto,
    user: any,
  ) {
    const recepcion = await this.prisma.recepcionEquipo.findUnique({
      where: { id },
    });

    if (!recepcion) {
      throw new NotFoundException(`Recepción con ID ${id} no encontrada`);
    }

    // Hidratar datos del usuario desde BD si el JWT no trajo puesto/persona_id
    let personaId = user.persona_id;
    let puesto = user.puesto ?? '';
    let labId: number | null = user.laboratorio_id ?? null;

    if (!puesto && user.id) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          persona: {
            select: {
              id: true,
              puestos: {
                where: { activo: true },
                orderBy: { orden_puesto: 'asc' },
                take: 1,
                select: {
                  puesto: { select: { nombre: true } },
                  departamento: {
                    select: { laboratorio: { select: { id: true } } },
                  },
                },
              },
            },
          },
        },
      });

      const puestos = usuario?.persona?.puestos ?? [];
      personaId = usuario?.persona?.id;
      puesto = puestos[0]?.puesto?.nombre ?? '';
      labId = puestos[0]?.departamento?.laboratorio?.id ?? null;
    }

    const n = normalizePuesto(puesto);
    const estadoActual = recepcion.estado;
    const accion = dto.accion;
    const observaciones = dto.observaciones;

    // Validar observaciones requeridas para RECHAZAR
    if (accion === 'RECHAZAR' && !observaciones?.trim()) {
      throw new BadRequestException(
        'Las observaciones son obligatorias cuando se rechaza',
      );
    }

    // Determinar estado destino según máquina de estados
    let estadoNuevo: EstadoRecepcion | null = null;

    // Helper para validar rol basado en puesto normalizado
    const esObservador = n.includes('observador');
    const esTecnico = n.includes('tecnico') && !n.includes('observador');
    const esJefe = n.includes('jefe');
    const esDirector = n.includes('director');
    const esRSEC = n.includes('responsable servicio al cliente');

    switch (estadoActual) {
      case EstadoRecepcion.EN_CALIBRACION:
        if (!esTecnico) {
          throw new ForbiddenException(
            'Solo el técnico asignado puede enviar a revisión',
          );
        }
        if (recepcion.tecnico_id !== personaId) {
          throw new ForbiddenException(
            'No eres el técnico asignado a este equipo',
          );
        }
        if (accion === 'APROBAR') {
          estadoNuevo = EstadoRecepcion.REVISION_OBT;
        } else {
          throw new BadRequestException(
            'No puedes rechazar desde calibración activa',
          );
        }
        break;

      case EstadoRecepcion.REVISION_OBT:
        if (!esObservador && !esJefe) {
          throw new ForbiddenException(
            'Solo el Observador Técnico o Jefe puede revisar',
          );
        }
        if (accion === 'APROBAR') {
          estadoNuevo = EstadoRecepcion.PENDIENTE_FIRMA_TECNICO;
        } else {
          estadoNuevo = EstadoRecepcion.EN_CALIBRACION;
        }
        break;

      case EstadoRecepcion.PENDIENTE_FIRMA_TECNICO:
        if (!esTecnico) {
          throw new ForbiddenException(
            'Solo el técnico asignado puede firmar',
          );
        }
        if (recepcion.tecnico_id !== personaId) {
          throw new ForbiddenException(
            'No eres el técnico asignado a este equipo',
          );
        }
        if (accion === 'APROBAR') {
          estadoNuevo = EstadoRecepcion.REVISION_JEFE;
        } else {
          estadoNuevo = EstadoRecepcion.EN_CALIBRACION;
        }
        break;

      case EstadoRecepcion.REVISION_JEFE:
        if (!esJefe) {
          throw new ForbiddenException(
            'Solo el Jefe de Laboratorio puede revisar',
          );
        }
        if (accion === 'APROBAR') {
          estadoNuevo = EstadoRecepcion.REVISION_DIRECTOR;
        } else {
          estadoNuevo = EstadoRecepcion.REVISION_OBT;
        }
        break;

      case EstadoRecepcion.REVISION_DIRECTOR:
        if (!esDirector) {
          throw new ForbiddenException(
            'Solo el Director puede revisar',
          );
        }
        if (accion === 'APROBAR') {
          estadoNuevo = EstadoRecepcion.LISTO_PARA_ENTREGA;
        } else {
          estadoNuevo = EstadoRecepcion.REVISION_JEFE;
        }
        break;

      case EstadoRecepcion.LISTO_PARA_ENTREGA:
        if (!esRSEC) {
          throw new ForbiddenException(
            'Solo Responsable Servicio al Cliente puede finalizar la entrega',
          );
        }
        if (accion === 'APROBAR') {
          estadoNuevo = EstadoRecepcion.FINALIZADO;
        } else {
          estadoNuevo = EstadoRecepcion.REVISION_DIRECTOR;
        }
        break;

      default:
        throw new BadRequestException(
          `No se puede transicionar desde el estado ${estadoActual}`,
        );
    }

    // Ejecutar transición en transacción
    return this.prisma.$transaction(async (tx) => {
      await tx.recepcionEquipo.update({
        where: { id },
        data: { estado: estadoNuevo! },
      });

      await tx.historialEstado.create({
        data: {
          recepcion_equipo_id: id,
          estado_anterior: estadoActual,
          estado_nuevo: estadoNuevo!,
          accion,
          observaciones: observaciones ?? null,
          realizado_por_id: personaId ?? 1,
        },
      });

      return tx.recepcionEquipo.findUnique({
        where: { id },
        include: INCLUDE_RELATIONS,
      });
    });
  }
}
