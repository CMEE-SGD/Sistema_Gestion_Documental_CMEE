import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Etiquetas de fecha del sistema: año-mes-día (2026-11-13) y año-mes (2026-11).
const dos = (n: number) => String(n).padStart(2, '0');
const etiquetaDia = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
const etiquetaMes = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}`;

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getClientesStats(periodo: string = 'ultimos30', mes?: string, anio?: string) {
    const today = new Date();

    let startDate: Date;
    let endDate: Date;
    const bucketsMap = new Map<string, number>();

    switch (periodo) {
      case 'esteMes': {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        const daysInMonth = endDate.getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(today.getFullYear(), today.getMonth(), d);
          bucketsMap.set(etiquetaDia(dt), 0);
        }
        break;
      }
      case 'mesAnterior': {
        const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
        const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        startDate = new Date(prevYear, prevMonth, 1);
        endDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);
        const daysInMonth = endDate.getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(prevYear, prevMonth, d);
          bucketsMap.set(etiquetaDia(dt), 0);
        }
        break;
      }
      case 'esteAnio': {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        for (let m = 0; m < 12; m++) {
          bucketsMap.set(`${today.getFullYear()}-${String(m + 1).padStart(2, '0')}`, 0);
        }
        break;
      }
      case 'personalizado': {
        const m = mes ? parseInt(mes, 10) : today.getMonth() + 1;
        const y = anio ? parseInt(anio, 10) : today.getFullYear();
        startDate = new Date(y, m - 1, 1);
        endDate = new Date(y, m, 0, 23, 59, 59);
        const daysInMonth = endDate.getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(y, m - 1, d);
          bucketsMap.set(etiquetaDia(dt), 0);
        }
        break;
      }
      default: {
        // ultimos30
        startDate = new Date();
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          bucketsMap.set(etiquetaDia(d), 0);
        }
        break;
      }
    }

    const dateFilter = { gte: startDate, lte: endDate };

    const [ordenes, clientesNuevos, quejas, equiposEnTramite] = await Promise.all([
      this.prisma.ordenTrabajo.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true, cliente_id: true, cliente: { select: { tipo: true } } }
      }),
      this.prisma.clienteInstitucional.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true, id: true }
      }),
      this.prisma.queja.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true, estado: true, id: true, procedente: true }
      }),
      // "Clientes en trámite" — foto del momento actual, no del período
      // filtrado arriba: clientes con al menos un equipo que todavía no
      // llegó a FINALIZADO (el único estado terminal del flujo).
      this.prisma.equipoRecepcion.findMany({
        where: { estado: { not: 'FINALIZADO' } },
        select: { orden_trabajo: { select: { cliente_id: true } } }
      })
    ]);
    const clientesEnTramiteTotal = new Set(
      equiposEnTramite.map(e => e.orden_trabajo.cliente_id)
    ).size;

    // Período inmediatamente anterior, de la misma duración — para poder
    // mostrar "+8 vs. período anterior" en vez de solo un número suelto.
    const duracionMs = endDate.getTime() - startDate.getTime();
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duracionMs);
    const prevFilter = { gte: prevStart, lte: prevEnd };

    const [ordenesPrev, nuevosClientesPrevTotal, quejasPrevTotal] = await Promise.all([
      this.prisma.ordenTrabajo.findMany({
        where: { createdAt: prevFilter },
        select: { cliente_id: true }
      }),
      this.prisma.clienteInstitucional.count({ where: { createdAt: prevFilter } }),
      this.prisma.queja.count({ where: { createdAt: prevFilter } }),
    ]);
    const clientesAtendidosPrevTotal = new Set(ordenesPrev.map(o => o.cliente_id)).size;

    // "esteAnio" agrupa por MES (los buckets se inicializaron como "Ene 26",
    // "Feb 26", ...) — el resto de períodos agrupan por DÍA ("15 Mar"). Antes
    // esta función devolvía siempre el formato de día sin importar el
    // período, así que para "esteAnio" nunca coincidía con ningún bucket
    // inicializado y la serie salía siempre en cero pese a que el total sí
    // era correcto (se calcula aparte, sin pasar por los buckets).
    const getBucketKey = (d: Date) => {
      if (periodo === 'esteAnio') {
        return etiquetaMes(d);
      }
      return etiquetaDia(d);
    };

    // 1. Clientes Atendidos Serie
    const clientesAtendidosBuckets = new Map(bucketsMap);
    const uniqueClientsTotal = new Set();
    const tipoPorCliente = new Map<number, string>();
    ordenes.forEach(o => {
      const key = getBucketKey(o.createdAt);
      if (clientesAtendidosBuckets.has(key)) {
        clientesAtendidosBuckets.set(key, clientesAtendidosBuckets.get(key)! + 1);
      }
      uniqueClientsTotal.add(o.cliente_id);
      tipoPorCliente.set(o.cliente_id, o.cliente.tipo);
    });

    // Clientes Atendidos por tipo (MILITAR/CIVIL) — un cliente cuenta una sola
    // vez en el periodo, igual que clientesAtendidosTotal.
    const clientesPorTipoMap = new Map<string, number>();
    tipoPorCliente.forEach((tipo) => {
      clientesPorTipoMap.set(tipo, (clientesPorTipoMap.get(tipo) || 0) + 1);
    });

    // 2. Nuevos Clientes Serie
    const nuevosClientesBuckets = new Map(bucketsMap);
    clientesNuevos.forEach(c => {
      const key = getBucketKey(c.createdAt);
      if (nuevosClientesBuckets.has(key)) {
        nuevosClientesBuckets.set(key, nuevosClientesBuckets.get(key)! + 1);
      }
    });

    // 3. Quejas Serie
    const quejasBuckets = new Map(bucketsMap);
    const quejasEstadosMap = new Map<string, number>();
    let quejasProcedentes = 0;
    let quejasNoProcedentes = 0;
    let quejasSinAnalizar = 0;
    quejas.forEach(q => {
      const key = getBucketKey(q.createdAt);
      if (quejasBuckets.has(key)) {
        quejasBuckets.set(key, quejasBuckets.get(key)! + 1);
      }
      quejasEstadosMap.set(q.estado, (quejasEstadosMap.get(q.estado) || 0) + 1);

      if (q.procedente === true) quejasProcedentes++;
      else if (q.procedente === false) quejasNoProcedentes++;
      else quejasSinAnalizar++;
    });

    return {
      clientesAtendidosTotal: uniqueClientsTotal.size,
      clientesAtendidosSerie: Array.from(clientesAtendidosBuckets, ([fecha, count]) => ({ fecha, count })),

      nuevosClientesTotal: clientesNuevos.length,
      nuevosClientesSerie: Array.from(nuevosClientesBuckets, ([fecha, count]) => ({ fecha, count })),

      numeroQuejasTotal: quejas.length,
      quejasSerie: Array.from(quejasBuckets, ([fecha, count]) => ({ fecha, count })),

      quejasPorEstado: Array.from(quejasEstadosMap, ([estado, count]) => ({ estado, count })),

      clientesPorTipo: Array.from(clientesPorTipoMap, ([tipo, count]) => ({ tipo, count })),

      // No depende del período seleccionado — es "ahora mismo", no
      // "en los últimos N días".
      clientesEnTramiteTotal,

      quejasProcedencia: {
        procedentes: quejasProcedentes,
        noProcedentes: quejasNoProcedentes,
        sinAnalizar: quejasSinAnalizar,
      },

      // Comparativo vs. el mismo número de días inmediatamente anterior al
      // período seleccionado — para poder mostrar tendencia, no solo el total.
      comparativo: {
        clientesAtendidosPrevTotal,
        nuevosClientesPrevTotal,
        numeroQuejasPrevTotal: quejasPrevTotal,
      },
    };
  }

  async getLaboratoriosStats(
    periodo: string = 'ultimos30',
    mes?: string,
    anio?: string,
    fechaInicio?: string,
    fechaFin?: string,
    laboratorioId?: string,
  ) {
    const today = new Date();

    // Filtro opcional por laboratorio (se aplica a todas las consultas).
    const labFilter = laboratorioId
      ? { laboratorio_id: parseInt(laboratorioId, 10) }
      : {};

    // Lógica idéntica a la de clientes: calcula startDate/endDate/bucketsMap
    // por período y reutiliza getBucketKey para agrupar por día o por mes.
    let startDate: Date;
    let endDate: Date;
    const bucketsMap = new Map<string, number>();

    switch (periodo) {
      case 'esteMes': {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        const daysInMonth = endDate.getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(today.getFullYear(), today.getMonth(), d);
          bucketsMap.set(etiquetaDia(dt), 0);
        }
        break;
      }
      case 'mesAnterior': {
        const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
        const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        startDate = new Date(prevYear, prevMonth, 1);
        endDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);
        const daysInMonth = endDate.getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(prevYear, prevMonth, d);
          bucketsMap.set(etiquetaDia(dt), 0);
        }
        break;
      }
      case 'esteAnio': {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        for (let m = 0; m < 12; m++) {
          bucketsMap.set(`${today.getFullYear()}-${String(m + 1).padStart(2, '0')}`, 0);
        }
        break;
      }
      case 'personalizado': {
        // Rango libre: fecha de inicio y fecha de fin (YYYY-MM-DD). Con
        // hasta ~62 días se asignan todos los días; por encima se agrupa por
        // semana para no saturar el eje X de la gráfica.
        const ini = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : new Date(today.getFullYear(), 0, 1);
        const fin = fechaFin ? new Date(`${fechaFin}T23:59:59`) : new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        startDate = ini;
        endDate = fin;
        const duracionDias = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
        if (duracionDias > 62) {
          // Grupos semanales "12 Ene", "19 Ene", ...
          const inicioSemana = new Date(ini);
          inicioSemana.setDate(ini.getDate() - ((ini.getDay() + 6) % 7));
          for (let d = 0; d < duracionDias; d += 7) {
            const dt = new Date(inicioSemana);
            dt.setDate(inicioSemana.getDate() + d);
            if (dt > endDate) break;
            bucketsMap.set(etiquetaDia(dt), 0);
          }
        } else {
          for (let d = 0; d < duracionDias; d++) {
            const dt = new Date(ini);
            dt.setDate(ini.getDate() + d);
            bucketsMap.set(etiquetaDia(dt), 0);
          }
        }
        break;
      }
      default: {
        // ultimos30
        startDate = new Date();
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          bucketsMap.set(etiquetaDia(d), 0);
        }
        break;
      }
    }

    const dateFilter = { gte: startDate, lte: endDate };

    const getBucketKey = (d: Date) => {
      if (periodo === 'esteAnio') return etiquetaMes(d);
      if (periodo === 'personalizado') {
        // Para rangos diarios o semanales. Los buckets de día usan "d MMM"
        // indistintamente del año; para evitar colisiones entre dos períodos
        // con el mismo día en distinto año (p.ej. rango 20 Dic 2025 - 10 Ene
        // 2026) normalizamos el formato a d-M-yy.
        return etiquetaDia(d);
      }
      return etiquetaDia(d);
    };

    // Comparativo: misma duración del período, inmediatamente anterior.
    const duracionMs = endDate.getTime() - startDate.getTime();
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duracionMs);
    const prevFilter = { gte: prevStart, lte: prevEnd };

    const [recibidos, prevRecibidos, prevFinalizados] = await Promise.all([
      // Equipos ingresados (recibidos) en el período — el "volumen que entra".
      this.prisma.equipoRecepcion.findMany({
        where: { createdAt: dateFilter, ...labFilter },
        select: {
          id: true, laboratorio_id: true, estado: true, createdAt: true,
          laboratorio: { select: { nombre: true } },
        },
      }),
      this.prisma.equipoRecepcion.count({ where: { createdAt: prevFilter, ...labFilter } }),
      // Calibrados en el período previo = finalizados (updatedAt marca el
      // momento en que el equipo llegó a FINALIZADO).
      this.prisma.equipoRecepcion.count({
        where: { estado: 'FINALIZADO', updatedAt: prevFilter, ...labFilter },
      }),
    ]);

    // "Calibrados en el período" = equipos que alcanzaron FINALIZADO durante
    // el período seleccionado (updatedAt, no createdAt). Un equipo recibido
    // en un mes anterior y finalizado ahora sí aparece aquí.
    const finalizados = await this.prisma.equipoRecepcion.findMany({
      where: { estado: 'FINALIZADO', updatedAt: dateFilter, ...labFilter },
      select: {
        id: true, laboratorio_id: true, updatedAt: true,
        laboratorio: { select: { nombre: true } },
      },
    });

    // "En trámite / calibrándose" — foto del momento actual, no del período.
    // Incluye todo el pipeline hasta antes de FINALIZADO (el único estado
    // terminal). Se agrupa por laboratorio para la tabla.
    const enTramiteAhora = await this.prisma.equipoRecepcion.findMany({
      where: { estado: { not: 'FINALIZADO' }, ...labFilter },
      select: {
        laboratorio_id: true, estado: true,
        laboratorio: { select: { nombre: true } },
      },
    });

    // "Personal calibrando" — equipos en trámite agrupados por técnico
    // asignado. Foto del momento actual, respeta el filtro por laboratorio.
    const enTramiteConTecnico = await this.prisma.equipoRecepcion.findMany({
      where: { estado: { not: 'FINALIZADO' }, ...labFilter },
      select: {
        tecnico_id: true,
        tecnico: { select: { id: true, grado: true, nombre: true, apellidos: true } },
      },
    });

    // "Calibraciones por servicio" — equipos finalizados en el período
    // agrupados por el procedimiento (servicio) seleccionado al subir el
    // certificado. Los equipos sin procedimiento asociado (históricos) se
    // agrupan como "Sin procedimiento".
    const finalizadosConServicio = await this.prisma.equipoRecepcion.findMany({
      where: { estado: 'FINALIZADO', updatedAt: dateFilter, ...labFilter },
      select: {
        servicio_id: true,
        servicio: { select: { nombre: true, magnitud: true } },
      },
    });
    const servicioMap = new Map<string, { nombre: string; calibrados: number }>();
    finalizadosConServicio.forEach(f => {
      // Mismo orden de prioridad que el resto de la app (ver ServiciosPage y
      // SubirCertificadoModal): el código del procedimiento vive en
      // "magnitud" (ej. "CA4.P1"), no en "nombre", que suele estar vacío.
      const nombre = f.servicio?.magnitud?.trim()
        ? f.servicio.magnitud
        : f.servicio?.nombre?.trim()
          ? f.servicio.nombre
          : f.servicio_id
            ? `Procedimiento #${f.servicio_id}`
            : 'Sin procedimiento';
      const e = servicioMap.get(nombre) || { nombre, calibrados: 0 };
      e.calibrados++;
      servicioMap.set(nombre, e);
    });
    const personalMap = new Map<string, { nombre: string; equipos: number }>();
    enTramiteConTecnico.forEach(t => {
      if (!t.tecnico) return;
      const rotulo = `${t.tecnico.grado ? t.tecnico.grado + ' ' : ''}${t.tecnico.nombre} ${t.tecnico.apellidos}`.trim();
      const e = personalMap.get(rotulo) || { nombre: rotulo, equipos: 0 };
      e.equipos++;
      personalMap.set(rotulo, e);
    });

    // 1. Serie: Recibidos vs. Calibrados por bucket (día o mes según período).
    const recibidosBuckets = new Map(bucketsMap);
    recibidos.forEach(r => {
      const key = getBucketKey(r.createdAt);
      if (recibidosBuckets.has(key)) {
        recibidosBuckets.set(key, recibidosBuckets.get(key)! + 1);
      }
    });

    const finalizadosBuckets = new Map(bucketsMap);
    finalizados.forEach(f => {
      const key = getBucketKey(f.updatedAt);
      if (finalizadosBuckets.has(key)) {
        finalizadosBuckets.set(key, finalizadosBuckets.get(key)! + 1);
      }
    });

    // 2. Por laboratorio: recibido en el período, calibrado en el período y
    // en trámite ahora mismo. Se deriva de las 3 consultas.
    const labMap = new Map<number, {
      laboratorio_id: number;
      nombre: string;
      recibidos: number;
      calibrados: number;
      enTramite: number;
    }>();

    const ensureLab = (id: number, nombre: string) => {
      let e = labMap.get(id);
      if (!e) {
        e = { laboratorio_id: id, nombre, recibidos: 0, calibrados: 0, enTramite: 0 };
        labMap.set(id, e);
      }
      return e;
    };

    recibidos.forEach(r => ensureLab(r.laboratorio_id, r.laboratorio.nombre).recibidos++);
    finalizados.forEach(f => ensureLab(f.laboratorio_id, f.laboratorio.nombre).calibrados++);
    enTramiteAhora.forEach(t => ensureLab(t.laboratorio_id, t.laboratorio.nombre).enTramite++);

    // 3. Pipeline por estado (del flujo de recepción) — dónde está el flujo
    // bloqueado ahora mismo.
    const pipelineMap = new Map<string, number>();
    enTramiteAhora.forEach(t => {
      pipelineMap.set(t.estado, (pipelineMap.get(t.estado) || 0) + 1);
    });
    // Incluir FINALIZADO en el pipeline con el total histórico (no período).
    const totalFinalizadosHist = await this.prisma.equipoRecepcion.count({
      where: { estado: 'FINALIZADO', ...labFilter },
    });
    pipelineMap.set('FINALIZADO', totalFinalizadosHist);

    return {
      equiposRecibidosTotal: recibidos.length,
      equiposRecibidosSerie: Array.from(recibidosBuckets, ([fecha, count]) => ({ fecha, count })),

      equiposCalibradosTotal: finalizados.length,
      equiposCalibradosSerie: Array.from(finalizadosBuckets, ([fecha, count]) => ({ fecha, count })),

      equiposEnTramiteTotal: enTramiteAhora.length,

      // Personal con equipos en trámite asignados ahora mismo, ordenado por
      // carga de trabajo (más equipos primero).
      personalCalibrando: Array.from(personalMap.values())
        .sort((a, b) => b.equipos - a.equipos),

      // Calibraciones del período por procedimiento/servicio, ordenadas por
      // cantidad (más calibradas primero).
      calibradosPorServicio: Array.from(servicioMap.values())
        .sort((a, b) => b.calibrados - a.calibrados),

      porLaboratorio: Array.from(labMap.values())
        .sort((a, b) => b.enTramite - a.enTramite),
      // Orden estable por nombre siempre que el frontend no cuente con orderBy.
      pipelinePorEstado: Array.from(
        pipelineMap,
        ([estado, count]) => ({ estado, count }),
      ),

      comparativo: {
        equiposRecibidosPrevTotal: prevRecibidos,
        equiposCalibradosPrevTotal: prevFinalizados,
      },
    };
  }

  // Equipos por provincia del cliente para el mapa de calor. Un equipo cuenta
  // como calibrado si ya tiene fecha de calibración o llegó a FINALIZADO; si no,
  // está por calibrar. "Próximos" son los que vencen en los próximos `dias`.
  async getMapaCalor(dias: number = 60) {
    const { hoy, limite } = this.ventanaProximos(dias);

    const equipos = await this.prisma.equipoRecepcion.findMany({
      select: {
        id: true,
        equipo_descripcion: true,
        estado: true,
        fecha_calibracion: true,
        fecha_proxima_calibracion: true,
        orden_trabajo: {
          select: {
            cliente: {
              select: { id: true, nombre: true, provincia: true, ciudad: true },
            },
          },
        },
      },
    });

    type Conteo = { calibrados: number; porCalibrar: number; proximos: number };
    type Empresa = Conteo & { id: number; nombre: string; ciudad: string | null };
    type Fila = Conteo & { provincia: string; empresas: Map<number, Empresa> };
    const porProvincia = new Map<string, Fila>();
    let sinProvincia = 0;
    // Un punto por equipo para el mapa. Cada equipo tiene UN solo estado, con
    // prioridad: próximo a vencer (rojo) > por calibrar (amarillo) > calibrado
    // (verde). Así lo urgente siempre se ve.
    const puntos: {
      id: number;
      provincia: string;
      clienteId: number;
      cliente: string;
      descripcion: string;
      estado: 'PROXIMO' | 'POR_CALIBRAR' | 'CALIBRADO';
    }[] = [];

    for (const e of equipos) {
      const { id, nombre, provincia, ciudad } = e.orden_trabajo.cliente;
      if (!provincia) {
        sinProvincia++;
        continue;
      }
      let fila = porProvincia.get(provincia);
      if (!fila) {
        fila = {
          provincia,
          calibrados: 0,
          porCalibrar: 0,
          proximos: 0,
          empresas: new Map(),
        };
        porProvincia.set(provincia, fila);
      }
      let empresa = fila.empresas.get(id);
      if (!empresa) {
        empresa = { id, nombre, ciudad, calibrados: 0, porCalibrar: 0, proximos: 0 };
        fila.empresas.set(id, empresa);
      }

      const calibrado =
        e.fecha_calibracion !== null || e.estado === 'FINALIZADO';
      const proxima = e.fecha_proxima_calibracion;
      const proximo = !!proxima && proxima >= hoy && proxima <= limite;

      for (const c of [fila, empresa]) {
        if (calibrado) c.calibrados++;
        else c.porCalibrar++;
        if (proximo) c.proximos++;
      }

      puntos.push({
        id: e.id,
        provincia,
        clienteId: id,
        cliente: nombre,
        descripcion: e.equipo_descripcion,
        estado: proximo ? 'PROXIMO' : calibrado ? 'CALIBRADO' : 'POR_CALIBRAR',
      });
    }

    return {
      dias,
      sinProvincia,
      puntos,
      provincias: [...porProvincia.values()]
        .map(({ empresas, ...resto }) => ({
          ...resto,
          clientes: empresas.size,
          // Las más activas primero; el frontend reordena según el filtro.
          empresas: [...empresas.values()].sort(
            (a, b) => b.calibrados - a.calibrados || a.nombre.localeCompare(b.nombre, 'es'),
          ),
        }))
        .sort((a, b) => a.provincia.localeCompare(b.provincia, 'es')),
    };
  }

  // Hoy (a medianoche) y el límite de la ventana "próximos N días".
  private ventanaProximos(dias: number) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + dias);
    return { hoy, limite };
  }

  // Equipos de una empresa para el detalle del mapa de calor. Aplica las mismas
  // reglas de getMapaCalor: calibrado, próximo a vencer y (aquí además) vencido.
  async getMapaCalorEmpresa(clienteId: number, dias: number = 60) {
    const cliente = await this.prisma.clienteInstitucional.findUnique({
      where: { id: clienteId },
      select: { id: true, nombre: true, provincia: true, ciudad: true },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    const { hoy, limite } = this.ventanaProximos(dias);
    const equipos = await this.prisma.equipoRecepcion.findMany({
      where: { orden_trabajo: { cliente_id: clienteId } },
      select: {
        id: true,
        equipo_descripcion: true,
        marca: true,
        modelo: true,
        codigo_serie: true,
        codigo_cmee: true,
        estado: true,
        fecha_calibracion: true,
        fecha_proxima_calibracion: true,
        laboratorio: { select: { nombre: true } },
        orden_trabajo: { select: { orden_trabajo_fisica: true } },
      },
    });

    const filas = equipos.map((e) => {
      const proxima = e.fecha_proxima_calibracion;
      return {
        id: e.id,
        descripcion: e.equipo_descripcion,
        marca: e.marca,
        modelo: e.modelo,
        serie: e.codigo_serie,
        codigoCmee: e.codigo_cmee,
        laboratorio: e.laboratorio.nombre,
        orden: e.orden_trabajo.orden_trabajo_fisica,
        estado: e.estado,
        fechaCalibracion: e.fecha_calibracion,
        fechaProximaCalibracion: proxima,
        calibrado: e.fecha_calibracion !== null || e.estado === 'FINALIZADO',
        proximo: !!proxima && proxima >= hoy && proxima <= limite,
        vencido: !!proxima && proxima < hoy,
      };
    });

    // Los calibrados más recientes primero; los que aún no tienen fecha, al final.
    filas.sort((a, b) => {
      const fa = a.fechaCalibracion?.getTime() ?? -Infinity;
      const fb = b.fechaCalibracion?.getTime() ?? -Infinity;
      return fb - fa || a.id - b.id;
    });

    return { dias, cliente, equipos: filas };
  }
}
