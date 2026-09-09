import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ClipboardList,
  Eye,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import api from '../../../core/api/axios';
import { getUsuarioActual } from '../../../shared/hooks/useAuth';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { esUsuarioAdministrador } from '../../../shared/utils/auth';
import VistaDetalleOrden, {
  type OrdenTrabajoDetalle,
} from '../components/VistaDetalleOrden';
import FormOrdenTrabajo from '../components/FormOrdenTrabajo';
import EditarOrdenModal from '../components/EditarOrdenModal';

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

// ---------------------------------------------------------------------------
// Data fetching — reutiliza el endpoint Maestro-Detalle del backend
// (recepcion-equipos.service.ts → findAll con ORDEN_INCLUDE)
// ---------------------------------------------------------------------------

function useOrdenesTrabajo() {
  return useQuery<OrdenTrabajoDetalle[]>({
    queryKey: ['ordenes-trabajo'],
    queryFn: async () => {
      const res = await api.get<OrdenTrabajoDetalle[]>('/recepcion-equipos');
      return res.data;
    },
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TH({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      {children}
    </th>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted-foreground/10" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ cols, hasFilter }: { cols: number; hasFilter: boolean }) {
  return (
    <tr>
      <td colSpan={cols}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {hasFilter
              ? 'Sin resultados para la búsqueda'
              : 'No hay órdenes de trabajo registradas'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilter
              ? 'Intente con otro número de orden o nombre de cliente.'
              : 'Aún no se ha registrado ninguna orden de trabajo en el sistema.'}
          </p>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const COLS = 6;

export default function RecepcionesPage() {
  const { data: ordenes, isLoading, isError, error } = useOrdenesTrabajo();
  const queryClient = useQueryClient();
  const { alert, confirm } = useAlert();
  const { toast } = useToast();

  const [busqueda, setBusqueda] = useState('');
  const [laboratorioFiltro, setLaboratorioFiltro] = useState('');
  const [ordenSeleccionada, setOrdenSeleccionada] =
    useState<OrdenTrabajoDetalle | null>(null);
  const [editarOrden, setEditarOrden] = useState<OrdenTrabajoDetalle | null>(
    null,
  );
  const [nuevaOrdenOpen, setNuevaOrdenOpen] = useState(false);

  const esAdministrador = esUsuarioAdministrador();

  const eliminarMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/recepcion-equipos/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      toast({ message: 'Orden de trabajo eliminada correctamente.' });
    },
    onError: async (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      await alert({
        message:
          apiErr?.response?.data?.message ||
          'Error al eliminar la orden de trabajo',
      });
    },
  });

  const handleEliminar = async (orden: OrdenTrabajoDetalle) => {
    if (
      !(await confirm({
        title: 'Eliminar orden',
        message: `¿Eliminar definitivamente la Orden de Trabajo #${orden.orden_trabajo_fisica}? Se borrarán también sus equipos, historial y certificados.`,
      }))
    ) {
      return;
    }
    eliminarMutation.mutate(orden.id);
  };

  // ------------------------------------------------------------------
  // Laboratorios disponibles — derivados de los equipos ya cargados,
  // no del endpoint /laboratorios (que exige un permiso RBAC distinto).
  // ------------------------------------------------------------------
  const laboratorios = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const orden of ordenes ?? []) {
      for (const equipo of orden.equipos ?? []) {
        if (equipo.laboratorio) {
          mapa.set(equipo.laboratorio.id, equipo.laboratorio.nombre);
        }
      }
    }
    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [ordenes]);

  // ------------------------------------------------------------------
  // Filtro local por Nº Orden Física, Cliente y Laboratorio — una orden
  // pasa el filtro de laboratorio si al menos uno de sus equipos
  // pertenece al laboratorio elegido (una orden puede repartirse entre
  // varios laboratorios).
  // ------------------------------------------------------------------
  const ordenesFiltradas = useMemo(() => {
    const lista = ordenes ?? [];
    const termino = normalize(busqueda.trim());

    return lista.filter((orden) => {
      if (
        laboratorioFiltro &&
        !orden.equipos?.some(
          (equipo) => String(equipo.laboratorio?.id) === laboratorioFiltro,
        )
      ) {
        return false;
      }
      if (!termino) return true;

      const numeroOrden = normalize(orden.orden_trabajo_fisica ?? '');
      const cliente = normalize(orden.cliente?.nombre ?? '');
      return numeroOrden.includes(termino) || cliente.includes(termino);
    });
  }, [ordenes, busqueda, laboratorioFiltro]);

  return (
    <div className="space-y-6 p-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Órdenes de Trabajo
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Listado de recepciones registradas en el sistema
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={laboratorioFiltro}
            onChange={(e) => setLaboratorioFiltro(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todos los laboratorios</option>
            {laboratorios.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por Nº orden o cliente…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {esAdministrador && (
            <button
              type="button"
              onClick={() => setNuevaOrdenOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nueva Orden de Trabajo
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error banner */}
      {/* ------------------------------------------------------------------ */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error instanceof Error
            ? error.message
            : 'No se pudieron cargar las órdenes de trabajo. Intente nuevamente.'}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Table card */}
      {/* ------------------------------------------------------------------ */}
      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <TH>Nº Orden Física</TH>
                <TH>Nº Proforma</TH>
                <TH>Cliente</TH>
                <TH>Fecha de Ingreso</TH>
                <TH className="text-center">Equipos</TH>
                <TH className="text-center">Acciones</TH>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton cols={COLS} />
              ) : ordenesFiltradas.length > 0 ? (
                ordenesFiltradas.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      <span className="text-red-600">
                        #{orden.orden_trabajo_fisica}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {orden.n_proforma || (
                        <span className="italic text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {orden.cliente?.nombre ?? (
                        <span className="italic text-muted-foreground/60">
                          Sin cliente
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(orden.fecha_ingreso)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-foreground">
                      {orden.equipos?.length ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {esAdministrador && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditarOrden(orden)}
                              title="Editar orden de trabajo"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminar(orden)}
                              disabled={eliminarMutation.isPending}
                              title="Eliminar orden de trabajo"
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              {eliminarMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Eliminar
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrdenSeleccionada(orden)}
                        >
                          <Eye className="h-4 w-4" />
                          Ver Detalle
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState
                  cols={COLS}
                  hasFilter={busqueda.trim().length > 0 || !!laboratorioFiltro}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modal de detalle — pantalla completa (w-[95vw]) */}
      {/* ------------------------------------------------------------------ */}
      {ordenSeleccionada && (
        <VistaDetalleOrden
          orden={ordenSeleccionada}
          onClose={() => setOrdenSeleccionada(null)}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal de nueva orden (solo administrador) */}
      {/* ------------------------------------------------------------------ */}
      {nuevaOrdenOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-sm bg-black/40 py-4">
          <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-[1800px] min-h-[85vh] relative mx-4 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold">Nueva Orden de Trabajo</h2>
              <button
                type="button"
                onClick={() => setNuevaOrdenOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <FormOrdenTrabajo
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
                  setNuevaOrdenOpen(false);
                }}
                onCancel={() => setNuevaOrdenOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal de edición de cabecera (solo administrador) */}
      {/* ------------------------------------------------------------------ */}
      <EditarOrdenModal
        orden={editarOrden}
        onClose={() => setEditarOrden(null)}
      />
    </div>
  );
}
