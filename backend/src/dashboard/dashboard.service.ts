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

    const [ordenes, clientesNuevos, quejas] = await Promise.all([
      this.prisma.ordenTrabajo.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true, cliente_id: true }
      }),
      this.prisma.clienteInstitucional.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true, id: true }
      }),
      this.prisma.queja.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true, estado: true, id: true }
      })
    ]);

    const getBucketKey = (d: Date) => {
      if (periodo === 'esteAnio' || (periodo === 'personalizado' && mes && anio)) {
        return `${d.getDate()} ${monthNames[d.getMonth()]}`;
      }
      if (periodo === 'esteMes' || periodo === 'mesAnterior') {
        return `${d.getDate()} ${monthNames[d.getMonth()]}`;
      }
      return `${d.getDate()} ${monthNames[d.getMonth()]}`;
    };

    // 1. Clientes Atendidos Serie
    const clientesAtendidosBuckets = new Map(bucketsMap);
    const uniqueClientsTotal = new Set();
    ordenes.forEach(o => {
      const key = getBucketKey(o.createdAt);
      if (clientesAtendidosBuckets.has(key)) {
        clientesAtendidosBuckets.set(key, clientesAtendidosBuckets.get(key)! + 1);
      }
      uniqueClientsTotal.add(o.cliente_id);
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
    quejas.forEach(q => {
      const key = getBucketKey(q.createdAt);
      if (quejasBuckets.has(key)) {
        quejasBuckets.set(key, quejasBuckets.get(key)! + 1);
      }
      quejasEstadosMap.set(q.estado, (quejasEstadosMap.get(q.estado) || 0) + 1);
    });

    return {
      clientesAtendidosTotal: uniqueClientsTotal.size,
      clientesAtendidosSerie: Array.from(clientesAtendidosBuckets, ([fecha, count]) => ({ fecha, count })),

      nuevosClientesTotal: clientesNuevos.length,
      nuevosClientesSerie: Array.from(nuevosClientesBuckets, ([fecha, count]) => ({ fecha, count })),

      numeroQuejasTotal: quejas.length,
      quejasSerie: Array.from(quejasBuckets, ([fecha, count]) => ({ fecha, count })),

      quejasPorEstado: Array.from(quejasEstadosMap, ([estado, count]) => ({ estado, count })),
    };
  }
}
