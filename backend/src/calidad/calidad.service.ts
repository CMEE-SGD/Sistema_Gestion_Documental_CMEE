import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoNC, CondicionRiesgo, EstadoAuditoria } from '@prisma/client';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { CambiarEstadoAuditoriaDto } from './dto/cambiar-estado-auditoria.dto';
import { CreateNcDto } from './dto/create-nc.dto';
import { UpdateNcDto } from './dto/update-nc.dto';
import { CambiarEstadoNcDto } from './dto/cambiar-estado-nc.dto';
import { CreateRiesgoDto } from './dto/create-riesgo.dto';
import { UpdateRiesgoDto } from './dto/update-riesgo.dto';
import { CreateQuejaDto } from './dto/create-queja.dto';
import { UpdateQuejaDto } from './dto/update-queja.dto';


/**
 * Máquina de estados de una No Conformidad.
 * ABIERTA  → se registra la NC (sin acciones todavía)
 * EN_CURSO → el OEC entrega/implementa el plan de acciones
 * VERIFICADA → el Jefe de Calidad verificó la eficacia (resultado EFICAZ)
 * CERRADA  → cierre formal (terminal)
 *
 * Se permite EN_CURSO → CERRADA (cierre directo) para el flujo simplificado
 * sin verificación. Para quitar VERIFICADA a futuro basta con eliminar el
 * estado del enum y de este mapa.
 */
const TRANSICIONES_NC: Record<EstadoNC, EstadoNC[]> = {
  ABIERTA: [EstadoNC.EN_CURSO],
  EN_CURSO: [EstadoNC.VERIFICADA, EstadoNC.CERRADA, EstadoNC.ABIERTA],
  VERIFICADA: [EstadoNC.CERRADA, EstadoNC.EN_CURSO],
  CERRADA: [],
};

/**
 * Máquina de estados de una auditoría interna.
 * PLANIFICADA → el programa de auditoría está aprobado y agendado
 * EN_CURSO     → la auditoría se está ejecutando (equipo auditor trabajando)
 * CERRADA      → la auditoría fue realizada (terminal)
 *
 * A diferencia del estado, que antes se editaba libremente desde el formulario
 * sin dejar rastro, cada cambio queda registrado en `auditoria_historial` con el
 * estado anterior, el nuevo, el usuario y la fecha. Esto da la trazabilidad que
 * el acreditador revisa: quién pasó la auditoría de planificada a cerrada y
 * cuándo.
 *
 * Se permite CERRADA → EN_CURSO para reabrir una auditoría cerrada por error,
 * pero solo con motivo obligatorio (supervisión posterior al cierre), que queda
 * en el historial. Y EN_CURSO → PLANIFICADA para reprogramar una auditoría que
 * aún no se ejecuta.
 */
const TRANSICIONES_AUDITORIA: Record<EstadoAuditoria, EstadoAuditoria[]> = {
  PLANIFICADA: [EstadoAuditoria.EN_CURSO],
  EN_CURSO: [EstadoAuditoria.CERRADA, EstadoAuditoria.PLANIFICADA],
  CERRADA: [EstadoAuditoria.EN_CURSO],
};

/** Motivos de reapertura admitidos al pasar una auditoría de CERRADA a EN_CURSO. */
const MOTIVO_REAPERTURA_AUDITORIA =
  'Debe indicar el motivo de la reapertura (auditoría cerrada por error o supervisión posterior al cierre).';

@Injectable()
export class CalidadService {
  constructor(private prisma: PrismaService) {}

  // ==================== AUDITORÍAS INTERNAS ====================

  async generarCodigoAuditoria(): Promise<string> {
    const auditorias = await this.prisma.auditoriaInterna.findMany({
      select: { codigo: true },
    });
    const patron = /^\d{2} \d{6}$/;
    let max = 0;
    for (const a of auditorias) {
      if (patron.test(a.codigo)) {
        const n = parseInt(a.codigo.slice(3), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    }
    const year = new Date().getFullYear() % 100;
    return `${String(year).padStart(2, '0')} ${String(max + 1).padStart(6, '0')}`;
  }

  /**
   * Valida la independencia del equipo auditor (ISO/IEC 17025:2017, 8.8.2):
   * - El responsable del área auditada no puede auditar su propia área.
   * - Un auditor no puede auditar un laboratorio del que es responsable.
   * Lanza BadRequestException con los conflictos encontrados.
   */
  private async validarIndependenciaAuditores(responsableId: number | undefined, equipoAuditor: any[]) {
    if (!Array.isArray(equipoAuditor) || equipoAuditor.length === 0) return;

    const nombres = equipoAuditor
      .map((m: any) => (typeof m?.nombre === 'string' ? m.nombre.trim() : ''))
      .filter(Boolean);
    if (nombres.length === 0) return;

    const personas = await this.prisma.persona.findMany({
      where: { estado: 'ACTIVO' },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        laboratorios_responsable: { select: { nombre: true } },
      },
    });

    const porNombre = new Map<string, { id: number; labs: string[] }>();
    for (const p of personas) {
      const clave = `${p.nombre} ${p.apellidos}`.trim();
      if (!porNombre.has(clave)) {
        porNombre.set(clave, { id: p.id, labs: p.laboratorios_responsable.map(l => l.nombre) });
      }
    }

    const conflictos: string[] = [];
    for (const m of equipoAuditor) {
      const nombre = typeof m?.nombre === 'string' ? m.nombre.trim() : '';
      if (!nombre) continue;
      const persona = porNombre.get(nombre);
      if (!persona) continue;

      if (responsableId !== undefined && persona.id === responsableId) {
        conflictos.push(`${nombre} es el responsable del área auditada y no puede formar parte del equipo auditor.`);
        continue;
      }

      const lab = typeof m?.funcion === 'string' ? m.funcion.trim() : '';
      if (lab && persona.labs.includes(lab)) {
        conflictos.push(`${nombre} es responsable del laboratorio "${lab}" y no puede auditarlo.`);
      }
    }

    if (conflictos.length > 0) {
      throw new BadRequestException(conflictos.join(' '));
    }
  }

  /**
   * Registra una auditoría. Nace siempre en PLANIFICADA: el estado ya no se
   * fija desde el formulario, se mueve con la máquina de estados
   * (transicionarEstadoAuditoria), que valida y deja historial.
   */
  async createAuditoria(data: any, personaId?: number | null) {
    await this.validarIndependenciaAuditores(data.responsable_id, data.equipo_auditor);
    return this.prisma.$transaction(async (tx) => {
      const auditoria = await tx.auditoriaInterna.create({
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          alcance: data.alcance,
          fecha_inicio: new Date(data.fecha_inicio),
          fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
          responsable_id: data.responsable_id,
          estado: EstadoAuditoria.PLANIFICADA,
          descripcion: data.descripcion,
          objeto: data.objeto,
          documentos_referencia: data.documentos_referencia,
          responsable_auditoria: data.responsable_auditoria,
          equipo_auditor: data.equipo_auditor,
          cronograma: data.cronograma,
          testificaciones: data.testificaciones,
          observaciones: data.observaciones,
          archivo_planificacion: data.archivo_planificacion,
          nombre_oec: data.nombre_oec,
          expediente_nro: data.expediente_nro,
          tipo_oec: data.tipo_oec,
          email_oec: data.email_oec,
          ciudad_pais: data.ciudad_pais,
          telefono_oec: data.telefono_oec,
          direccion_oficina: data.direccion_oficina,
          localizaciones_criticas: data.localizaciones_criticas,
          persona_contacto: data.persona_contacto,
          norma_acreditacion: data.norma_acreditacion,
          actividades_evaluacion: data.actividades_evaluacion,
          tipo_evaluacion: data.tipo_evaluacion,
          fecha_evaluacion_anterior: data.fecha_evaluacion_anterior,
          fecha_testificacion: data.fecha_testificacion,
          localizaciones_evaluacion: data.localizaciones_evaluacion,
          idioma_evaluacion: data.idioma_evaluacion,
          fecha_elaboracion: data.fecha_elaboracion ? new Date(data.fecha_elaboracion) : null,
          elaborado_por: data.elaborado_por,
        },
        include: {
          responsable: { select: { id: true, nombre: true, apellidos: true } },
        },
      });

      await tx.auditoriaHistorial.create({
        data: {
          auditoria_id: auditoria.id,
          estado_anterior: null,
          estado_nuevo: EstadoAuditoria.PLANIFICADA,
          accion: 'CREACION',
          observaciones: 'Auditoría registrada como programada',
          realizado_por_id: personaId ?? null,
        },
      });

      return auditoria;
    });
  }

  async findAllAuditorias() {
    return this.prisma.auditoriaInterna.findMany({
      where: { activo: true },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Control de periodicidad de las auditorías internas (MC22, 22.5.1):
   * "La periodicidad de las auditorías será, al menos, una vez al año sin que
   * supere los 12 meses".
   *
   * El requisito tiene dos facetas y se evalúan las dos:
   *  1. Que no haya pasado más de 12 meses desde la última auditoría interna
   *     realizada (intervalo abierto: última → hoy).
   *  2. Que NINGÚN intervalo entre auditorías internas consecutivas haya
   *     superado los 12 meses: un hueco en medio de la serie es incumplimiento
   *     aunque la última auditoría sea reciente.
   *
   * Considera como "realizada" solo la auditoría interna cerrada o con fecha de
   * fin registrada — una auditoría merelyamente planificada no acredita el
   * cumplimiento del intervalo anual.
   *
   * Devuelve la última auditoría realizada, la fecha límite (12 meses después),
   * todos los intervalos evaluados y el estado del ciclo:
   *   SIN_REGISTRO — nunca se ha registrado una auditoría interna
   *   VENCIDA      — algún intervalo (incluido el abierto) superó los 12 meses
   *   POR_VENCER   — dentro del margen previo (por defecto 90 días)
   *   VIGENTE      — dentro del intervalo
   */
  async getPeriodicidadAuditoria(margenDias = 90) {
    const auditorias = await this.prisma.auditoriaInterna.findMany({
      where: { activo: true, tipo: 'INTERNA' },
      select: {
        id: true,
        codigo: true,
        alcance: true,
        fecha_inicio: true,
        fecha_fin: true,
        estado: true,
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { fecha_inicio: 'desc' },
    });

    const realizadas = auditorias
      .filter((a) => a.estado === EstadoAuditoria.CERRADA || a.fecha_fin !== null)
      .map((a) => ({ ...a, fecha: a.fecha_fin ?? a.fecha_inicio }))
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    // Próxima auditoría ya programada (evita alertar si el ciclo está en marcha).
    const hoy = new Date();
    const programada = auditorias
      .filter(
        (a) =>
          a.estado !== EstadoAuditoria.CERRADA &&
          a.fecha_inicio.getTime() >= hoy.getTime(),
      )
      .sort((a, b) => a.fecha_inicio.getTime() - b.fecha_inicio.getTime())[0];

    const resumenProgramada = programada
      ? {
          id: programada.id,
          codigo: programada.codigo,
          fecha: programada.fecha_inicio,
          estado: programada.estado,
        }
      : null;

    const ultima = realizadas[0] ?? null;
    if (!ultima) {
      return {
        estado: 'SIN_REGISTRO',
        diasRestantes: null,
        diasTranscurridos: null,
        fechaLimite: null,
        ultimaAuditoria: null,
        auditoriaProgramada: resumenProgramada,
        intervalos: [],
        incumplimientos: [],
        abiertaIncumplida: false,
        totalAuditorias: 0,
        margenDias,
      };
    }

    // Suma 12 meses calendario (conserva el día; feb-29 → 01/03 en años no bisiestos).
    const agregarMeses = (fecha: Date, meses: number) => {
      const d = new Date(fecha);
      d.setMonth(d.getMonth() + meses);
      return d;
    };

    const msPorDia = 1000 * 60 * 60 * 24;
    const fechaLimite = agregarMeses(ultima.fecha, 12);
    const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / msPorDia);
    const diasTranscurridos = Math.floor((hoy.getTime() - ultima.fecha.getTime()) / msPorDia);

    // Serie cronológica ascendente para evaluar los intervalos consecutivos.
    const serie = [...realizadas].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    // Intervalos entre auditorías consecutivas (históricos) más el intervalo
    // abierto de la última auditoría hasta hoy, que es el ciclo en curso.
    const intervalos: Array<{
      desde: Date;
      desdeCodigo: string;
      hasta: Date;
      hastaCodigo: string | null;
      dias: number;
      limite: Date;
      cumple: boolean;
      abierta: boolean;
    }> = serie.slice(1).map((a, i) => {
      const previa = serie[i];
      const limite = agregarMeses(previa.fecha, 12);
      return {
        desde: previa.fecha,
        desdeCodigo: previa.codigo,
        hasta: a.fecha,
        hastaCodigo: a.codigo,
        dias: Math.floor((a.fecha.getTime() - previa.fecha.getTime()) / msPorDia),
        limite,
        cumple: a.fecha.getTime() <= limite.getTime(),
        abierta: false,
      };
    });

    const abierta = {
      desde: ultima.fecha,
      desdeCodigo: ultima.codigo,
      hasta: hoy,
      hastaCodigo: null as string | null,
      dias: diasTranscurridos,
      limite: fechaLimite,
      cumple: hoy.getTime() <= fechaLimite.getTime(),
      abierta: true,
    };
    intervalos.push(abierta);

    const incumplimientos = intervalos.filter((i) => !i.cumple);
    const abiertaIncumplida = !abierta.cumple;

    const estado =
      incumplimientos.length > 0
        ? 'VENCIDA'
        : diasRestantes <= margenDias
          ? 'POR_VENCER'
          : 'VIGENTE';

    return {
      estado,
      diasRestantes,
      diasTranscurridos,
      fechaLimite,
      ultimaAuditoria: {
        id: ultima.id,
        codigo: ultima.codigo,
        fecha: ultima.fecha,
        responsable: ultima.responsable,
      },
      auditoriaProgramada: resumenProgramada,
      intervalos,
      incumplimientos,
      abiertaIncumplida,
      totalAuditorias: realizadas.length,
      margenDias,
    };
  }

  async findOneAuditoria(id: number) {
    const auditoria = await this.prisma.auditoriaInterna.findUnique({
      where: { id },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
        no_conformidades: {
          where: { activo: true },
          include: {
            responsable: { select: { id: true, nombre: true, apellidos: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        historial: {
          include: {
            realizado_por: { select: { id: true, nombre: true, apellidos: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!auditoria) throw new NotFoundException(`Auditoría con ID ${id} no encontrada`);
    return auditoria;
  }

  /**
   * Edición de los datos de la auditoría. El estado NO se toca aquí: los cambios
   * de estado pasan por la máquina de estados (transicionarEstadoAuditoria) para
   * que queden validados y registrados en el historial.
   */
  async updateAuditoria(id: number, data: UpdateAuditoriaDto) {
    const existente = await this.findOneAuditoria(id);
    await this.validarIndependenciaAuditores(
      data.responsable_id ?? existente.responsable_id,
      data.equipo_auditor ?? (existente.equipo_auditor as any[]),
    );
    // Se descarta cualquier 'estado' que venga en el cuerpo de la petición.
    const { estado: _estadoIgnorado, ...resto } = data as any;
    return this.prisma.auditoriaInterna.update({
      where: { id },
      data: {
        ...resto,
        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
        fecha_elaboracion: data.fecha_elaboracion ? new Date(data.fecha_elaboracion) : data.fecha_elaboracion === '' ? null : undefined,
      },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
  }

  async removeAuditoria(id: number) {
    await this.findOneAuditoria(id);
    return this.prisma.auditoriaInterna.update({
      where: { id },
      data: { activo: false },
    });
  }

  /**
   * Transición de estado validada por la máquina de estados de la auditoría.
   * Registra el historial (estado anterior → nuevo, usuario, fecha, motivo).
   *
   * Guardas de integridad (MC22 22.5.2):
   * - No se puede ejecutar (EN_CURSO) una auditoría interna sin alcance ni
   *   equipo auditor designado: ISO/IEC 17025:2018 8.8.2 exige auditores
   *   asignados, y el MC22 exige que el JDC designe el equipo.
   * - No se puede cerrar (CERRADA) sin la fecha de término de la auditoría.
   * - No se puede reabrir (CERRADA → EN_CURSO) sin motivo.
   *
   * Las guardas no aplican a las evaluaciones externas (OEC/acreditación), que
   * siguen su propio circuito y no se ejecutan bajo este ciclo.
   */
  async transicionarEstadoAuditoria(
    id: number,
    dto: CambiarEstadoAuditoriaDto,
    personaId?: number | null,
  ) {
    const auditoria = await this.prisma.auditoriaInterna.findUnique({ where: { id } });
    if (!auditoria || !auditoria.activo) {
      throw new NotFoundException(`Auditoría con ID ${id} no encontrada`);
    }

    const estadoAnterior = auditoria.estado;
    const estadoNuevo = dto.estado;

    if (estadoNuevo === estadoAnterior) {
      throw new BadRequestException(`La auditoría ya se encuentra en estado ${estadoAnterior}`);
    }

    const permitidas = TRANSICIONES_AUDITORIA[estadoAnterior] || [];
    if (!permitidas.includes(estadoNuevo)) {
      throw new BadRequestException(
        `Transición no permitida: ${estadoAnterior} → ${estadoNuevo}. Permitidas: ${permitidas.length ? permitidas.join(', ') : 'ninguna'}`,
      );
    }

    const esInterna = auditoria.tipo !== 'EXTERNA';

    if (esInterna && estadoNuevo === EstadoAuditoria.EN_CURSO) {
      if (!auditoria.alcance || !auditoria.alcance.trim()) {
        throw new BadRequestException(
          'No se puede iniciar la ejecución sin el alcance de la auditoría definido',
        );
      }
      const equipo = Array.isArray(auditoria.equipo_auditor) ? auditoria.equipo_auditor : [];
      if (equipo.length === 0) {
        throw new BadRequestException(
          'No se puede iniciar la ejecución sin el equipo auditor designado',
        );
      }
    }

    let fechaFinCierre: Date | null = auditoria.fecha_fin;
    if (estadoNuevo === EstadoAuditoria.CERRADA) {
      fechaFinCierre = dto.fecha_fin ? new Date(dto.fecha_fin) : auditoria.fecha_fin;
      if (!fechaFinCierre) {
        throw new BadRequestException(
          'No se puede cerrar la auditoría sin la fecha de término de la ejecución',
        );
      }
      if (fechaFinCierre.getTime() < new Date(auditoria.fecha_inicio).getTime()) {
        throw new BadRequestException(
          'La fecha de término no puede ser anterior a la fecha de inicio de la auditoría',
        );
      }
    }

    const reabre = estadoAnterior === EstadoAuditoria.CERRADA;
    if (reabre && (!dto.observaciones || !dto.observaciones.trim())) {
      throw new BadRequestException(MOTIVO_REAPERTURA_AUDITORIA);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.auditoriaInterna.update({
        where: { id },
        data: {
          estado: estadoNuevo,
          fecha_fin: estadoNuevo === EstadoAuditoria.CERRADA ? fechaFinCierre : undefined,
        },
      });

      await tx.auditoriaHistorial.create({
        data: {
          auditoria_id: id,
          estado_anterior: estadoAnterior,
          estado_nuevo: estadoNuevo,
          accion: reabre ? 'REAPERTURA' : 'ESTADO',
          observaciones: dto.observaciones ?? null,
          realizado_por_id: personaId ?? null,
        },
      });

      return tx.auditoriaInterna.findUnique({
        where: { id },
        include: {
          responsable: { select: { id: true, nombre: true, apellidos: true } },
          historial: {
            include: {
              realizado_por: { select: { id: true, nombre: true, apellidos: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  // ==================== NO CONFORMIDADES ====================

  private async calcularSiguienteNumeroNc(auditoriaId?: number) {
    const ncs = await this.prisma.noConformidad.findMany({
      where: auditoriaId ? { auditoria_id: auditoriaId } : { auditoria_id: null },
      select: { codigo: true },
    });
    let max = 0;
    for (const nc of ncs) {
      const n = parseInt(nc.codigo, 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return max + 1;
  }

  async siguienteNumeroNc(auditoriaId?: number) {
    return this.calcularSiguienteNumeroNc(auditoriaId);
  }

  async createNc(data: CreateNcDto, personaId?: number | null) {
    const estado = EstadoNC.ABIERTA;
    return this.prisma.$transaction(async (tx) => {
      const nc = await tx.noConformidad.create({
        data: {
          codigo: data.codigo,
          auditoria_id: data.auditoria_id,
          categoria: data.categoria,
          requisito: data.requisito,
          hallazgo: data.hallazgo,
          evidencia: data.evidencia,
          archivo: data.archivo,
          aceptada_oec: data.aceptada_oec,
          reiterada: data.reiterada,
          descripcion: data.descripcion,
          requisito_incumplido: data.requisito_incumplido,
          clasificacion: data.clasificacion,
          causa_raiz: data.causa_raiz,
          acciones_inmediatas: data.acciones_inmediatas,
          plan_accion: data.plan_accion,
          verificacion_eficacia: data.verificacion_eficacia,
          estado,
          responsable_id: data.responsable_id,
          fecha_cierre: data.fecha_cierre ? new Date(data.fecha_cierre) : null,
        },
        include: {
          responsable: { select: { id: true, nombre: true, apellidos: true } },
        },
      });

      await tx.noConformidadHistorial.create({
        data: {
          nc_id: nc.id,
          estado_anterior: null,
          estado_nuevo: estado,
          accion: 'CREACION',
          observaciones: 'No conformidad registrada',
          realizado_por_id: personaId ?? null,
        },
      });

      return nc;
    });
  }

  async findAllNcs() {
    return this.prisma.noConformidad.findMany({
      where: { activo: true, auditoria_id: null },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findNcsByAuditoria(auditoriaId: number) {
    return this.prisma.noConformidad.findMany({
      where: { auditoria_id: auditoriaId, activo: true },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneNc(id: number) {
    const nc = await this.prisma.noConformidad.findUnique({
      where: { id },
      include: {
        auditoria: { select: { id: true, codigo: true, alcance: true } },
        responsable: { select: { id: true, nombre: true, apellidos: true } },
        historial: {
          include: {
            realizado_por: { select: { id: true, nombre: true, apellidos: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!nc) throw new NotFoundException(`No conformidad con ID ${id} no encontrada`);
    return nc;
  }

  async updateNc(id: number, data: UpdateNcDto) {
    await this.findOneNc(id);
    const clean = { ...(data as any) };
    // El estado solo se modifica vía el endpoint de transición (máquina de estados)
    delete clean.estado;
    return this.prisma.noConformidad.update({
      where: { id },
      data: {
        ...clean,
        fecha_cierre: clean.fecha_cierre
          ? new Date(clean.fecha_cierre)
          : clean.fecha_cierre === null
            ? null
            : undefined,
      },
      include: {
        responsable: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
  }

  /**
   * Transición de estado validada por la máquina de estados.
   * Registra el historial (estado anterior → nuevo, usuario, fecha, observaciones)
   * y administra fecha_cierre (se fija al CERRADA y se limpia al reabrir).
   */
  async transicionarEstadoNc(id: number, dto: CambiarEstadoNcDto, personaId?: number | null) {
    const nc = await this.prisma.noConformidad.findUnique({ where: { id } });
    if (!nc || !nc.activo) throw new NotFoundException(`No conformidad con ID ${id} no encontrada`);

    const estadoAnterior = nc.estado;
    const estadoNuevo = dto.estado;

    if (estadoNuevo === estadoAnterior) {
      throw new BadRequestException(`La NC ya se encuentra en estado ${estadoAnterior}`);
    }

    const permitidas = TRANSICIONES_NC[estadoAnterior] || [];
    if (!permitidas.includes(estadoNuevo)) {
      throw new BadRequestException(
        `Transición no permitida: ${estadoAnterior} → ${estadoNuevo}. Permitidas: ${permitidas.length ? permitidas.join(', ') : 'ninguna'}`,
      );
    }

    // Guardas de integridad del ciclo
    if (estadoNuevo === EstadoNC.EN_CURSO && !nc.plan_accion) {
      throw new BadRequestException('No se puede iniciar la ejecución sin un plan de acción registrado');
    }
    if (estadoNuevo === EstadoNC.VERIFICADA) {
      const verif: any = nc.verificacion_eficacia;
      if (!verif || verif.resultado !== 'EFICAZ') {
        throw new BadRequestException('No se puede marcar la NC como VERIFICADA sin una verificación de eficacia con resultado EFICAZ');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0, 0);

      await tx.noConformidad.update({
        where: { id },
        data: {
          estado: estadoNuevo,
          fecha_cierre:
            estadoNuevo === EstadoNC.CERRADA
              ? (nc.fecha_cierre ?? fechaHoy)
              : null,
        },
      });

      await tx.noConformidadHistorial.create({
        data: {
          nc_id: id,
          estado_anterior: estadoAnterior,
          estado_nuevo: estadoNuevo,
          accion: 'ESTADO',
          observaciones: dto.observaciones ?? null,
          realizado_por_id: personaId ?? null,
        },
      });

      return tx.noConformidad.findUnique({
        where: { id },
        include: {
          responsable: { select: { id: true, nombre: true, apellidos: true } },
          historial: {
            include: {
              realizado_por: { select: { id: true, nombre: true, apellidos: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  async removeNc(id: number) {
    await this.findOneNc(id);
    return this.prisma.noConformidad.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ==================== RIESGOS Y OPORTUNIDADES (MC19.1.P1) ====================

  // ==================== QUEJAS (AC1.3.F1-3) ====================

  async siguienteNumeroQueja() {
    const items = await this.prisma.queja.findMany({ select: { codigo: true } });
    let max = 0;
    for (const item of items) {
      const n = parseInt(item.codigo.replace('Q-', ''), 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return `Q-${String(max + 1).padStart(4, '0')}`;
  }

  async createQueja(data: CreateQuejaDto) {
    const codigo = data.codigo || await this.siguienteNumeroQueja();
    const { responsables, ...rest } = data;
    return this.prisma.queja.create({
      data: {
        codigo,
        cliente: rest.cliente,
        telefono_contacto: rest.telefono_contacto,
        email_contacto: rest.email_contacto,
        formulado_por: rest.formulado_por,
        descripcion_queja: rest.descripcion_queja,
        recibida_por: rest.recibida_por,
        recibida_fecha: rest.recibida_fecha ? new Date(rest.recibida_fecha) : null,
        area_afectada: rest.area_afectada,
        procedente: rest.procedente ?? null,
        num_iac: rest.num_iac,
        justificativo_no_procede: rest.justificativo_no_procede,
        acciones: rest.acciones,
        fecha_limite: rest.fecha_limite ? new Date(rest.fecha_limite) : null,
        verificacion_eficacia: rest.verificacion_eficacia,
        cierre_fecha: rest.cierre_fecha ? new Date(rest.cierre_fecha) : null,
        cerrada_por: rest.cerrada_por,
        estado: rest.estado ?? 'RECIBIDA',
        observaciones: rest.observaciones,
        ...(responsables?.length && {
          responsables: {
            create: responsables.map(r => ({
              fase: r.fase,
              nombre: r.nombre,
              cargo: r.cargo,
              fecha: r.fecha ? new Date(r.fecha) : null,
            })),
          },
        }),
      },
      include: { responsables: true },
    });
  }

  async findAllQuejas() {
    return this.prisma.queja.findMany({
      where: { activo: true },
      include: { responsables: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneQueja(id: number) {
    const item = await this.prisma.queja.findUnique({
      where: { id },
      include: { responsables: true },
    });
    if (!item) throw new NotFoundException(`Queja con ID ${id} no encontrada`);
    return item;
  }

  async updateQueja(id: number, data: UpdateQuejaDto) {
    await this.findOneQueja(id);
    const { responsables, ...rest } = data;
    return this.prisma.queja.update({
      where: { id },
      data: {
        ...(rest as any),
        recibida_fecha: rest.recibida_fecha
          ? new Date(rest.recibida_fecha)
          : rest.recibida_fecha === null ? null : undefined,
        fecha_limite: rest.fecha_limite
          ? new Date(rest.fecha_limite)
          : rest.fecha_limite === null ? null : undefined,
        cierre_fecha: rest.cierre_fecha
          ? new Date(rest.cierre_fecha)
          : rest.cierre_fecha === null ? null : undefined,
        ...(responsables && {
          responsables: {
            deleteMany: {},
            create: responsables.map(r => ({
              fase: r.fase,
              nombre: r.nombre,
              cargo: r.cargo,
              fecha: r.fecha ? new Date(r.fecha) : null,
            })),
          },
        }),
      },
      include: { responsables: true },
    });
  }

  async removeQueja(id: number) {
    await this.findOneQueja(id);
    return this.prisma.queja.update({
      where: { id },
      data: { activo: false },
    });
  }

  /**
   * Código correlativo por tipo: R-0001 (riesgo) / O-0001 (oportunidad).
   */
  private async siguienteNumeroRiesgo(tipo: 'RIESGO' | 'OPORTUNIDAD') {
    const prefijo = tipo === 'OPORTUNIDAD' ? 'O' : 'R';
    const items = await this.prisma.riesgoOportunidad.findMany({
      where: { tipo },
      select: { codigo: true },
    });
    let max = 0;
    for (const item of items) {
      const n = parseInt(item.codigo.split('-')[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return `${prefijo}-${String(max + 1).padStart(4, '0')}`;
  }

  /**
   * Calcula el nivel de riesgo (P x I x D) y su condición según la Tabla 4:
   * >= 200 Alto | 80..199 Moderado | < 80 Leve.
   */
  private calcularNivel(probabilidad: number, impacto: number, deteccion: number): { nivel: number; condicion: CondicionRiesgo } {
    const nivel = probabilidad * impacto * deteccion;
    if (nivel >= 200) return { nivel, condicion: CondicionRiesgo.ALTO };
    if (nivel >= 80) return { nivel, condicion: CondicionRiesgo.MODERADO };
    return { nivel, condicion: CondicionRiesgo.LEVE };
  }

  async siguienteNumeroRiesgoEndpoint(tipo: 'RIESGO' | 'OPORTUNIDAD') {
    return this.siguienteNumeroRiesgo(tipo);
  }

  async createRiesgo(data: CreateRiesgoDto) {
    const tipo = data.tipo ?? 'RIESGO';
    const codigo = data.codigo || (await this.siguienteNumeroRiesgo(tipo));
    const { nivel, condicion } = this.calcularNivel(data.probabilidad, data.impacto, data.deteccion);
    const { responsables, ...rest } = data;
    return this.prisma.riesgoOportunidad.create({
      data: {
        codigo,
        tipo,
        proceso: rest.proceso,
        evento: rest.evento,
        causa: rest.causa,
        fuente: rest.fuente,
        consecuencias: rest.consecuencias,
        probabilidad: rest.probabilidad,
        impacto: rest.impacto,
        deteccion: rest.deteccion,
        nivel_riesgo: nivel,
        condicion,
        tratamiento: rest.tratamiento,
        acciones: rest.acciones,
        fecha_limite: rest.fecha_limite ? new Date(rest.fecha_limite) : null,
        verificacion_eficacia: rest.verificacion_eficacia,
        cierre_fecha: rest.cierre_fecha ? new Date(rest.cierre_fecha) : null,
        cerrada_por: rest.cerrada_por,
        estado: rest.estado,
        observaciones: rest.observaciones,
        ...(responsables?.length && {
          responsables: {
            create: responsables.map(r => ({
              fase: r.fase,
              nombre: r.nombre,
              cargo: r.cargo,
              fecha: r.fecha ? new Date(r.fecha) : null,
            })),
          },
        }),
      },
      include: { responsables: true },
    });
  }

  async findAllRiesgos() {
    return this.prisma.riesgoOportunidad.findMany({
      where: { activo: true },
      include: { responsables: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneRiesgo(id: number) {
    const item = await this.prisma.riesgoOportunidad.findUnique({
      where: { id },
      include: { responsables: true },
    });
    if (!item) throw new NotFoundException(`Riesgo/Oportunidad con ID ${id} no encontrado`);
    return item;
  }

  async updateRiesgo(id: number, data: UpdateRiesgoDto) {
    const existente = await this.findOneRiesgo(id);
    const probabilidad = data.probabilidad ?? existente.probabilidad;
    const impacto = data.impacto ?? existente.impacto;
    const deteccion = data.deteccion ?? existente.deteccion;
    const { nivel, condicion } = this.calcularNivel(probabilidad, impacto, deteccion);
    const { responsables, ...rest } = data;
    let autoEstado = rest.estado;
    if (!autoEstado || autoEstado === existente.estado) {
      if ((data.probabilidad !== undefined || data.impacto !== undefined || data.deteccion !== undefined) && existente.estado === 'IDENTIFICADO') {
        autoEstado = 'VALORADO';
      } else if (data.tratamiento !== undefined && existente.estado === 'VALORADO') {
        autoEstado = 'EN_SEGUIMIENTO';
      } else if (data.verificacion_eficacia !== undefined && existente.estado === 'EN_SEGUIMIENTO') {
        autoEstado = 'CERRADO';
      }
    }
    return this.prisma.riesgoOportunidad.update({
      where: { id },
      data: {
        ...(rest as any),
        estado: autoEstado,
        nivel_riesgo: nivel,
        condicion,
        fecha_limite: rest.fecha_limite
          ? new Date(rest.fecha_limite)
          : rest.fecha_limite === null ? null : undefined,
        cierre_fecha: rest.cierre_fecha
          ? new Date(rest.cierre_fecha)
          : rest.cierre_fecha === null ? null : undefined,
        ...(responsables && {
          responsables: {
            deleteMany: {},
            create: responsables.map(r => ({
              fase: r.fase,
              nombre: r.nombre,
              cargo: r.cargo,
              fecha: r.fecha ? new Date(r.fecha) : null,
            })),
          },
        }),
      },
      include: { responsables: true },
    });
  }

  async removeRiesgo(id: number) {
    await this.findOneRiesgo(id);
    return this.prisma.riesgoOportunidad.update({
      where: { id },
      data: { activo: false },
    });
  }
}
