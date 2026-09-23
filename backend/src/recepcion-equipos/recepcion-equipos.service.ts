import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { AsignarTecnicoDto } from './dto/asignar-tecnico.dto';
import { TransicionEstadoDto } from './dto/transicion-estado.dto';
import { CambiarFaseAdminDto } from './dto/cambiar-fase-admin.dto';
import { EstadoRecepcion } from '@prisma/client';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import {
  notificarResponsablesEquipo,
  resolverDestinatarios,
} from '../common/helpers/notificar-responsables-equipo';
import { RegistrarFechasCalibracionDto } from './dto/registrar-fechas-calibracion.dto';

// El filtro de `equipos` va DENTRO del include (no solo en el `where` de la
// orden) porque una orden puede agrupar equipos de varios laboratorios —
// que la orden "califique" para un OBT (porque tiene AL MENOS un equipo de
// su laboratorio) no significa que deba ver los equipos de OTROS
// laboratorios que comparten esa misma orden. Sin este filtro anidado, la
// cabecera compartida terminaba filtrando el detalle completo a cualquiera
// con un equipo en la orden.
function construirOrdenInclude(equipoWhere?: object) {
  return {
    cliente: {
      select: {
        id: true,
        nombre: true,
        ruc: true,
        representante: true,
        direccion: true,
        telefono: true,
        email: true,
        tipo: true,
        activo: true,
      },
    },
    equipos: {
      where: equipoWhere,
      include: {
        laboratorio: {
          select: { id: true, nombre: true, responsable_id: true },
        },
        sub_area: { select: { id: true, nombre: true } },
        tecnico: { select: { id: true, nombre: true, apellidos: true } },
        certificados: { select: { id: true } },
        historial_estado: {
          select: {
            id: true,
            estado_anterior: true,
            estado_nuevo: true,
            accion: true,
            observaciones: true,
            createdAt: true,
            realizado_por_id: true,
          },
          orderBy: { id: 'desc' as const },
          take: 5,
        },
        servicio: {
          select: { id: true, nombre: true, magnitud: true, laboratorio_id: true },
        },
      },
      orderBy: { id: 'asc' as const },
    },
  };
}

const EQUIPO_INCLUDE = {
  laboratorio: { select: { id: true, nombre: true, responsable_id: true } },
  sub_area: { select: { id: true, nombre: true } },
  tecnico: { select: { id: true, nombre: true, apellidos: true } },
  certificados: { select: { id: true } },
  historial_estado: {
    select: {
      id: true,
      estado_anterior: true,
      estado_nuevo: true,
      accion: true,
      observaciones: true,
      createdAt: true,
      realizado_por_id: true,
    },
    orderBy: { id: 'desc' as const },
    take: 5,
  },
  servicio: {
    select: { id: true, nombre: true, magnitud: true, laboratorio_id: true },
  },
  orden_trabajo: {
    select: {
      id: true,
      orden_trabajo_fisica: true,
      cliente: {
        select: {
          id: true,
          nombre: true,
          ruc: true,
          representante: true,
          direccion: true,
          telefono: true,
          email: true,
          tipo: true,
          activo: true,
        },
      },
    },
  },
};

function toDate(value?: string): Date | undefined {
  return value ? new Date(value) : undefined;
}

function normalizePuesto(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveOrdenWhere(
  puesto: string,
  personaId: number | null,
  labId: number | null,
  isGod?: boolean,
): object | undefined {
  if (isGod) return undefined;

  const n = normalizePuesto(puesto);

  if (n.includes('jefe') || n.includes('director')) return undefined;

  if (n.includes('observador'))
    return labId
      ? { equipos: { some: { laboratorio_id: labId } } }
      : undefined;

  if (n.includes('tecnico'))
    return personaId
      ? { equipos: { some: { tecnico_id: personaId } } }
      : undefined;

  return undefined;
}

// Mismo criterio que resolveOrdenWhere, pero para filtrar CUÁLES equipos
// dentro de una orden ya calificada se incluyen en la respuesta (ver
// construirOrdenInclude). undefined = sin filtro, se ven todos los equipos
// de la orden (jefe/director, con visión de todos los laboratorios).
function resolveEquipoWhere(
  puesto: string,
  personaId: number | null,
  labId: number | null,
  isGod?: boolean,
): object | undefined {
  if (isGod) return undefined;

  const n = normalizePuesto(puesto);

  if (n.includes('jefe') || n.includes('director')) return undefined;

  if (n.includes('observador')) return labId ? { laboratorio_id: labId } : undefined;

  if (n.includes('tecnico')) return personaId ? { tecnico_id: personaId } : undefined;

  return undefined;
}

@Injectable()
export class RecepcionEquiposService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(dto: CreateOrdenTrabajoDto) {
    const existe = await this.prisma.ordenTrabajo.findUnique({
      where: { orden_trabajo_fisica: dto.orden_trabajo_fisica },
    });

    if (existe) {
      throw new ConflictException(
        `La Orden Física #${dto.orden_trabajo_fisica} ya está registrada en el sistema.`,
      );
    }

    const { equipos, proforma_id, ...header } = dto;
    const proformaSync = await this.resolverProformaSync(proforma_id);

    await this.validarSubAreasDeEquipos(equipos);

    try {
      const orden = await this.prisma.ordenTrabajo.create({
        data: {
          ...header,
          ...proformaSync,
          fecha_ingreso: toDate(dto.fecha_ingreso),
          equipos: {
            create: equipos.map((equipo) => ({
              ...equipo,
              fecha_ingreso_laboratorio: toDate(equipo.fecha_ingreso_laboratorio),
            })),
          },
        },
        include: construirOrdenInclude(),
      });
      this.notificacionesService.notificarRecepcionActualizada();
      return orden;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `La Orden Física #${dto.orden_trabajo_fisica} ya está registrada en el sistema.`,
        );
      }
      throw new BadRequestException(
        'Error al crear la orden de trabajo: ' +
          (error.message || 'Error de base de datos'),
      );
    }
  }

  /**
   * Si el usuario vincula una proforma, se guarda la FK y se sincroniza el
   * texto visible n_proforma con su número. null → desvincula (limpia ambos);
   * undefined → no toca nada.
   */
  private async resolverProformaSync(
    proformaId: number | null | undefined,
  ): Promise<
    | { proforma_id: number; n_proforma: string }
    | { proforma_id: null; n_proforma: null }
    | undefined
  > {
    if (proformaId === undefined) return undefined;
    if (proformaId === null) return { proforma_id: null, n_proforma: null };
    const proforma = await this.prisma.proforma.findUnique({
      where: { id: proformaId },
      select: { id: true, numero: true },
    });
    if (!proforma) {
      throw new BadRequestException('La proforma seleccionada no existe');
    }
    return { proforma_id: proforma.id, n_proforma: proforma.numero };
  }

  // Evita que un equipo quede etiquetado con una sub-área que en realidad
  // pertenece a otro laboratorio distinto al que se le asignó — mismo
  // criterio que ya se usa para validar servicio_id en certificados.service.ts.
  // Solo valida las filas que traen sub-área Y laboratorio definido (en la
  // edición, la sub-área se decide por el laboratorio seleccionado).
  private async validarSubAreasDeEquipos(
    equipos: { laboratorio_id?: number; sub_area_id?: number }[],
  ) {
    const conSubArea = equipos.filter(
      (e) => e.sub_area_id != null && e.laboratorio_id != null,
    );
    if (conSubArea.length === 0) return;

    const subAreas = await this.prisma.subAreaLaboratorio.findMany({
      where: { id: { in: conSubArea.map((e) => e.sub_area_id!) } },
      select: { id: true, laboratorio_id: true },
    });
    const porId = new Map(subAreas.map((s) => [s.id, s]));

    for (const equipo of conSubArea) {
      const subArea = porId.get(equipo.sub_area_id!);
      if (!subArea || subArea.laboratorio_id !== equipo.laboratorio_id) {
        throw new BadRequestException(
          'La sub-área seleccionada no pertenece al laboratorio elegido para ese equipo.',
        );
      }
    }
  }

  async findAll(user?: {
    id: number;
    isGod?: boolean;
    persona_id?: number;
    puesto?: string;
    laboratorio_id?: number;
  }) {
    if (user?.isGod) {
      return this.prisma.ordenTrabajo.findMany({
        orderBy: { fecha_ingreso: 'desc' },
        include: construirOrdenInclude(),
      });
    }

    const personaId = user?.persona_id ?? null;
    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = resolveOrdenWhere(puesto, personaId, labId, user?.isGod);
    const equipoWhere = resolveEquipoWhere(puesto, personaId, labId, user?.isGod);

    return this.prisma.ordenTrabajo.findMany({
      where,
      orderBy: { fecha_ingreso: 'desc' },
      include: construirOrdenInclude(equipoWhere),
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
      const orden = await this.prisma.ordenTrabajo.findUnique({
        where: { id },
        include: construirOrdenInclude(),
      });
      if (!orden) {
        throw new NotFoundException(
          `Orden de trabajo con ID ${id} no encontrada`,
        );
      }
      return orden;
    }

    const personaId = user?.persona_id ?? null;
    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const scopeWhere =
      resolveOrdenWhere(puesto, personaId, labId, user?.isGod) ?? {};
    const equipoWhere = resolveEquipoWhere(puesto, personaId, labId, user?.isGod);

    const orden = await this.prisma.ordenTrabajo.findFirst({
      where: { id, ...scopeWhere },
      include: construirOrdenInclude(equipoWhere),
    });

    if (!orden) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }
    return orden;
  }

  async update(id: number, dto: UpdateOrdenTrabajoDto) {
    await this.findOne(id);

    const { equipos, proforma_id, ...header } = dto;
    const proformaSync = await this.resolverProformaSync(proforma_id);

    if (equipos && equipos.length > 0) {
      await this.validarSubAreasDeEquipos(equipos);
    }

    try {
      const orden = await this.prisma.$transaction(async (tx) => {
        // 1) Cabecera de la orden
        await tx.ordenTrabajo.update({
          where: { id },
          data: {
            ...header,
            ...proformaSync,
            fecha_ingreso: toDate(header.fecha_ingreso),
          },
        });

        // 2) Detalle: los equipos con `id` se actualizan y los que no traen
        // `id` se crean (equipos nuevos dentro de una orden ya registrada).
        // La fase (`estado`) queda fuera del DTO — se mueve con el flujo de
        // estados o con el ajuste manual del administrador.
        if (equipos && equipos.length > 0) {
          for (const equipo of equipos) {
            const dataEquipo: any = {
              equipo_descripcion: equipo.equipo_descripcion,
              marca: equipo.marca || null,
              modelo: equipo.modelo || null,
              codigo_serie: equipo.codigo_serie || null,
              codigo_cmee: equipo.codigo_cmee || null,
              accesorios: equipo.accesorios || null,
              requerimientos_calibracion:
                equipo.requerimientos_calibracion || null,
              laboratorio_id: equipo.laboratorio_id,
              fecha_ingreso_laboratorio: toDate(
                equipo.fecha_ingreso_laboratorio,
              ),
            };
            // La sub-área es opcional: solo se toca si el cliente la envía
            // explícitamente (undefined = dejarla como está; null = quitarla).
            if (equipo.sub_area_id !== undefined) {
              dataEquipo.sub_area_id = equipo.sub_area_id;
            }

            if (equipo.id) {
              await tx.equipoRecepcion.update({
                where: { id: equipo.id },
                data: dataEquipo,
              });
            } else {
              await tx.equipoRecepcion.create({
                data: { ...dataEquipo, orden_trabajo_id: id },
              });
            }
          }
        }

        return tx.ordenTrabajo.findUnique({
          where: { id },
          include: construirOrdenInclude(),
        });
      });
      this.notificacionesService.notificarRecepcionActualizada();
      return orden;
    } catch (error: any) {
      // P2002 = violación de unicidad (ej. el nº de orden física ya existe)
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'El número de orden física ya está registrado en otra orden.',
        );
      }
      throw new BadRequestException(
        'Error al actualizar la orden de trabajo: ' +
          (error.message || 'Error de base de datos'),
      );
    }
  }

  /**
   * Fase A del flujograma: registro de fecha de calibración y próxima
   * calibración de un equipo (base de las alertas de la Fase D). String vacío
   * limpia la fecha; undefined la deja como está.
   */
  async registrarFechasCalibracion(
    id: number,
    dto: RegistrarFechasCalibracionDto,
  ) {
    const equipo = await this.prisma.equipoRecepcion.findUnique({
      where: { id },
    });
    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    try {
      const actualizado = await this.prisma.equipoRecepcion.update({
        where: { id },
        data: {
          fecha_calibracion:
            dto.fecha_calibracion === ''
              ? null
              : toDate(dto.fecha_calibracion),
          fecha_proxima_calibracion:
            dto.fecha_proxima_calibracion === ''
              ? null
              : toDate(dto.fecha_proxima_calibracion),
        },
        include: EQUIPO_INCLUDE,
      });
      this.notificacionesService.notificarRecepcionActualizada();
      return actualizado;
    } catch (error: any) {
      throw new BadRequestException(
        'Error al registrar las fechas de calibración: ' +
          (error.message || 'Error de base de datos'),
      );
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      const eliminada = await this.prisma.$transaction(async (tx) => {
        const equipos = await tx.equipoRecepcion.findMany({
          where: { orden_trabajo_id: id },
          select: { id: true },
        });
        const equipoIds = equipos.map((e) => e.id);

        if (equipoIds.length > 0) {
          await tx.firmaDigital.deleteMany({
            where: { certificado: { equipo_recepcion_id: { in: equipoIds } } },
          });
          await tx.certificado.deleteMany({
            where: { equipo_recepcion_id: { in: equipoIds } },
          });
          await tx.historialEstado.deleteMany({
            where: { equipo_recepcion_id: { in: equipoIds } },
          });
          await tx.equipoRecepcion.deleteMany({
            where: { id: { in: equipoIds } },
          });
        }

        return tx.ordenTrabajo.delete({ where: { id } });
      });
      this.notificacionesService.notificarRecepcionActualizada();
      return eliminada;
    } catch (error: any) {
      throw new BadRequestException(
        'Error al eliminar la orden de trabajo: ' +
          (error.message || 'Error de base de datos'),
      );
    }
  }

  // ------------------------------------------------------------------
  // Operaciones a nivel de Equipo (Detalle)
  // ------------------------------------------------------------------

  private async findOneEquipo(id: number) {
    const equipo = await this.prisma.equipoRecepcion.findUnique({
      where: { id },
      include: EQUIPO_INCLUDE,
    });
    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }
    return equipo;
  }

  /**
   * Diagnóstico: quién sería notificado para un equipo si llegara (o
   * volviera a llegar) a `estado`, sin crear ninguna notificación de
   * verdad. Existe porque "a X no le llega la notificación" no se puede
   * depurar solo leyendo el código — hay que poder ver en vivo qué
   * devuelve la resolución de destinatarios contra los datos reales
   * (puesto, departamento, vínculo departamento↔laboratorio).
   */
  async previsualizarNotificacion(equipoId: number, estado: EstadoRecepcion) {
    const equipo = await this.findOneEquipo(equipoId);
    return resolverDestinatarios(this.prisma, equipo, estado);
  }

  // También se usa para REASIGNAR: si el OBT eligió mal al técnico, puede
  // volver a llamar este mismo método con otro tecnico_id — el nuevo
  // técnico queda notificado igual que en la asignación inicial.
  async asignarTecnico(
    equipoId: number,
    dto: AsignarTecnicoDto,
    user?: {
      isGod?: boolean;
      puesto?: string;
      laboratorio_id?: number;
    },
  ) {
    const equipo = await this.findOneEquipo(equipoId);

    if (user && !user.isGod) {
      const n = normalizePuesto(user.puesto ?? '');
      const esObservador = n.includes('observador');
      if (esObservador && equipo.laboratorio_id !== user.laboratorio_id) {
        throw new ForbiddenException(
          'No tienes permiso para asignar técnicos a equipos de otro laboratorio',
        );
      }
    }

    const equipoActualizado = await this.prisma.equipoRecepcion.update({
      where: { id: equipoId },
      data: {
        tecnico_id: dto.tecnico_id,
        estado: EstadoRecepcion.EN_CALIBRACION,
      },
      include: EQUIPO_INCLUDE,
    });

    await notificarResponsablesEquipo(
      this.prisma,
      this.notificacionesService,
      equipoActualizado,
      EstadoRecepcion.EN_CALIBRACION,
    );
    this.notificacionesService.notificarRecepcionActualizada();

    return equipoActualizado;
  }

  async updateEquipoStatus(
    equipoId: number,
    estado: EstadoRecepcion,
  ) {
    await this.findOneEquipo(equipoId);
    return this.prisma.equipoRecepcion.update({
      where: { id: equipoId },
      data: { estado },
      include: EQUIPO_INCLUDE,
    });
  }

  /**
   * Cambio MANUAL de fase reservado a administradores (nivel 5): corrige
   * errores del flujo cuando un usuario avanzó o rechazó por equivocación.
   *
   * A diferencia de transicionEstado(), NO aplica la máquina de estados — el
   * admin elige el estado destino libremente (hacia adelante o hacia atrás).
   * De todos modos queda trazado en historial_estado con accion='AJUSTE_ADMIN'
   * y se notifica a quien deba actuar en la nueva fase, para que el flujo
   * retome con la notificación correcta. No borra certificados ni firmas:
   * la corrección es solo de fase; si hace falta limpiar documentos, el
   * admin puede rechazar por el flujo normal o eliminar la orden.
   */
  async cambiarFaseAdmin(
    equipoId: number,
    dto: CambiarFaseAdminDto,
    user: any,
  ) {
    const equipo = await this.findOneEquipo(equipoId);
    const estadoAnterior = equipo.estado;
    const estadoNuevo = dto.estado;

    if (estadoNuevo === estadoAnterior) {
      throw new BadRequestException(
        `El equipo ya se encuentra en el estado ${estadoNuevo.replace(/_/g, ' ')}`,
      );
    }

    const personaId = user?.persona_id ?? null;

    const equipoActualizado = await this.prisma.$transaction(async (tx) => {
      await tx.equipoRecepcion.update({
        where: { id: equipoId },
        data: { estado: estadoNuevo },
      });

      await tx.historialEstado.create({
        data: {
          equipo_recepcion_id: equipoId,
          estado_anterior: estadoAnterior,
          estado_nuevo: estadoNuevo,
          accion: 'AJUSTE_ADMIN',
          observaciones: dto.observaciones ?? null,
          realizado_por_id: personaId ?? 1,
        },
      });

      return tx.equipoRecepcion.findUnique({
        where: { id: equipoId },
        include: EQUIPO_INCLUDE,
      });
    });

    // Mismo criterio que transicionEstado: notificar después del commit y sin
    // dejar que un fallo de notificación revierta o bloquee el cambio (el
    // helper además nunca lanza).
    if (equipoActualizado) {
      await notificarResponsablesEquipo(
        this.prisma,
        this.notificacionesService,
        equipoActualizado,
        estadoNuevo,
        {
          motivo: dto.observaciones ?? undefined,
        },
      );
    }
    this.notificacionesService.notificarRecepcionActualizada();

    return equipoActualizado;
  }

  async transicionEstado(
    equipoId: number,
    dto: TransicionEstadoDto,
    user: any,
  ) {
    const equipo = await this.prisma.equipoRecepcion.findUnique({
      where: { id: equipoId },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${equipoId} no encontrado`);
    }

    const personaId = user.persona_id;
    const puesto = user.puesto ?? '';

    const n = normalizePuesto(puesto);
    const estadoActual = equipo.estado;
    const accion = dto.accion;
    const observaciones = dto.observaciones;

    if (accion === 'RECHAZAR' && !observaciones?.trim()) {
      throw new BadRequestException(
        'Las observaciones son obligatorias cuando se rechaza',
      );
    }

    let estadoNuevo: EstadoRecepcion | null = null;

    const esObservador = n.includes('observador');
    const esTecnico = n.includes('tecnico') && !n.includes('observador');
    // "Jefe Departamento Gestión de la Calidad" no participa de este flujo,
    // pero su puesto también contiene la palabra "jefe" — se excluye para
    // que no cuele como Jefe de Laboratorio en REVISION_JEFE.
    const esJefe = n.includes('jefe') && !n.includes('calidad');
    const esDirector = n.includes('director');
    const esRSEC = n.includes('responsable servicio al cliente');

    switch (estadoActual) {
      case EstadoRecepcion.EN_CALIBRACION:
        if (!esTecnico) {
          throw new ForbiddenException(
            'Solo el técnico asignado puede enviar a revisión',
          );
        }
        if (equipo.tecnico_id !== personaId) {
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
        if (esObservador && equipo.laboratorio_id !== user.laboratorio_id) {
          throw new ForbiddenException(
            'No tienes permiso para revisar equipos de otro laboratorio',
          );
        }
        if (accion === 'APROBAR') {
          estadoNuevo = EstadoRecepcion.PENDIENTE_FIRMA_TECNICO;
        } else {
          estadoNuevo = EstadoRecepcion.EN_CALIBRACION;
        }
        break;

      // PENDIENTE_FIRMA_TECNICO, REVISION_JEFE y REVISION_DIRECTOR avanzan
      // ÚNICAMENTE firmando de verdad (ver certificados.service.ts#firmar,
      // que exige un PDF con firma PAdES verificada criptográficamente antes
      // de tocar el estado). Este endpoint genérico solo puede rechazar en
      // estos tres pasos — de lo contrario un certificado podía terminar
      // "aprobado" sin que nadie lo hubiera firmado realmente.
      case EstadoRecepcion.PENDIENTE_FIRMA_TECNICO:
        if (!esTecnico) {
          throw new ForbiddenException(
            'Solo el técnico asignado puede firmar',
          );
        }
        if (equipo.tecnico_id !== personaId) {
          throw new ForbiddenException(
            'No eres el técnico asignado a este equipo',
          );
        }
        if (accion === 'APROBAR') {
          throw new BadRequestException(
            'Este paso requiere firmar digitalmente el reporte, no se puede aprobar sin firma',
          );
        }
        estadoNuevo = EstadoRecepcion.EN_CALIBRACION;
        break;

      case EstadoRecepcion.REVISION_JEFE:
        if (!esJefe) {
          throw new ForbiddenException(
            'Solo el Jefe de Laboratorio puede revisar',
          );
        }
        if (accion === 'APROBAR') {
          throw new BadRequestException(
            'Este paso requiere firmar digitalmente el reporte, no se puede aprobar sin firma',
          );
        }
        estadoNuevo = EstadoRecepcion.REVISION_OBT;
        break;

      case EstadoRecepcion.REVISION_DIRECTOR:
        if (!esDirector) {
          throw new ForbiddenException(
            'Solo el Director puede revisar',
          );
        }
        if (accion === 'APROBAR') {
          throw new BadRequestException(
            'Este paso requiere firmar digitalmente el certificado, no se puede aprobar sin firma',
          );
        }
        estadoNuevo = EstadoRecepcion.REVISION_JEFE;
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

    const rutasArchivosEliminados: string[] = [];

    const equipoActualizado = await this.prisma.$transaction(async (tx) => {
      await tx.equipoRecepcion.update({
        where: { id: equipoId },
        data: { estado: estadoNuevo! },
      });

      // Si el paso fue rechazado, se eliminan los certificados y reportes
      // subidos (registros y archivos físicos) para que el técnico vuelva a
      // subirlos desde cero. También se borran las firmas asociadas.
      if (accion === 'RECHAZAR') {
        const certificados = await tx.certificado.findMany({
          where: { equipo_recepcion_id: equipoId },
          select: {
            id: true,
            ruta_archivo_reporte: true,
            ruta_archivo_certificado: true,
          },
        });
        for (const certificado of certificados) {
          await tx.firmaDigital.deleteMany({
            where: { certificado_id: certificado.id },
          });
          await tx.certificado.delete({ where: { id: certificado.id } });
          rutasArchivosEliminados.push(
            certificado.ruta_archivo_reporte,
            certificado.ruta_archivo_certificado,
          );
        }
      }

      await tx.historialEstado.create({
        data: {
          equipo_recepcion_id: equipoId,
          estado_anterior: estadoActual,
          estado_nuevo: estadoNuevo!,
          accion,
          observaciones: observaciones ?? null,
          realizado_por_id: personaId ?? 1,
        },
      });

      return tx.equipoRecepcion.findUnique({
        where: { id: equipoId },
        include: EQUIPO_INCLUDE,
      });
    });

    // Los archivos físicos se borran tras el commit (mejor esfuerzo): un
    // fallo al eliminar el archivo jamás debe revertir el rechazo ya
    // confirmado en BD.
    for (const ruta of rutasArchivosEliminados) {
      fs.unlink(ruta, () => {
        /* mejor esfuerzo */
      });
    }

    // Se notifica después de que la transición ya quedó confirmada en BD —
    // un fallo al notificar nunca debe revertir ni bloquear el cambio de
    // estado (ver notificarResponsablesEquipo, que además nunca lanza).
    if (equipoActualizado) {
      await notificarResponsablesEquipo(
        this.prisma,
        this.notificacionesService,
        equipoActualizado,
        estadoNuevo!,
        {
          rechazado: accion === 'RECHAZAR',
          motivo: observaciones ?? undefined,
        },
      );
    }
    this.notificacionesService.notificarRecepcionActualizada();

    return equipoActualizado;
  }
}
