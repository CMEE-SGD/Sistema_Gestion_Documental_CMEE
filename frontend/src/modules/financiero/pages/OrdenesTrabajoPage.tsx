import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Inbox,
  PenLine,
  Receipt,
  Search,
  UploadCloud,
  X,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { Modal } from '../../../shared/components/molecules/Modal';
import {
  type OrdenTrabajoDetalle,
  ESTADO_COLOR,
  ESTADO_LABEL,
} from '../../administrativo/components/VistaDetalleOrden';
import type { FacturaResumen } from './FacturasPage';

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

const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

function normalize(str: string) {
  return Array.from(str.toLowerCase().normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < COMBINING_DIACRITICS_START || code > COMBINING_DIACRITICS_END;
    })
    .join('');
}

const FLUJO_ESTADOS = [
  'EN_ESPERA',
  'EN_CALIBRACION',
  'REVISION_OBT',
  'PENDIENTE_FIRMA_TECNICO',
  'REVISION_JEFE',
  'REVISION_DIRECTOR',
  'LISTO_PARA_ENTREGA',
  'FINALIZADO',
];

function estadoRepresentativo(orden: OrdenTrabajoDetalle): string | null {
  const estados = (orden.equipos ?? []).map((e) => e.estado);
  if (estados.length === 0) return null;
  let menor = FLUJO_ESTADOS.length;
  let resultado: string | null = null;
  for (const est of estados) {
    const idx = FLUJO_ESTADOS.indexOf(est);
    if (idx !== -1 && idx < menor) {
      menor = idx;
      resultado = est;
    }
  }
  return resultado ?? estados[0] ?? null;
}

/**
 * Una orden habilita su factura cuando TODOS sus equipos llegaron a
 * FINALIZADO. Mismo criterio que recepción de equipos; el backend lo vuelve
 * a validar al crear/importar la factura.
 */
function esOrdenFacturable(orden: OrdenTrabajoDetalle): boolean {
  const equipos = orden.equipos ?? [];
  return equipos.length > 0 && equipos.every((e) => e.estado === 'FINALIZADO');
}

// ---------------------------------------------------------------------------
// Filtros (mismo criterio de períodos que el Resumen financiero)
// ---------------------------------------------------------------------------

type FiltroFacturacion = 'todos' | 'listos' | 'facturados';
type PeriodoOrdenes =
  | 'todos'
  | 'ultimos30'
  | 'esteMes'
  | 'mesAnterior'
  | 'esteAnio'
  | 'personalizado';

function fechaInput(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

/**
 * Devuelve el rango [desde, hasta] (fechas 'YYYY-MM-DD') del período elegido.
 * Igual criterio que el select de "Período" de los dashboards del Resumen.
 */
function rangoParaPeriodo(
  periodo: PeriodoOrdenes,
  fechaInicio: string,
  fechaFin: string,
): { desde?: string; hasta?: string } {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  switch (periodo) {
    case 'ultimos30': {
      const desde = new Date();
      desde.setDate(hoy.getDate() - 29);
      return { desde: fechaInput(desde), hasta: fechaInput(hoy) };
    }
    case 'esteMes':
      return {
        desde: `${anio}-${String(mes + 1).padStart(2, '0')}-01`,
        hasta: fechaInput(hoy),
      };
    case 'mesAnterior': {
      const primerDia = new Date(anio, mes - 1, 1);
      const ultimoDia = new Date(anio, mes, 0);
      return { desde: fechaInput(primerDia), hasta: fechaInput(ultimoDia) };
    }
    case 'esteAnio':
      return { desde: `${anio}-01-01`, hasta: fechaInput(hoy) };
    case 'personalizado':
      return { desde: fechaInicio || undefined, hasta: fechaFin || undefined };
    default:
      return {};
  }
}

/**
 * Vista de solo lectura de órdenes de trabajo dentro del módulo financiero.
 * La única acción disponible es "Facturar": la orden se origina y administra
 * en Recepción de Equipos; aquí solo se consulta para facturarla.
 */
export default function OrdenesTrabajoPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [ordenAFacturar, setOrdenAFacturar] =
    useState<OrdenTrabajoDetalle | null>(null);

  // Filtros de la lista: estado de facturación + rango de fechas (como el
  // Resumen). Por defecto no ocultan nada.
  const [filtroFacturacion, setFiltroFacturacion] =
    useState<FiltroFacturacion>('todos');
  const [periodo, setPeriodo] = useState<PeriodoOrdenes>('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const hayFiltros =
    filtroFacturacion !== 'todos' || periodo !== 'todos' || busqueda.trim() !== '';

  const limpiarFiltros = () => {
    setFiltroFacturacion('todos');
    setPeriodo('todos');
    setFechaInicio('');
    setFechaFin('');
    setBusqueda('');
  };

  // Navega a facturación con el modo elegido (xml o manual) para que la
  // página de facturas abra el modal correspondiente con la orden precargada.
  const irAFactura = (modo: 'xml' | 'manual') => {
    if (!ordenAFacturar) return;
    navigate(
      `/financiero/facturas?orden_id=${ordenAFacturar.id}&cliente_id=${ordenAFacturar.cliente?.id ?? ''}&tipo=${modo}`,
    );
    setOrdenAFacturar(null);
  };

  const { data: ordenes, isLoading, isError, error } = useQuery<
    OrdenTrabajoDetalle[]
  >({
    queryKey: ['ordenes-trabajo-financiero'],
    queryFn: async () => {
      const res = await api.get<OrdenTrabajoDetalle[]>('/recepcion-equipos');
      return res.data;
    },
    retry: 1,
  });

  // Facturas ya emitidas: mismo queryKey que FacturasPage para reutilizar la
  // caché. Sirve para saber qué órdenes ya fueron facturadas.
  const { data: facturas = [] } = useQuery<FacturaResumen[]>({
    queryKey: ['facturas'],
    queryFn: async () => {
      const res = await api.get<FacturaResumen[]>('/facturacion/facturas');
      return res.data;
    },
  });

  // Índice orden de trabajo → factura. Si una orden originó más de una factura
  // (re-facturación), se conserva la de mayor id (la más reciente) para abrir
  // su detalle.
  const facturaPorOrden = useMemo(() => {
    const mapa = new Map<number, FacturaResumen>();
    for (const factura of facturas) {
      const ordenId = factura.orden_trabajo?.id;
      if (!ordenId) continue;
      const actual = mapa.get(ordenId);
      if (!actual || factura.id > actual.id) mapa.set(ordenId, factura);
    }
    return mapa;
  }, [facturas]);

  const ordenesFiltradas = useMemo(() => {
    const lista = ordenes ?? [];
    const termino = normalize(busqueda.trim());

    // Rango de fechas activo, aplicado sobre la fecha de ingreso de la orden.
    const rango = periodo === 'todos' ? {} : rangoParaPeriodo(periodo, fechaInicio, fechaFin);

    return lista.filter((orden) => {
      // 1) Estado de facturación (Todos / Listos / Facturados)
      if (filtroFacturacion === 'listos') {
        if (!esOrdenFacturable(orden) || facturaPorOrden.has(orden.id)) {
          return false;
        }
      } else if (filtroFacturacion === 'facturados') {
        if (!facturaPorOrden.has(orden.id)) return false;
      }

      // 2) Rango de fechas sobre fecha_ingreso (comparación 'YYYY-MM-DD').
      if (rango.desde || rango.hasta) {
        const fecha = orden.fecha_ingreso?.slice(0, 10);
        if (!fecha) return false;
        if (rango.desde && fecha < rango.desde) return false;
        if (rango.hasta && fecha > rango.hasta) return false;
      }

      // 3) Búsqueda de texto (Nº orden, cliente, proforma)
      if (termino) {
        const numeroOrden = normalize(orden.orden_trabajo_fisica ?? '');
        const cliente = normalize(orden.cliente?.nombre ?? '');
        const proforma = normalize(orden.n_proforma ?? '');
        return (
          numeroOrden.includes(termino) ||
          cliente.includes(termino) ||
          proforma.includes(termino)
        );
      }

      return true;
    });
  }, [ordenes, busqueda, filtroFacturacion, periodo, fechaInicio, fechaFin, facturaPorOrden]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Órdenes de Trabajo
            </h1>
            <p className="text-sm text-muted-foreground">
              Consulta de órdenes para facturación. La gestión de la orden se
              realiza en Recepción de Equipos.
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por Nº orden, cliente, proforma…"
            className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      {/* Barra de filtros: estado de facturación + rango de fechas */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Facturación
          </span>
          <div className="inline-flex items-center rounded-md border border-input bg-background p-0.5">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'listos', label: 'Listos para facturar' },
                { id: 'facturados', label: 'Facturados' },
              ] as const
            ).map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setFiltroFacturacion(op.id)}
                className={cn(
                  'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                  filtroFacturacion === op.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Período
          </span>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoOrdenes)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
          >
            <option value="todos">Todo el histórico</option>
            <option value="ultimos30">Últimos 30 días</option>
            <option value="esteMes">Este mes</option>
            <option value="mesAnterior">Mes anterior</option>
            <option value="esteAnio">Este año</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        {periodo === 'personalizado' && (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Desde
              </span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Hasta
              </span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
              />
            </div>
          </>
        )}

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="inline-flex h-9 items-center gap-1.5 self-end rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                {[
                  'Nº Orden Física',
                  'Proforma',
                  'Cliente',
                  'Fecha Ingreso',
                  'Equipos',
                  'Estado',
                  'Acción',
                ].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
                      h === 'Acción' || h === 'Equipos'
                        ? 'text-center'
                        : '',
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted-foreground/10" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-6 w-6" />
                      <span>
                        No se pudieron cargar las órdenes de trabajo.{(error as Error)?.message ? ` ${(error as Error).message}` : ''}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : ordenesFiltradas.length > 0 ? (
                ordenesFiltradas.map((orden) => {
                  const facturable = esOrdenFacturable(orden);
                  const facturaEmitida = facturaPorOrden.get(orden.id);
                  const rep = estadoRepresentativo(orden);
                  const distintos = new Set(
                    (orden.equipos ?? []).map((e) => e.estado),
                  ).size;
                  return (
                    <tr
                      key={orden.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-foreground">
                        <span className="text-red-600">
                          #{orden.orden_trabajo_fisica}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
                        {orden.n_proforma ? (
                          orden.proforma_id ? (
                            <Link
                              to={`/financiero/proformas?proforma=${orden.proforma_id}`}
                              title="Ver detalle de la proforma"
                              className="text-primary hover:underline"
                            >
                              {orden.n_proforma}
                            </Link>
                          ) : (
                            orden.n_proforma
                          )
                        ) : (
                          <span className="italic text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
                        {orden.cliente?.nombre ?? (
                          <span className="italic text-muted-foreground/60">
                            Sin cliente
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                        {formatDate(orden.fecha_ingreso)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-foreground">
                        {orden.equipos?.length ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {rep ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                ESTADO_COLOR[rep] ??
                                  'bg-muted text-muted-foreground border-border',
                              )}
                            >
                              {ESTADO_LABEL[rep] ?? rep}
                            </span>
                            {distintos > 1 && (
                              <span
                                className="text-xs text-muted-foreground"
                                title={`La orden tiene equipos en ${distintos} estados distintos`}
                              >
                                +{distintos - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/60">
                            Sin equipos
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        {facturaEmitida ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/financiero/facturas/${facturaEmitida.id}`)
                            }
                            title={`Ver el detalle de la factura ${facturaEmitida.numero}`}
                            className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Facturado
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!facturable}
                            onClick={() => setOrdenAFacturar(orden)}
                            title={
                              facturable
                                ? 'Registrar la factura de esta orden'
                                : 'La factura se habilita cuando todos los equipos de la orden estén FINALIZADO'
                            }
                          >
                            <Receipt className="h-4 w-4" />
                            Facturar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Inbox className="h-8 w-8" />
                      {hayFiltros ? (
                        <span>
                          No hay órdenes que coincidan con los filtros.
                        </span>
                      ) : (
                        <span>No hay órdenes de trabajo registradas.</span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie: resumen */}
      {!isLoading && !isError && (ordenes?.length ?? 0) > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardList className="h-4 w-4" />
          <span>
            {ordenesFiltradas.length} de {(ordenes ?? []).length} órdenes ·{' '}
            {
              ordenesFiltradas.filter(
                (o) => esOrdenFacturable(o) && !facturaPorOrden.has(o.id),
              ).length
            }{' '}
            listas para facturar ·{' '}
            {ordenesFiltradas.filter((o) => facturaPorOrden.has(o.id)).length}{' '}
            facturadas
          </span>
        </div>
      )}

      {/* Selector de modo de factura: exportar XML o llenar manualmente */}
      <Modal
        isOpen={ordenAFacturar !== null}
        onClose={() => setOrdenAFacturar(null)}
        title="Registrar factura"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La factura quedará vinculada a la Orden #
            <span className="font-semibold text-foreground">
              {ordenAFacturar?.orden_trabajo_fisica}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-foreground">
              {ordenAFacturar?.cliente?.nombre ?? 'su cliente'}
            </span>
            . ¿Cómo deseas registrar el comprobante?
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => irAFactura('xml')}
              className="group flex flex-col items-start gap-2 rounded-lg border border-sky-300 bg-sky-50 p-4 text-left transition-colors hover:bg-sky-100"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800">
                <UploadCloud className="h-4 w-4" />
                Importar XML
              </span>
              <span className="text-xs text-sky-700">
                Subir el XML generado por el sistema financiero; se absorben
                número, fechas, montos y detalle automáticamente.
              </span>
            </button>
            <button
              type="button"
              onClick={() => irAFactura('manual')}
              className="group flex flex-col items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <PenLine className="h-4 w-4" />
                Llenar manualmente
              </span>
              <span className="text-xs text-muted-foreground">
                Registrar la factura a mano con el detalle de los equipos de la
                orden precargado.
              </span>
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOrdenAFacturar(null)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}