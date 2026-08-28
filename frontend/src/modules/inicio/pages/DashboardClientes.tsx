import React, { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../../../core/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import {
  Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis,
} from 'recharts';
import {
  Users, UserPlus, AlertTriangle, Building2, ShieldCheck, Clock, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

type Periodo = 'ultimos30' | 'esteMes' | 'mesAnterior' | 'esteAnio' | 'personalizado';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const now = new Date();
const ANIOS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

// Paleta categórica validada (contraste vs. superficie + separación bajo
// daltonismo — ver skill dataviz). El resto del cromo (grillas, ejes, texto)
// usa los tokens de color propios de la app (--border, --muted-foreground),
// no esta paleta — el color aquí se reserva para los datos.
const chartConfig: ChartConfig = {
  clientesAtendidos: { label: 'Clientes Atendidos', theme: { light: '#2a78d6', dark: '#3987e5' } },
  nuevosClientes: { label: 'Nuevos Clientes', theme: { light: '#1baf7a', dark: '#199e70' } },
  quejas: { label: 'Quejas Registradas', theme: { light: '#eb6834', dark: '#d95926' } },
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

// delta = actual - previo, comparado contra el mismo número de días
// inmediatamente anterior al período elegido. `upIsGood` decide si subir es
// una buena o mala noticia (más clientes: bueno: más quejas: malo) — eso
// define el color, no solo el signo del número.
function DeltaBadge({ actual, previo, upIsGood }: { actual: number; previo: number; upIsGood: boolean }) {
  if (previo === 0 && actual === 0) {
    return <span className="text-xs text-muted-foreground">Sin variación</span>;
  }
  const delta = actual - previo;
  const pct = previo > 0 ? Math.abs((delta / previo) * 100) : null;
  const esBueno = delta === 0 ? null : (delta > 0) === upIsGood;
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const colorCls = esBueno === null
    ? 'text-muted-foreground'
    : esBueno
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorCls}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {delta > 0 ? '+' : ''}{delta}{pct !== null ? ` (${pct.toFixed(0)}%)` : ''} vs. período anterior
    </span>
  );
}

interface StatTileProps {
  titulo: string;
  icon: React.ReactNode;
  /** Color vía var(--color-X) — para métricas que también aparecen en una gráfica. */
  color?: string;
  /** Alternativa vía clases Tailwind (con dark:) — para íconos sin gráfica asociada. */
  iconClassName?: string;
  valor: React.ReactNode;
  subtitulo: string;
  delta?: React.ReactNode;
}

function StatTile({ titulo, icon, color, iconClassName, valor, subtitulo, delta }: StatTileProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <span style={color ? { color } : undefined} className={iconClassName}>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{valor}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>
        {delta && <div className="mt-2">{delta}</div>}
      </CardContent>
    </Card>
  );
}

export default function DashboardClientes() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const inputCls = 'px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  // Une las dos series (mismas claves de fecha, vienen del mismo mapa de
  // baldes en el backend) en un solo dataset para poder compararlas en una
  // gráfica de 2 líneas — así se ve si el volumen sube por clientes nuevos
  // o por clientes recurrentes, que es la pregunta real detrás del número.
  const serieComparativa = useMemo(() => {
    const atendidos: { fecha: string; count: number }[] = stats?.clientesAtendidosSerie ?? [];
    const nuevos: { fecha: string; count: number }[] = stats?.nuevosClientesSerie ?? [];
    return atendidos.map((p, i) => ({
      fecha: p.fecha,
      atendidos: p.count,
      nuevos: nuevos[i]?.count ?? 0,
    }));
  }, [stats]);

  const clientesPorTipo = useMemo(() => {
    const lista: { tipo: string; count: number }[] = stats?.clientesPorTipo ?? [];
    const militar = lista.find((t) => t.tipo === 'MILITAR')?.count ?? 0;
    const civil = lista.find((t) => t.tipo === 'CIVIL')?.count ?? 0;
    const total = militar + civil;
    return {
      militar, civil, total,
      militarPct: total ? (militar / total) * 100 : 0,
      civilPct: total ? (civil / total) * 100 : 0,
    };
  }, [stats]);

  const procedencia = useMemo(() => {
    const p = stats?.quejasProcedencia ?? { procedentes: 0, noProcedentes: 0, sinAnalizar: 0 };
    const analizadas = p.procedentes + p.noProcedentes;
    return {
      ...p,
      analizadas,
      tasa: analizadas > 0 ? (p.procedentes / analizadas) * 100 : null,
    };
  }, [stats]);

  if (loading && !stats) return <div className="p-8 text-center animate-pulse">Cargando métricas...</div>;
  if (!stats) return <div className="p-8 text-center text-destructive">Error al cargar datos.</div>;

  const comparativo = stats.comparativo ?? {};
  const quejasTickInterval = Math.max(0, Math.ceil((stats.quejasPorEstado?.length ?? 0) / 8) - 1);
  const comparativaTickInterval = Math.max(0, Math.ceil(serieComparativa.length / 8) - 1);
  const hayDatosComparativa = serieComparativa.some((p) => p.atendidos > 0 || p.nuevos > 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header + Filtros */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard de Clientes</h1>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 bg-card border border-border rounded-lg shadow-sm">
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

          <button
            onClick={fetchData}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Todo lo de abajo comparte el mismo filtro de arriba — mientras
          recarga, se atenúa en vez de parpadear o saltar de layout. */}
      <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {/* KPIs con comparación contra el período anterior — el número solo
            no dice si vamos mejor o peor, la variación sí. */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
          <StatTile
            titulo="Clientes Atendidos"
            icon={<Users className="w-5 h-5" />}
            color="var(--color-clientesAtendidos)"
            valor={stats.clientesAtendidosTotal}
            subtitulo="Clientes únicos en el período"
            delta={
              <DeltaBadge
                actual={stats.clientesAtendidosTotal}
                previo={comparativo.clientesAtendidosPrevTotal ?? 0}
                upIsGood
              />
            }
          />
          <StatTile
            titulo="Nuevos Clientes"
            icon={<UserPlus className="w-5 h-5" />}
            color="var(--color-nuevosClientes)"
            valor={stats.nuevosClientesTotal}
            subtitulo="Registrados en el período"
            delta={
              <DeltaBadge
                actual={stats.nuevosClientesTotal}
                previo={comparativo.nuevosClientesPrevTotal ?? 0}
                upIsGood
              />
            }
          />
          <StatTile
            titulo="Clientes en Trámite"
            icon={<Clock className="w-5 h-5" />}
            iconClassName="text-[#4a3aa7] dark:text-[#9085e9]"
            valor={stats.clientesEnTramiteTotal}
            subtitulo="Ahora mismo — equipos aún no finalizados"
          />
          <StatTile
            titulo="Quejas Registradas"
            icon={<AlertTriangle className="w-5 h-5" />}
            color="var(--color-quejas)"
            valor={stats.numeroQuejasTotal}
            subtitulo="Quejas en el período"
            delta={
              <DeltaBadge
                actual={stats.numeroQuejasTotal}
                previo={comparativo.numeroQuejasPrevTotal ?? 0}
                upIsGood={false}
              />
            }
          />
          <StatTile
            titulo="Tasa de Procedencia"
            icon={<ShieldCheck className="w-5 h-5" />}
            color="var(--color-quejas)"
            valor={procedencia.tasa !== null ? `${procedencia.tasa.toFixed(0)}%` : '—'}
            subtitulo={
              procedencia.analizadas > 0
                ? `${procedencia.procedentes} de ${procedencia.analizadas} quejas analizadas`
                : procedencia.sinAnalizar > 0
                  ? `${procedencia.sinAnalizar} quejas aún sin analizar`
                  : 'Sin quejas en el período'
            }
          />
        </div>

        {/* La gráfica principal: compara clientes atendidos vs. cuántos de
            esos fueron nuevos — responde "¿crecemos por clientes nuevos o
            por clientes que vuelven?", que es la pregunta que de verdad
            ayuda a decidir dónde poner esfuerzo comercial. */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Clientes Atendidos vs. Nuevos Clientes</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              De los clientes atendidos en el período, cuántos eran nuevos y cuántos recurrentes
            </p>
          </CardHeader>
          <CardContent>
            {hayDatosComparativa ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <LineChart data={serieComparativa} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    interval={comparativaTickInterval}
                    tickMargin={8}
                    padding={{ left: 16, right: 16 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    width={28}
                    domain={[0, 'dataMax + 1']}
                  />
                  <ChartTooltip
                    cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    type="monotone"
                    dataKey="atendidos"
                    name="Atendidos"
                    stroke="var(--color-clientesAtendidos)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-card)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nuevos"
                    name="Nuevos"
                    stroke="var(--color-nuevosClientes)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-card)' }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                Sin datos en este período
              </div>
            )}
            <div className="flex items-center gap-6 justify-center mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full bg-[#2a78d6] dark:bg-[#3987e5]" />
                Clientes Atendidos
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full bg-[#1baf7a] dark:bg-[#199e70]" />
                Nuevos Clientes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribución — Quejas por Estado (magnitud por categoría) y
            Clientes por Tipo (parte-del-todo, barra segmentada en vez de
            un donut: con solo 2 categorías se lee mejor así). */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quejas por Estado</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Dónde está el cuello de botella del proceso</p>
            </CardHeader>
            <CardContent>
              {stats.quejasPorEstado && stats.quejasPorEstado.some((e: { count: number }) => e.count > 0) ? (
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <BarChart data={stats.quejasPorEstado} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis
                      dataKey="estado"
                      tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      interval={quejasTickInterval}
                      tickMargin={8}
                      padding={{ left: 12, right: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                      width={24}
                      domain={[0, 'auto']}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'var(--color-accent)' }}
                      content={<ChartTooltipContent nameKey="estado" />}
                    />
                    <Bar dataKey="count" fill="var(--color-quejas)" radius={[4, 4, 0, 0]} barSize={24}>
                      <LabelList
                        dataKey="count"
                        position="top"
                        style={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                  Sin quejas en este período
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Clientes Atendidos por Tipo
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Militar vs. civil, en el período seleccionado</p>
            </CardHeader>
            <CardContent>
              {clientesPorTipo.total > 0 ? (
                <div className="h-[240px] flex flex-col justify-center gap-6">
                  <div className="flex h-9 w-full overflow-hidden rounded-md gap-0.5">
                    <div
                      className="flex items-center justify-center bg-[#2a78d6] dark:bg-[#3987e5] transition-all"
                      style={{ width: `${clientesPorTipo.militarPct}%` }}
                    >
                      {clientesPorTipo.militarPct > 12 && (
                        <span className="text-xs font-semibold text-white">
                          {clientesPorTipo.militarPct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div
                      className="flex items-center justify-center bg-[#eda100] dark:bg-[#c98500] transition-all"
                      style={{ width: `${clientesPorTipo.civilPct}%` }}
                    >
                      {clientesPorTipo.civilPct > 12 && (
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {clientesPorTipo.civilPct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-8 justify-center">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#2a78d6] dark:bg-[#3987e5] shrink-0" />
                      <span className="text-muted-foreground">Militar</span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {clientesPorTipo.militar}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#eda100] dark:bg-[#c98500] shrink-0" />
                      <span className="text-muted-foreground">Civil</span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {clientesPorTipo.civil}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                  Sin clientes atendidos en este período
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
