import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getClientesStats(periodo: string = 'diario') {
    const today = new Date();
    let startDate = new Date();
    const bucketsMap = new Map<string, number>();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    if (periodo === 'mensual') {
      // Últimos 12 meses
      startDate.setMonth(today.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      // Pre-llenar buckets
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        bucketsMap.set(`${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`, 0);
      }
    } else {
      // Últimos 30 días
      startDate.setDate(today.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);

      // Pre-llenar buckets
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        bucketsMap.set(`${d.getDate()} ${monthNames[d.getMonth()]}`, 0);
      }
    }

    const dateFilter = { gte: startDate };

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
      if (periodo === 'mensual') {
        return `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
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
