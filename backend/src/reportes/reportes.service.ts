import { Injectable } from '@nestjs/common';
import { EstadoRecepcion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { formatearNumeroCertificado } from '../common/helpers/certificado-format';
import { isRestrictedToLab, type HydratedUser } from '../common/helpers/lab-scope';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Un OBT o técnico (isRestrictedToLab) no puede elegir de qué laboratorio
   * pedir el reporte: se ignora el laboratorio_id que llegó por query string
   * y se fuerza el suyo propio (-1 si no tiene uno asignado, para no
   * devolver resultados de nadie). Jefe de Laboratorio, Director,
   * Administrador y Servicio al Cliente conservan el filtro libre de
   * siempre — hay un solo Jefe de Laboratorio para los 5 laboratorios, así
   * que necesita verlos todos.
   */
  private resolverLaboratorioId(
    laboratorioId: number | undefined,
    user?: HydratedUser,
  ): number | undefined {
    if (!user || user.isGod) return laboratorioId;
    if (!isRestrictedToLab(user.puesto ?? '')) return laboratorioId;
    return user.laboratorio_id ?? -1;
  }

  /** 8.7 — Reportes por laboratorio: volumen de equipos y avance por laboratorio. */
  async porLaboratorio(user?: HydratedUser) {
    const laboratorioId = this.resolverLaboratorioId(undefined, user);

    const laboratorios = await this.prisma.laboratorio.findMany({
      where: { activo: true, ...(laboratorioId ? { id: laboratorioId } : {}) },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    const equipos = await this.prisma.equipoRecepcion.findMany({
      select: { laboratorio_id: true, estado: true },
      where: laboratorioId ? { laboratorio_id: laboratorioId } : undefined,
    });

    return laboratorios.map((lab) => {
      const propios = equipos.filter((e) => e.laboratorio_id === lab.id);
      const finalizados = propios.filter(
        (e) => e.estado === EstadoRecepcion.FINALIZADO,
      ).length;

      return {
        laboratorio_id: lab.id,
        laboratorio: lab.nombre,
        total_equipos: propios.length,
        en_proceso: propios.length - finalizados,
        finalizados,
      };
    });
  }

  /**
   * 8.7 — Certificados emitidos: equipos que completaron todo el flujo
   * (FINALIZADO). Se toma el certificado más reciente por equipo, ya que un
   * ciclo de rechazo puede haber generado versiones anteriores.
   */
  async certificadosEmitidos(
    laboratorioId?: number,
    desde?: string,
    hasta?: string,
    user?: HydratedUser,
  ) {
    laboratorioId = this.resolverLaboratorioId(laboratorioId, user);
    const equipos = await this.prisma.equipoRecepcion.findMany({
      where: {
        estado: EstadoRecepcion.FINALIZADO,
        ...(laboratorioId ? { laboratorio_id: laboratorioId } : {}),
      },
      select: {
        id: true,
        equipo_descripcion: true,
        laboratorio: { select: { nombre: true } },
        orden_trabajo: {
          select: {
            orden_trabajo_fisica: true,
            cliente: { select: { nombre: true } },
          },
        },
        certificados: {
          orderBy: { fecha_subida: 'desc' },
          take: 1,
          select: {
            numero_certificado: true,
            fecha_subida: true,
            tecnico: { select: { nombre: true, apellidos: true } },
          },
        },
      },
    });

    const desdeDate = desde ? new Date(desde) : null;
    const hastaDate = hasta ? new Date(hasta) : null;

    return equipos
      .filter((e) => e.certificados.length > 0)
      .filter((e) => {
        if (!desdeDate && !hastaDate) return true;
        const fecha = e.certificados[0].fecha_subida;
        if (desdeDate && fecha < desdeDate) return false;
        if (hastaDate && fecha > hastaDate) return false;
        return true;
      })
      .map((e) => {
        const cert = e.certificados[0];
        return {
          equipo_id: e.id,
          equipo: e.equipo_descripcion,
          laboratorio: e.laboratorio.nombre,
          cliente: e.orden_trabajo.cliente.nombre,
          orden_trabajo_fisica: e.orden_trabajo.orden_trabajo_fisica,
          numero_certificado: formatearNumeroCertificado(
            cert.numero_certificado,
            cert.fecha_subida,
          ),
          fecha_emision: cert.fecha_subida,
          tecnico: `${cert.tecnico.nombre} ${cert.tecnico.apellidos}`,
        };
      });
  }

  /** 8.7 — Certificados pendientes: equipos que todavía no llegan a FINALIZADO. */
  async certificadosPendientes(laboratorioId?: number, user?: HydratedUser) {
    laboratorioId = this.resolverLaboratorioId(laboratorioId, user);
    const equipos = await this.prisma.equipoRecepcion.findMany({
      where: {
        estado: { not: EstadoRecepcion.FINALIZADO },
        ...(laboratorioId ? { laboratorio_id: laboratorioId } : {}),
      },
      select: {
        id: true,
        equipo_descripcion: true,
        estado: true,
        laboratorio: { select: { nombre: true } },
        orden_trabajo: {
          select: {
            orden_trabajo_fisica: true,
            cliente: { select: { nombre: true } },
          },
        },
        tecnico: { select: { nombre: true, apellidos: true } },
        fecha_ingreso_laboratorio: true,
      },
      orderBy: { fecha_ingreso_laboratorio: 'asc' },
    });

    return equipos.map((e) => ({
      equipo_id: e.id,
      equipo: e.equipo_descripcion,
      laboratorio: e.laboratorio.nombre,
      cliente: e.orden_trabajo.cliente.nombre,
      orden_trabajo_fisica: e.orden_trabajo.orden_trabajo_fisica,
      estado: e.estado,
      tecnico: e.tecnico ? `${e.tecnico.nombre} ${e.tecnico.apellidos}` : null,
      fecha_ingreso_laboratorio: e.fecha_ingreso_laboratorio,
    }));
  }

  /**
   * 8.7 — Certificados observados: equipos con al menos un rechazo en su
   * historial que aún no llegan a FINALIZADO (es decir, siguen en retrabajo).
   */
  async certificadosObservados(laboratorioId?: number, user?: HydratedUser) {
    laboratorioId = this.resolverLaboratorioId(laboratorioId, user);
    const equipos = await this.prisma.equipoRecepcion.findMany({
      where: {
        estado: { not: EstadoRecepcion.FINALIZADO },
        ...(laboratorioId ? { laboratorio_id: laboratorioId } : {}),
        historial_estado: { some: { accion: 'RECHAZAR' } },
      },
      select: {
        id: true,
        equipo_descripcion: true,
        estado: true,
        laboratorio: { select: { nombre: true } },
        orden_trabajo: {
          select: {
            orden_trabajo_fisica: true,
            cliente: { select: { nombre: true } },
          },
        },
        historial_estado: {
          where: { accion: 'RECHAZAR' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            observaciones: true,
            createdAt: true,
            realizado_por: { select: { nombre: true, apellidos: true } },
          },
        },
      },
    });

    return equipos.map((e) => {
      const ultimo = e.historial_estado[0] ?? null;
      return {
        equipo_id: e.id,
        equipo: e.equipo_descripcion,
        laboratorio: e.laboratorio.nombre,
        cliente: e.orden_trabajo.cliente.nombre,
        orden_trabajo_fisica: e.orden_trabajo.orden_trabajo_fisica,
        estado_actual: e.estado,
        ultima_observacion: ultimo?.observaciones ?? null,
        observado_por: ultimo
          ? `${ultimo.realizado_por.nombre} ${ultimo.realizado_por.apellidos}`
          : null,
        fecha_observacion: ultimo?.createdAt ?? null,
      };
    });
  }

  /**
   * 8.7 — Tiempos de atención: días entre el ingreso al laboratorio y el
   * cierre (FINALIZADO), agregado por laboratorio.
   */
  async tiemposAtencion(laboratorioId?: number, user?: HydratedUser) {
    laboratorioId = this.resolverLaboratorioId(laboratorioId, user);
    const equipos = await this.prisma.equipoRecepcion.findMany({
      where: {
        estado: EstadoRecepcion.FINALIZADO,
        ...(laboratorioId ? { laboratorio_id: laboratorioId } : {}),
      },
      select: {
        laboratorio_id: true,
        laboratorio: { select: { nombre: true } },
        fecha_ingreso_laboratorio: true,
        orden_trabajo: { select: { fecha_ingreso: true } },
        historial_estado: {
          where: { estado_nuevo: EstadoRecepcion.FINALIZADO },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const porLaboratorio = new Map<
      number,
      { nombre: string; dias: number[] }
    >();

    for (const e of equipos) {
      const cierre = e.historial_estado[0]?.createdAt;
      const inicio =
        e.fecha_ingreso_laboratorio ?? e.orden_trabajo.fecha_ingreso;
      if (!cierre || !inicio) continue;

      const dias = Math.max(
        0,
        (cierre.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (!porLaboratorio.has(e.laboratorio_id)) {
        porLaboratorio.set(e.laboratorio_id, {
          nombre: e.laboratorio.nombre,
          dias: [],
        });
      }
      porLaboratorio.get(e.laboratorio_id)!.dias.push(dias);
    }

    return Array.from(porLaboratorio.entries()).map(
      ([id, { nombre, dias }]) => ({
        laboratorio_id: id,
        laboratorio: nombre,
        equipos_finalizados: dias.length,
        promedio_dias: Number(
          (dias.reduce((a, b) => a + b, 0) / dias.length).toFixed(1),
        ),
        minimo_dias: Number(Math.min(...dias).toFixed(1)),
        maximo_dias: Number(Math.max(...dias).toFixed(1)),
      }),
    );
  }

  /**
   * 8.7 — Reportes de calidad: se deriva de los rechazos registrados en el
   * historial de estado, ya que el sistema aún no tiene un módulo separado
   * de no conformidades/acciones correctivas.
   */
  async calidad(laboratorioId?: number, user?: HydratedUser) {
    laboratorioId = this.resolverLaboratorioId(laboratorioId, user);
    const rechazos = await this.prisma.historialEstado.findMany({
      where: {
        accion: 'RECHAZAR',
        ...(laboratorioId
          ? { equipo_recepcion: { laboratorio_id: laboratorioId } }
          : {}),
      },
      select: {
        estado_anterior: true,
        createdAt: true,
        observaciones: true,
        equipo_recepcion: {
          select: {
            id: true,
            equipo_descripcion: true,
            laboratorio: { select: { id: true, nombre: true } },
            tecnico: { select: { nombre: true, apellidos: true } },
          },
        },
        realizado_por: { select: { nombre: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const porLaboratorio = new Map<
      number,
      { nombre: string; cantidad: number }
    >();
    for (const r of rechazos) {
      const labId = r.equipo_recepcion.laboratorio.id;
      if (!porLaboratorio.has(labId)) {
        porLaboratorio.set(labId, {
          nombre: r.equipo_recepcion.laboratorio.nombre,
          cantidad: 0,
        });
      }
      porLaboratorio.get(labId)!.cantidad += 1;
    }

    return {
      resumen_por_laboratorio: Array.from(porLaboratorio.entries()).map(
        ([id, v]) => ({
          laboratorio_id: id,
          laboratorio: v.nombre,
          total_observaciones: v.cantidad,
        }),
      ),
      detalle: rechazos.map((r) => ({
        equipo_id: r.equipo_recepcion.id,
        equipo: r.equipo_recepcion.equipo_descripcion,
        laboratorio: r.equipo_recepcion.laboratorio.nombre,
        tecnico: r.equipo_recepcion.tecnico
          ? `${r.equipo_recepcion.tecnico.nombre} ${r.equipo_recepcion.tecnico.apellidos}`
          : null,
        etapa_rechazada: r.estado_anterior,
        observacion: r.observaciones,
        observado_por: `${r.realizado_por.nombre} ${r.realizado_por.apellidos}`,
        fecha: r.createdAt,
      })),
    };
  }

  /** 8.7 — Reportes administrativos: panorama general del período. */
  async administrativo(desde?: string, hasta?: string, user?: HydratedUser) {
    const desdeDate = desde ? new Date(desde) : undefined;
    const hastaDate = hasta ? new Date(hasta) : undefined;
    const laboratorioId = this.resolverLaboratorioId(undefined, user);

    const whereOrdenFecha =
      desdeDate || hastaDate
        ? {
            fecha_ingreso: {
              ...(desdeDate ? { gte: desdeDate } : {}),
              ...(hastaDate ? { lte: hastaDate } : {}),
            },
          }
        : {};

    // Una orden puede tener equipos de más de un laboratorio (ver el fix de
    // "restringir por laboratorio" en recepcion-equipos): para un OBT/técnico
    // no basta filtrar por fecha, hay que exigir que al menos un equipo de la
    // orden sea de su laboratorio.
    const whereOrden = laboratorioId
      ? { ...whereOrdenFecha, equipos: { some: { laboratorio_id: laboratorioId } } }
      : whereOrdenFecha;

    const [totalOrdenes, equipos] = await Promise.all([
      this.prisma.ordenTrabajo.count({ where: whereOrden }),
      this.prisma.equipoRecepcion.findMany({
        where: {
          orden_trabajo: whereOrdenFecha,
          ...(laboratorioId ? { laboratorio_id: laboratorioId } : {}),
        },
        select: { estado: true, orden_trabajo: { select: { cliente_id: true } } },
      }),
    ]);

    // Sin restricción de laboratorio, "clientes" es el total real del
    // sistema (no depende del período, igual que antes). Restringido, se
    // deriva de los equipos ya filtrados por laboratorio: clientes distintos
    // que tienen al menos un equipo en ese laboratorio.
    const totalClientes = laboratorioId
      ? new Set(equipos.map((e) => e.orden_trabajo.cliente_id)).size
      : await this.prisma.clienteInstitucional.count();

    const porEstado = equipos.reduce<Record<string, number>>((acc, e) => {
      acc[e.estado] = (acc[e.estado] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total_clientes: totalClientes,
      total_ordenes: totalOrdenes,
      total_equipos: equipos.length,
      equipos_por_estado: porEstado,
    };
  }
}
