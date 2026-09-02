import React, { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../../../core/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import {
  Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis,
} from 'recharts';
import {
  Package, BadgeCheck, Clock, Percent, TrendingUp, TrendingDown, Minus, FlaskConical, UserCog, ClipboardList,
} from 'lucide-react';

type Periodo = 'ultimos30' | 'esteMes' | 'mesAnterior' | 'esteAnio' | 'personalizado';

const now = new Date();

// Rango por defecto del "Personalizado": últimos 90 días hasta hoy.
function fechaInput(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

const defaultInicio = new Date();
defaultInicio.setDate(now.getDate() - 89);

const chartConfig: ChartConfig = {
  recibidos: { label: 'Recibidos', theme: { light: '#2a78d6', dark: '#3987e5' } },
  calibrados: { label: 'Calibrados', theme: { light: '#1baf7a', dark: '#199e70' } },
  personal: { label: 'Equipos en trámite', theme: { light: '#e0762b', dark: '#cf6a24' } },
  servicio: { label: 'Calibrados', theme: { light: '#7c3aed', dark: '#8b5cf6' } },
};

const ESTADO_LABELS: Record<string, string> = {
  EN_ESPERA: 'En espera',
  EN_CALIBRACION: 'En calibración',
  REVISION_OBT: 'Revisión OBT',
  PENDIENTE_FIRMA_TECNICO: 'Pendiente firma técnico',
  REVISION_JEFE: 'Revisión jefe',
  REVISION_DIRECTOR: 'Revisión director',
  LISTO_PARA_ENTREGA: 'Listo para entrega',
  FINALIZADO: 'Finalizado',
};

function buildParams(periodo: Periodo, fechaInicio: string, fechaFin: string, laboratorioId: string): string {
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
      p.set('fechaInicio', fechaInicio);
      p.set('fechaFin', fechaFin);
      break;
    default:
      p.set('periodo', 'ultimos30');
  }
  if (laboratorioId) p.set('laboratorioId', laboratorioId);
  return p.toString();
}

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
  color?: string;
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

export default function DashboardLaboratorios() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [laboratorios, setLaboratorios] = useState<any[]>([]);

  const [periodo, setPeriodo] = useState<Periodo>('ultimos30');
  const [fechaInicio, setFechaInicio] = useState(fechaInput(defaultInicio));
  const [fechaFin, setFechaFin] = useState(fechaInput(now));
  const [laboratorioId, setLaboratorioId] = useState<string>('');

  useEffect(() => {
    api.get('/laboratorios')
      .then(res => setLaboratorios(res.data ?? []))
      .catch(() => setLaboratorios([]));
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const qs = buildParams(periodo, fechaInicio, fechaFin, laboratorioId);
    api.get(`/dashboard/laboratorios/stats?${qs}`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [periodo, fechaInicio, fechaFin, laboratorioId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const inputCls = 'px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

  const serieComparativa = useMemo(() => {
    const recibidos: { fecha: string; count: number }[] = stats?.equiposRecibidosSerie ?? [];
    const calibrados: { fecha: string; count: number }[] = stats?.equiposCalibradosSerie ?? [];
    return recibidos.map((p, i) => ({
      fecha: p.fecha,
      recibidos: p.count,
      calibrados: calibrados[i]?.count ?? 0,
    }));
  }, [stats]);

  const tasaFinalizacion = useMemo(() => {
    const total = stats?.equiposRecibidosTotal ?? 0;
    const calibrados = stats?.equiposCalibradosTotal ?? 0;
    return {
      total,
      calibrados,
      tasa: total > 0 ? (calibrados / total) * 100 : null,
    };
  }, [stats]);

  if (loading && !stats) return <div className="p-8 text-center animate-pulse">Cargando métricas...</div>;
  if (!stats) return <div className="p-8 text-center text-destructive">Error al cargar datos.</div>;

  const comparativo = stats.comparativo ?? {};
  const serieTickInterval = Math.max(0, Math.ceil(serieComparativa.length / 8) - 1);
  const pipelineTickInterval = Math.max(0, Math.ceil((stats.pipelinePorEstado?.length ?? 0) / 8) - 1);
  const hayDatosSerie = serieComparativa.some((p) => p.recibidos > 0 || p.calibrados > 0);

  const porLaboratorio: {
    laboratorio_id: number;
    nombre: string;
    recibidos: number;
    calibrados: number;
    enTramite: number;
  }[] = stats.porLaboratorio ?? [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Dashboard de Laboratorios</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 bg-card border border-border rounded-lg shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Laboratorio</label>
            <select
              className={inputCls}
              value={laboratorioId}
              onChange={(e) => setLaboratorioId(e.target.value)}
            >
              <option value="">Todos los laboratorios</option>
              {laboratorios.map((l) => (
                <option key={l.id} value={String(l.id)}>{l.nombre}</option>
              ))}
            </select>
          </div>

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
                <label className="text-xs font-medium text-muted-foreground">Fecha de inicio</label>
                <input
                  type="date"
                  className={inputCls}
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Fecha de fin</label>
                <input
                  type="date"
                  className={inputCls}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatTile
            titulo="Equipos Recibidos"
            icon={<Package className="w-5 h-5" />}
            color="var(--color-recibidos)"
            valor={stats.equiposRecibidosTotal}
            subtitulo="Ingresados al laboratorio en el período"
            delta={
              <DeltaBadge
                actual={stats.equiposRecibidosTotal}
                previo={comparativo.equiposRecibidosPrevTotal ?? 0}
                upIsGood
              />
            }
          />
          <StatTile
            titulo="Equipos Calibrados"
            icon={<BadgeCheck className="w-5 h-5" />}
            color="var(--color-calibrados)"
            valor={stats.equiposCalibradosTotal}
            subtitulo="Finalizados en el período"
            delta={
              <DeltaBadge
                actual={stats.equiposCalibradosTotal}
                previo={comparativo.equiposCalibradosPrevTotal ?? 0}
                upIsGood
              />
            }
          />
          <StatTile
            titulo="Equipos en Trámite"
            icon={<Clock className="w-5 h-5" />}
            iconClassName="text-[#4a3aa7] dark:text-[#9085e9]"
            valor={stats.equiposEnTramiteTotal}
            subtitulo="Ahora mismo — aún no finalizados"
          />
          <StatTile
            titulo="Tasa de Finalización"
            icon={<Percent className="w-5 h-5" />}
            color="var(--color-calibrados)"
            valor={tasaFinalizacion.tasa !== null ? `${tasaFinalizacion.tasa.toFixed(0)}%` : '—'}
            subtitulo={
              tasaFinalizacion.total > 0
                ? `${tasaFinalizacion.calibrados} de ${tasaFinalizacion.total} recibidos finalizados`
                : 'Sin equipos recibidos en el período'
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recibidos vs. Calibrados</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cuántos equipos entran al laboratorio y cuántos se terminan de calibrar, por período
            </p>
          </CardHeader>
          <CardContent>
            {hayDatosSerie ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <LineChart data={serieComparativa} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    interval={serieTickInterval}
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
                    dataKey="recibidos"
                    name="Recibidos"
                    stroke="var(--color-recibidos)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-card)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calibrados"
                    name="Calibrados"
                    stroke="var(--color-calibrados)"
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
                Recibidos
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full bg-[#1baf7a] dark:bg-[#199e70]" />
                Calibrados
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                Equipos por Laboratorio
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calibrados en el período vs. en trámite ahora mismo
              </p>
            </CardHeader>
            <CardContent>
              {porLaboratorio.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left font-medium py-2 pr-3">Laboratorio</th>
                        <th className="text-right font-medium py-2 px-3">Calibrados</th>
                        <th className="text-right font-medium py-2 px-3">En trámite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porLaboratorio.map((l) => (
                        <tr key={l.laboratorio_id} className="border-b last:border-0">
                          <td className="py-2.5 pr-3 font-medium">{l.nombre}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                            {l.calibrados}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            {l.enTramite}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                  Sin laboratorios con actividad en el período
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Flujo por Estado</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Dónde está el cuello de botella del proceso</p>
            </CardHeader>
            <CardContent>
              {stats.pipelinePorEstado && stats.pipelinePorEstado.some((e: { count: number }) => e.count > 0) ? (
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <BarChart
                    data={stats.pipelinePorEstado.map((e: { estado: string; count: number }) => ({
                      ...e,
                      estado: ESTADO_LABELS[e.estado] ?? e.estado,
                    }))}
                    margin={{ top: 20, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis
                      dataKey="estado"
                      tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      interval={pipelineTickInterval}
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
                    <Bar dataKey="count" fill="var(--color-recibidos)" radius={[4, 4, 0, 0]} barSize={24}>
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
                  Sin equipos en este período
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Personal Calibrando
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Equipos en trámite por técnico asignado, ahora mismo
              </p>
            </CardHeader>
            <CardContent>
              {stats.personalCalibrando && stats.personalCalibrando.length > 0 && stats.personalCalibrando.some((p: { equipos: number }) => p.equipos > 0) ? (
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <BarChart
                    data={stats.personalCalibrando}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={130}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'var(--color-accent)' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="equipos" name="Equipos" fill="var(--color-personal)" radius={[0, 4, 4, 0]} barSize={16}>
                      <LabelList
                        dataKey="equipos"
                        position="right"
                        style={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                  Ningún equipo en trámite asignado a un técnico
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Calibraciones por Servicio
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Equipos finalizados en el período, agrupados por procedimiento utilizado
            </p>
          </CardHeader>
          <CardContent>
            {stats.calibradosPorServicio && stats.calibradosPorServicio.length > 0 && stats.calibradosPorServicio.some((s: { calibrados: number }) => s.calibrados > 0) ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={stats.calibradosPorServicio}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={150}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--color-accent)' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="calibrados" name="Calibrados" fill="var(--color-servicio)" radius={[0, 4, 4, 0]} barSize={18}>
                    <LabelList
                      dataKey="calibrados"
                      position="right"
                      style={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">
                Sin equipos finalizados con procedimiento en este período
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
