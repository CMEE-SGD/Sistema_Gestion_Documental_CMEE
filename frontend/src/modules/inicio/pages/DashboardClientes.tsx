import React, { useEffect, useState, useCallback } from 'react';
import api from '../../../core/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Users, UserPlus, AlertTriangle } from 'lucide-react';

type KpiKey = 'clientesAtendidos' | 'nuevosClientes' | 'quejas';
type Periodo = 'ultimos30' | 'esteMes' | 'mesAnterior' | 'esteAnio' | 'personalizado';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const now = new Date();
const ANIOS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

const kpiDefs: Record<KpiKey, { label: string; subtitle: string; icon: React.ReactNode; color: string; dataKey: string; valueKey: string; tooltipLabel: string }> = {
  clientesAtendidos: {
    label: 'Clientes Atendidos',
    subtitle: 'Clientes únicos en el periodo',
    icon: <Users className="w-5 h-5" />,
    color: '#1e3a5f',
    dataKey: 'clientesAtendidosSerie',
    valueKey: 'clientesAtendidosTotal',
    tooltipLabel: 'clientes',
  },
  nuevosClientes: {
    label: 'Nuevos Clientes',
    subtitle: 'Registrados en el periodo',
    icon: <UserPlus className="w-5 h-5" />,
    color: '#0e7c6b',
    dataKey: 'nuevosClientesSerie',
    valueKey: 'nuevosClientesTotal',
    tooltipLabel: 'registrados',
  },
  quejas: {
    label: 'Quejas Registradas',
    subtitle: 'Quejas en el periodo',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: '#b45309',
    dataKey: 'quejasSerie',
    valueKey: 'numeroQuejasTotal',
    tooltipLabel: 'quejas',
  },
};

function buildParams(periodo: Periodo, mes: number, anio: number): string {
  const p = new URLSearchParams();
  switch (periodo) {
    case 'esteMes':
      p.set('periodo', 'esteMes');
      break;
    case 'mesAnterior':
      p.set('periodo', 'mesAnterior');
      break;
    case 'esteAnio':
      p.set('periodo', 'esteAnio');
      break;
    case 'personalizado':
      p.set('periodo', 'personalizado');
      p.set('mes', String(mes + 1));
      p.set('anio', String(anio));
      break;
    default:
      p.set('periodo', 'ultimos30');
  }
  return p.toString();
}

export default function DashboardClientes() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeKpi, setActiveKpi] = useState<KpiKey | null>(null);

  const [periodo, setPeriodo] = useState<Periodo>('ultimos30');
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());

  const fetchData = useCallback(() => {
    setLoading(true);
    const qs = buildParams(periodo, mes, anio);
    api.get(`/dashboard/clientes/stats?${qs}`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [periodo, mes, anio]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartConfig = { count: { label: 'Cantidad', color: '#1e3a5f' } };

  const handleKpiClick = (key: KpiKey) => {
    setActiveKpi(prev => prev === key ? null : key);
  };

  const inputCls = 'px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  if (loading && !stats) return <div className="p-8 text-center animate-pulse">Cargando métricas...</div>;
  if (!stats) return <div className="p-8 text-center text-destructive">Error al cargar datos.</div>;

  const active = activeKpi ? kpiDefs[activeKpi] : null;
  const activeData = activeKpi ? stats[active!.dataKey] : null;

  return (
    <div className="p-8 space-y-6">
      {/* Header + Filtros */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard de Clientes</h1>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 bg-card border border-border rounded-lg shadow-sm">
          {/* Período */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Período</label>
            <select
              className={inputCls}
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as Periodo)}
            >
              <option value="ultimos30">Últimos 30 días</option>
              <option value="esteMes">Este mes</option>
              <option value="mesAnterior">Mes anterior</option>
              <option value="esteAnio">Este año</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {/* Filtros condicionales */}
          {periodo === 'personalizado' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Mes</label>
                <select className={inputCls} value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                  {MESES.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Año</label>
                <select className={inputCls} value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Botón aplicar */}
          <button
            onClick={fetchData}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(kpiDefs) as KpiKey[]).map((key) => {
          const def = kpiDefs[key];
          const isSelected = activeKpi === key;
          return (
            <Card
              key={key}
              onClick={() => handleKpiClick(key)}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-offset-2 shadow-md' : 'hover:scale-[1.01]'
              }`}
              style={isSelected ? { borderColor: def.color } : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{def.label}</CardTitle>
                <span style={{ color: def.color }}>{def.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats[def.valueKey]}</div>
                <p className="text-xs text-muted-foreground mt-1">{def.subtitle}</p>
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  {isSelected ? '▼ Ocultar gráfica' : '▶ Ver gráfica'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expanded chart */}
      {/* Expanded chart */}
      {activeKpi && active && (
        <Card className="border-t-2 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: active.color }}>
              {active.icon}
              {active.label} — Serie temporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeData && activeData.length > 0 ? (
              <ChartContainer 
                config={{ count: { label: active.label, color: active.color } }} 
                className="h-[300px] w-full"
              >
                <AreaChart 
                  data={activeData} 
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id={`grad-${activeKpi}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={active.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={active.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 10 }} // Letra más pequeña para que quepan más días
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={0} // Obliga a Recharts a reducir el espacio entre etiquetas
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={8} 
                    domain={[0, 'dataMax + 1']} // Asegura que la curva baje hasta el cero
                  />
                  <ChartTooltip
                    content={({ active: a, payload }) => {
                      if (a && payload && payload.length) {
                        return (
                          <div className="bg-card text-card-foreground text-xs p-2 rounded shadow-md border">
                            <p className="font-semibold">{payload[0].payload.fecha}</p>
                            <p>{payload[0].value} {active.tooltipLabel}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={active.color}
                    fill={`url(#grad-${activeKpi})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-10">
                No hay datos para este KPI en este periodo.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quejas por Estado - always visible */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quejas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.quejasPorEstado && stats.quejasPorEstado.length > 0 ? (
            <ChartContainer 
              config={chartConfig}
              className="h-[300px] w-full"
            >
              <BarChart 
                data={stats.quejasPorEstado}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <XAxis 
                  dataKey="estado" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis 
                  allowDecimals={false} 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={8} 
                  domain={[0, 'auto']} // Fuerza a que la base sea 0
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill="var(--color-count)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
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
