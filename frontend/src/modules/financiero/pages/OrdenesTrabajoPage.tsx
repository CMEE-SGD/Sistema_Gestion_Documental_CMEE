import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ClipboardList,
  Inbox,
  Receipt,
  Search,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import {
  type OrdenTrabajoDetalle,
  ESTADO_COLOR,
  ESTADO_LABEL,
} from '../../administrativo/components/VistaDetalleOrden';

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

/**
 * Vista de solo lectura de órdenes de trabajo dentro del módulo financiero.
 * La única acción disponible es "Facturar": la orden se origina y administra
 * en Recepción de Equipos; aquí solo se consulta para facturarla.
 */
export default function OrdenesTrabajoPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

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

  const ordenesFiltradas = useMemo(() => {
    const lista = ordenes ?? [];
    const termino = normalize(busqueda.trim());
    if (!termino) return lista;
    return lista.filter((orden) => {
      const numeroOrden = normalize(orden.orden_trabajo_fisica ?? '');
      const cliente = normalize(orden.cliente?.nombre ?? '');
      const proforma = normalize(orden.n_proforma ?? '');
      return (
        numeroOrden.includes(termino) ||
        cliente.includes(termino) ||
        proforma.includes(termino)
      );
    });
  }, [ordenes, busqueda]);

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
                        {orden.n_proforma || (
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
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!facturable}
                          onClick={() =>
                            navigate(
                              `/financiero/facturas?orden_id=${orden.id}&cliente_id=${orden.cliente?.id ?? ''}`,
                            )
                          }
                          title={
                            facturable
                              ? 'Registrar la factura de esta orden'
                              : 'La factura se habilita cuando todos los equipos de la orden estén FINALIZADO'
                          }
                        >
                          <Receipt className="h-4 w-4" />
                          Facturar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Inbox className="h-8 w-8" />
                      {busqueda.trim() ? (
                        <span>No hay órdenes que coincidan con la búsqueda.</span>
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
            {ordenesFiltradas.length} de {ordenes?.length ?? 0} órdenes ·{' '}
            {ordenes?.filter(esOrdenFacturable).length ?? 0} listas para
            facturar
          </span>
        </div>
      )}
    </div>
  );
}