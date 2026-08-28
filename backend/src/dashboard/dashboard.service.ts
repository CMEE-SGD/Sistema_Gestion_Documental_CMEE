import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getClientesStats(periodo: string = 'ultimos30', mes?: string, anio?: string) {
    const today = new Date();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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
          bucketsMap.set(`${dt.getDate()} ${monthNames[dt.getMonth()]}`, 0);
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
          bucketsMap.set(`${dt.getDate()} ${monthNames[dt.getMonth()]}`, 0);
        }
        break;
      }
      case 'esteAnio': {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        for (let m = 0; m < 12; m++) {
          bucketsMap.set(`${monthNames[m]} ${today.getFullYear().toString().slice(-2)}`, 0);
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
          bucketsMap.set(`${dt.getDate()} ${monthNames[dt.getMonth()]}`, 0);
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
          bucketsMap.set(`${d.getDate()} ${monthNames[d.getMonth()]}`, 0);
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
        return `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      }
      return `${d.getDate()} ${monthNames[d.getMonth()]}`;
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
}
