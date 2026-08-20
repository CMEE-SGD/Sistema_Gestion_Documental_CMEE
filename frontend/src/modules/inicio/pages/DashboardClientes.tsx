import React, { useEffect, useState } from 'react';
import api from '../../../core/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Users, UserPlus, AlertTriangle } from 'lucide-react';

export default function DashboardClientes() {
  const [stats, setStats] = useState<any>(null);
  const [periodo, setPeriodo] = useState('diario');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/clientes/stats?periodo=${periodo}`)
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats', err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [periodo]);

  const chartConfig = {
    count: { label: "Cantidad", color: "#1e3a5f" },
  };

  if (loading && !stats) return <div className="p-8 text-center animate-pulse">Cargando métricas...</div>;
  if (!stats) return <div className="p-8 text-center text-destructive">Error al cargar datos.</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard de Clientes</h1>
        <select 
          className="px-4 py-2 border border-input rounded-md bg-background text-foreground text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={periodo} 
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option value="diario">Últimos 30 días</option>
          <option value="mensual">Últimos 12 meses</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta: Clientes Atendidos */}
        <Card className="flex flex-col relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 pb-16 relative z-10">
            <div className="text-3xl font-bold">{stats.clientesAtendidosTotal}</div>
            <p className="text-xs text-muted-foreground">Clientes únicos en el periodo</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.clientesAtendidosSerie}>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card text-card-foreground text-xs p-2 rounded shadow-md border">
                        <p className="font-semibold">{payload[0].payload.fecha}</p>
                        <p>{payload[0].value} clientes</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="count" stroke="#1e3a5f" fill="#1e3a5f" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tarjeta: Nuevos Clientes */}
        <Card className="flex flex-col relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 pb-16 relative z-10">
            <div className="text-3xl font-bold">{stats.nuevosClientesTotal}</div>
            <p className="text-xs text-muted-foreground">Registrados en el periodo</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.nuevosClientesSerie}>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card text-card-foreground text-xs p-2 rounded shadow-md border">
                        <p className="font-semibold">{payload[0].payload.fecha}</p>
                        <p>{payload[0].value} registrados</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="count" stroke="#1e3a5f" fill="#1e3a5f" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tarjeta: Quejas Registradas */}
        <Card className="flex flex-col relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Quejas Registradas</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 pb-16 relative z-10">
            <div className="text-3xl font-bold">{stats.numeroQuejasTotal}</div>
            <p className="text-xs text-muted-foreground">Quejas en el periodo</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.quejasSerie}>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card text-card-foreground text-xs p-2 rounded shadow-md border">
                        <p className="font-semibold">{payload[0].payload.fecha}</p>
                        <p>{payload[0].value} quejas</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="count" stroke="#1e3a5f" fill="#1e3a5f" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quejas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.quejasPorEstado && stats.quejasPorEstado.length > 0 ? (
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.quejasPorEstado}>
                    <XAxis dataKey="estado" />
                    <YAxis 
                      allowDecimals={false} 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={8} 
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-10">
              No hay datos de quejas en este periodo.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
