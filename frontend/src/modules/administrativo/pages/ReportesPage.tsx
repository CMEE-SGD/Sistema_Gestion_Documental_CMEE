// Módulo de reportes (Sección 8.7 de REQUERIMIENTOS_CMEE.txt): reportes por
// laboratorio, certificados emitidos/pendientes/observados, tiempos de
// atención, reportes de calidad y reportes administrativos. Todo en tablas
// en pantalla, sin exportación (fuera de alcance por ahora).

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  ClipboardList,
  Clock,
  FileCheck2,
  FileWarning,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import api from '../../../core/api/axios';

// ---------------------------------------------------------------------------
// Types — reflejan reportes.service.ts
// ---------------------------------------------------------------------------

interface PorLaboratorioRow {
  laboratorio_id: number;
  laboratorio: string;
  total_equipos: number;
  en_proceso: number;
  finalizados: number;
}

interface CertificadoEmitidoRow {
  equipo_id: number;
  equipo: string;
  laboratorio: string;
  cliente: string;
  orden_trabajo_fisica: string;
  numero_certificado: string;
  fecha_emision: string;
  tecnico: string;
}

interface CertificadoPendienteRow {
  equipo_id: number;
  equipo: string;
  laboratorio: string;
  cliente: string;
  orden_trabajo_fisica: string;
  estado: string;
  tecnico: string | null;
  fecha_ingreso_laboratorio: string | null;
}

interface CertificadoObservadoRow {
  equipo_id: number;
  equipo: string;
  laboratorio: string;
  cliente: string;
  orden_trabajo_fisica: string;
  estado_actual: string;
  ultima_observacion: string | null;
  observado_por: string | null;
  fecha_observacion: string | null;
}

interface TiempoAtencionRow {
  laboratorio_id: number;
  laboratorio: string;
  equipos_finalizados: number;
  promedio_dias: number;
  minimo_dias: number;
  maximo_dias: number;
}

interface CalidadResumenRow {
  laboratorio_id: number;
  laboratorio: string;
  total_observaciones: number;
}

interface CalidadDetalleRow {
  equipo_id: number;
  equipo: string;
  laboratorio: string;
  tecnico: string | null;
  etapa_rechazada: string;
  observacion: string | null;
  observado_por: string;
  fecha: string;
}

interface CalidadReporte {
  resumen_por_laboratorio: CalidadResumenRow[];
  detalle: CalidadDetalleRow[];
}

interface AdministrativoReporte {
  total_clientes: number;
  total_ordenes: number;
  total_equipos: number;
  equipos_por_estado: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

const ESTADO_LABEL: Record<string, string> = {
  EN_ESPERA: 'En espera',
  EN_CALIBRACION: 'En calibración',
  REVISION_OBT: 'Revisión OBT',
  PENDIENTE_FIRMA_TECNICO: 'Pendiente firma técnico',
  REVISION_JEFE: 'Revisión jefe',
  REVISION_CALIDAD: 'Revisión calidad',
  REVISION_DIRECTOR: 'Revisión director',
  LISTO_PARA_ENTREGA: 'Listo para entrega',
  FINALIZADO: 'Finalizado',
};

function useReporte<T>(endpoint: string, params: Record<string, string | undefined>) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => !!v),
  );
  return useQuery<T>({
    queryKey: ['reportes', endpoint, cleanParams],
    queryFn: async () => {
      const res = await api.get<T>(`/reportes/${endpoint}`, {
        params: cleanParams,
      });
      return res.data;
    },
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Tabla genérica
// ---------------------------------------------------------------------------

interface Column<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

function ReportTable<T>({
  columns,
  rows,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  emptyMessage: string;
  rowKey: (row: T) => string | number;
}) {
  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {errorMessage || 'No se pudo cargar el reporte. Intente nuevamente.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={cn(
                    'px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground',
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left',
                    col.className,
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_col, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted-foreground/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows && rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.label}
                      className={cn(
                        'px-6 py-4 text-sm text-foreground',
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-right'
                            : 'text-left',
                        col.className,
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filtros compartidos
// ---------------------------------------------------------------------------

function FiltroLaboratorio({
  value,
  onChange,
  laboratorios,
}: {
  value: string;
  onChange: (v: string) => void;
  laboratorios: { id: number; nombre: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="">Todos los laboratorios</option>
      {laboratorios.map((l) => (
        <option key={l.id} value={l.id}>
          {l.nombre}
        </option>
      ))}
    </select>
  );
}

function FiltroFechas({
  desde,
  hasta,
  onDesde,
  onHasta,
}: {
  desde: string;
  hasta: string;
  onDesde: (v: string) => void;
  onHasta: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={desde}
        onChange={(e) => onDesde(e.target.value)}
        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="text-sm text-muted-foreground">a</span>
      <input
        type="date"
        value={hasta}
        onChange={(e) => onHasta(e.target.value)}
        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

type TabKey =
  | 'laboratorio'
  | 'emitidos'
  | 'pendientes'
  | 'observados'
  | 'tiempos'
  | 'calidad'
  | 'administrativo';

const TABS: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
  { key: 'laboratorio', label: 'Por laboratorio', icon: Building2 },
  { key: 'emitidos', label: 'Certificados emitidos', icon: FileCheck2 },
  { key: 'pendientes', label: 'Certificados pendientes', icon: Clock },
  { key: 'observados', label: 'Certificados observados', icon: FileWarning },
  { key: 'tiempos', label: 'Tiempos de atención', icon: Clock },
  { key: 'calidad', label: 'Reportes de calidad', icon: ShieldAlert },
  { key: 'administrativo', label: 'Reportes administrativos', icon: ClipboardList },
];

export default function ReportesPage() {
  const [tab, setTab] = useState<TabKey>('laboratorio');
  const [laboratorioId, setLaboratorioId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const porLaboratorio = useReporte<PorLaboratorioRow[]>('por-laboratorio', {});

  const laboratorios = useMemo(
    () =>
      (porLaboratorio.data ?? []).map((r) => ({
        id: r.laboratorio_id,
        nombre: r.laboratorio,
      })),
    [porLaboratorio.data],
  );

  const emitidos = useReporte<CertificadoEmitidoRow[]>('certificados-emitidos', {
    laboratorio_id: laboratorioId,
    desde,
    hasta,
  });
  const pendientes = useReporte<CertificadoPendienteRow[]>(
    'certificados-pendientes',
    { laboratorio_id: laboratorioId },
  );
  const observados = useReporte<CertificadoObservadoRow[]>(
    'certificados-observados',
    { laboratorio_id: laboratorioId },
  );
  const tiempos = useReporte<TiempoAtencionRow[]>('tiempos-atencion', {
    laboratorio_id: laboratorioId,
  });
  const calidad = useReporte<CalidadReporte>('calidad', {
    laboratorio_id: laboratorioId,
  });
  const administrativo = useReporte<AdministrativoReporte>('administrativo', {
    desde,
    hasta,
  });

  const mostrarFiltroLaboratorio = tab !== 'administrativo';
  const mostrarFiltroFechas = tab === 'emitidos' || tab === 'administrativo';

  return (
    <div className="space-y-6 p-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Reportes
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Indicadores operativos y de calidad del proceso de calibración
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Tabs */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const activo = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activo
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filtros */}
      {/* ------------------------------------------------------------------ */}
      {(mostrarFiltroLaboratorio || mostrarFiltroFechas) && (
        <div className="flex flex-wrap items-center gap-2">
          {mostrarFiltroLaboratorio && (
            <FiltroLaboratorio
              value={laboratorioId}
              onChange={setLaboratorioId}
              laboratorios={laboratorios}
            />
          )}
          {mostrarFiltroFechas && (
            <FiltroFechas
              desde={desde}
              hasta={hasta}
              onDesde={setDesde}
              onHasta={setHasta}
            />
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Contenido por pestaña */}
      {/* ------------------------------------------------------------------ */}
      {tab === 'laboratorio' && (
        <ReportTable<PorLaboratorioRow>
          rowKey={(r) => r.laboratorio_id}
          isLoading={porLaboratorio.isLoading}
          isError={porLaboratorio.isError}
          emptyMessage="No hay laboratorios registrados."
          columns={[
            { label: 'Laboratorio', render: (r) => r.laboratorio },
            {
              label: 'Total equipos',
              align: 'center',
              render: (r) => r.total_equipos,
            },
            { label: 'En proceso', align: 'center', render: (r) => r.en_proceso },
            { label: 'Finalizados', align: 'center', render: (r) => r.finalizados },
          ]}
          rows={porLaboratorio.data}
        />
      )}

      {tab === 'emitidos' && (
        <ReportTable<CertificadoEmitidoRow>
          rowKey={(r) => r.equipo_id}
          isLoading={emitidos.isLoading}
          isError={emitidos.isError}
          emptyMessage="No hay certificados emitidos con los filtros aplicados."
          columns={[
            { label: 'Número', render: (r) => r.numero_certificado },
            { label: 'Fecha', render: (r) => formatDate(r.fecha_emision) },
            { label: 'Laboratorio', render: (r) => r.laboratorio },
            { label: 'Cliente', render: (r) => r.cliente },
            {
              label: 'Orden física',
              render: (r) => (
                <span className="text-red-600">#{r.orden_trabajo_fisica}</span>
              ),
            },
            { label: 'Técnico', render: (r) => r.tecnico },
          ]}
          rows={emitidos.data}
        />
      )}

      {tab === 'pendientes' && (
        <ReportTable<CertificadoPendienteRow>
          rowKey={(r) => r.equipo_id}
          isLoading={pendientes.isLoading}
          isError={pendientes.isError}
          emptyMessage="No hay equipos pendientes con los filtros aplicados."
          columns={[
            { label: 'Equipo', render: (r) => r.equipo },
            { label: 'Laboratorio', render: (r) => r.laboratorio },
            { label: 'Cliente', render: (r) => r.cliente },
            {
              label: 'Orden física',
              render: (r) => (
                <span className="text-red-600">#{r.orden_trabajo_fisica}</span>
              ),
            },
            {
              label: 'Estado',
              align: 'center',
              render: (r) => ESTADO_LABEL[r.estado] ?? r.estado,
            },
            { label: 'Técnico', render: (r) => r.tecnico ?? '—' },
            {
              label: 'Ingreso a lab.',
              render: (r) => formatDate(r.fecha_ingreso_laboratorio),
            },
          ]}
          rows={pendientes.data}
        />
      )}

      {tab === 'observados' && (
        <ReportTable<CertificadoObservadoRow>
          rowKey={(r) => r.equipo_id}
          isLoading={observados.isLoading}
          isError={observados.isError}
          emptyMessage="No hay equipos observados con los filtros aplicados."
          columns={[
            { label: 'Equipo', render: (r) => r.equipo },
            { label: 'Laboratorio', render: (r) => r.laboratorio },
            { label: 'Cliente', render: (r) => r.cliente },
            {
              label: 'Orden física',
              render: (r) => (
                <span className="text-red-600">#{r.orden_trabajo_fisica}</span>
              ),
            },
            {
              label: 'Estado actual',
              align: 'center',
              render: (r) => ESTADO_LABEL[r.estado_actual] ?? r.estado_actual,
            },
            {
              label: 'Última observación',
              render: (r) => r.ultima_observacion ?? '—',
            },
            { label: 'Observado por', render: (r) => r.observado_por ?? '—' },
            { label: 'Fecha', render: (r) => formatDate(r.fecha_observacion) },
          ]}
          rows={observados.data}
        />
      )}

      {tab === 'tiempos' && (
        <ReportTable<TiempoAtencionRow>
          rowKey={(r) => r.laboratorio_id}
          isLoading={tiempos.isLoading}
          isError={tiempos.isError}
          emptyMessage="Aún no hay equipos finalizados para calcular tiempos de atención."
          columns={[
            { label: 'Laboratorio', render: (r) => r.laboratorio },
            {
              label: 'Equipos finalizados',
              align: 'center',
              render: (r) => r.equipos_finalizados,
            },
            {
              label: 'Promedio (días)',
              align: 'center',
              render: (r) => r.promedio_dias,
            },
            { label: 'Mínimo (días)', align: 'center', render: (r) => r.minimo_dias },
            { label: 'Máximo (días)', align: 'center', render: (r) => r.maximo_dias },
          ]}
          rows={tiempos.data}
        />
      )}

      {tab === 'calidad' && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              Observaciones por laboratorio
            </h2>
            <ReportTable<CalidadResumenRow>
              rowKey={(r) => r.laboratorio_id}
              isLoading={calidad.isLoading}
              isError={calidad.isError}
              emptyMessage="No hay observaciones registradas."
              columns={[
                { label: 'Laboratorio', render: (r) => r.laboratorio },
                {
                  label: 'Total observaciones',
                  align: 'center',
                  render: (r) => r.total_observaciones,
                },
              ]}
              rows={calidad.data?.resumen_por_laboratorio}
            />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              Detalle de observaciones
            </h2>
            <ReportTable<CalidadDetalleRow>
              rowKey={(r) => `${r.equipo_id}-${r.fecha}`}
              isLoading={calidad.isLoading}
              isError={calidad.isError}
              emptyMessage="No hay observaciones registradas."
              columns={[
                { label: 'Equipo', render: (r) => r.equipo },
                { label: 'Laboratorio', render: (r) => r.laboratorio },
                { label: 'Técnico', render: (r) => r.tecnico ?? '—' },
                {
                  label: 'Etapa rechazada',
                  render: (r) => ESTADO_LABEL[r.etapa_rechazada] ?? r.etapa_rechazada,
                },
                { label: 'Observación', render: (r) => r.observacion ?? '—' },
                { label: 'Observado por', render: (r) => r.observado_por },
                { label: 'Fecha', render: (r) => formatDate(r.fecha) },
              ]}
              rows={calidad.data?.detalle}
            />
          </div>
        </div>
      )}

      {tab === 'administrativo' && (
        <div className="space-y-6">
          {administrativo.isError ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              No se pudo cargar el reporte administrativo.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: 'Clientes registrados', value: administrativo.data?.total_clientes },
                  { label: 'Órdenes de trabajo', value: administrativo.data?.total_ordenes },
                  { label: 'Equipos recibidos', value: administrativo.data?.total_equipos },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm"
                  >
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {administrativo.isLoading ? '—' : (stat.value ?? 0)}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  Equipos por estado
                </h2>
                <ReportTable<[string, number]>
                  rowKey={(r) => r[0]}
                  isLoading={administrativo.isLoading}
                  isError={false}
                  emptyMessage="No hay equipos registrados en el período."
                  columns={[
                    { label: 'Estado', render: (r) => ESTADO_LABEL[r[0]] ?? r[0] },
                    { label: 'Cantidad', align: 'center', render: (r) => r[1] },
                  ]}
                  rows={Object.entries(administrativo.data?.equipos_por_estado ?? {})}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
