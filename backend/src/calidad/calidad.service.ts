import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoNC, CondicionRiesgo } from '@prisma/client';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
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

  async createAuditoria(data: any) {
    await this.validarIndependenciaAuditores(data.responsable_id, data.equipo_auditor);
    return this.prisma.auditoriaInterna.create({
      data: {
        codigo: data.codigo,
        tipo: data.tipo,
        alcance: data.alcance,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
        responsable_id: data.responsable_id,
        estado: data.estado,
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
      },
    });
    if (!auditoria) throw new NotFoundException(`Auditoría con ID ${id} no encontrada`);
    return auditoria;
  }

  async updateAuditoria(id: number, data: UpdateAuditoriaDto) {
    const existente = await this.findOneAuditoria(id);
    await this.validarIndependenciaAuditores(
      data.responsable_id ?? existente.responsable_id,
      data.equipo_auditor ?? (existente.equipo_auditor as any[]),
    );
    return this.prisma.auditoriaInterna.update({
      where: { id },
      data: {
        ...data,
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
    return this.prisma.riesgoOportunidad.update({
      where: { id },
      data: {
        ...(rest as any),
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
