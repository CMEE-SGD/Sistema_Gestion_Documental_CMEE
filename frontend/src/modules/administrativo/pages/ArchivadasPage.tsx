import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, ChevronLeft, ChevronRight, Eye, Inbox, Search, Wallet } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { abrirCertificado } from '../../../shared/utils/abrirCertificado';
import api from '../../../core/api/axios';
import { getUsuarioActual } from '../../../shared/hooks/useAuth';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { Button } from '../../../shared/components/atoms/button';
import VistaDetalleEquipo from '../components/VistaDetalleEquipo';
import RegistrarPagoModal from '../components/RegistrarPagoModal';
import { otrosLaboratorios, type OrdenTrabajoDetalle } from '../components/VistaDetalleOrden';

// ---------------------------------------------------------------------------
// Equipos archivados: los que ya terminaron su flujo (estado FINALIZADO, es
// decir, entregados al cliente). Salen de la Bandeja de Trabajo y se consultan
// aquí, en modo solo lectura. "Archivado" no es un dato aparte sino el propio
// estado FINALIZADO (ver vista=archivadas en recepcion-equipos.service.ts), así
// que si el administrador devuelve un equipo a una fase anterior con "Cambiar
// fase" vuelve solo a la bandeja.
// ---------------------------------------------------------------------------

const POR_PAGINA = 25;

interface FilaArchivada {
  id: number;
  orden: OrdenTrabajoDetalle;
  orden_trabajo_fisica: string;
  fecha_ingreso: string;
  cliente: string;
  equipo_descripcion: string;
  otros_laboratorios: string[];
  laboratorio: { id: number; nombre: string } | null;
  tecnico: string;
  /** Cuándo pasó a FINALIZADO (sale del historial de estados). */
  entregadoEl: string | null;
  certificadoId: number | null;
  /** Estado del pago de la orden: pagada, pendiente (crédito) o sin costo. */
  pago: EstadoPago;
}

type EstadoPago = 'PAGADO' | 'PENDIENTE' | 'SIN_COSTO' | 'SIN_DATO';

/**
 * - SIN_COSTO: cliente militar, no se cobra.
 * - PAGADO: tiene comprobante (al retirar o registrado después).
 * - PENDIENTE: entregada a crédito y todavía sin comprobante.
 */
function estadoPago(orden: OrdenTrabajoDetalle): EstadoPago {
  if (orden.condicion_pago === 'SIN_COSTO') return 'SIN_COSTO';
  if (orden.comprobante_ruta) return 'PAGADO';
  if (orden.condicion_pago === 'CREDITO') return 'PENDIENTE';
  return 'SIN_DATO';
}

const PAGO_BADGE: Record<EstadoPago, { texto: string; clase: string } | null> = {
  PAGADO: { texto: 'Pagado', clase: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  PENDIENTE: { texto: 'Pago pendiente', clase: 'border-amber-300 bg-amber-50 text-amber-800' },
  SIN_COSTO: { texto: 'Sin costo', clase: 'border-slate-300 bg-slate-100 text-slate-700' },
  SIN_DATO: null,
};

function formatFecha(valor: string | null | undefined, utc = false): string {
  if (!valor) return '—';
  return new Date(valor).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // fecha_ingreso es solo fecha (medianoche UTC): se muestra en UTC para no
    // retroceder un día. entregadoEl es un instante: se muestra en hora local.
    ...(utc ? { timeZone: 'UTC' } : {}),
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
// Datos — la clave empieza con 'bandeja-trabajo' a propósito: todas las
// invalidaciones existentes (y el tiempo real) la refrescan sin tocar nada más.
// ---------------------------------------------------------------------------

function useArchivadas() {
  const user = getUsuarioActual();
  const puesto = user?.persona?.puesto ?? '';

  return useQuery<FilaArchivada[]>({
    queryKey: ['bandeja-trabajo', 'archivadas', puesto],
    queryFn: async () => {
      const res = await api.get<OrdenTrabajoDetalle[]>('/recepcion-equipos', {
        params: { vista: 'archivadas' },
      });
      return res.data.flatMap((orden) =>
        orden.equipos.map((equipo) => {
          const entrega = (equipo.historial_estado ?? []).find(
            (h) => h.estado_nuevo === 'FINALIZADO',
          );
          return {
            id: equipo.id,
            orden,
            orden_trabajo_fisica: orden.orden_trabajo_fisica,
            fecha_ingreso: orden.fecha_ingreso,
            cliente: orden.cliente?.nombre ?? '',
            equipo_descripcion: equipo.equipo_descripcion,
            otros_laboratorios: otrosLaboratorios(equipo),
            laboratorio: equipo.laboratorio
              ? { id: equipo.laboratorio.id, nombre: equipo.laboratorio.nombre }
              : null,
            tecnico: equipo.tecnico
              ? `${equipo.tecnico.nombre} ${equipo.tecnico.apellidos}`
              : '',
            entregadoEl: entrega?.createdAt ?? null,
            certificadoId: equipo.certificados?.[0]?.id ?? null,
            pago: estadoPago(orden),
          };
        }),
      );
    },
    enabled: !!puesto,
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Sub-componentes
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
        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
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
            <td key={j} className="px-4 py-4">
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
              : 'Aún no hay equipos archivados'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilter
              ? 'Intente con otro número de orden, equipo o cliente.'
              : 'Aquí aparecen los equipos cuando se marcan como entregados.'}
          </p>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

const COLS = 9;

export default function ArchivadasPage() {
  const user = getUsuarioActual();
  const puesto = user?.persona?.puesto ?? '';
  const { alert } = useAlert();

  const { data: archivadas, isLoading, error } = useArchivadas();

  const [busqueda, setBusqueda] = useState('');
  const [laboratorioFiltro, setLaboratorioFiltro] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [pagoOrden, setPagoOrden] = useState<OrdenTrabajoDetalle | null>(null);
  const [detalleEquipo, setDetalleEquipo] = useState<{
    orden: OrdenTrabajoDetalle;
    equipoId: number;
  } | null>(null);

  const laboratorios = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const f of archivadas ?? []) {
      if (f.laboratorio) mapa.set(f.laboratorio.id, f.laboratorio.nombre);
    }
    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [archivadas]);

  const filtradas = useMemo(() => {
    const termino = normalize(busqueda.trim());
    const lista = (archivadas ?? []).filter((f) => {
      if (laboratorioFiltro && String(f.laboratorio?.id) !== laboratorioFiltro) {
        return false;
      }
      if (soloPendientes && f.pago !== 'PENDIENTE') return false;
      if (!termino) return true;
      return normalize(
        [
          f.orden_trabajo_fisica,
          f.cliente,
          f.equipo_descripcion,
          f.laboratorio?.nombre ?? '',
          f.tecnico,
        ].join(' '),
      ).includes(termino);
    });
    // Más recientes primero: por fecha de entrega y, si no hay, por ingreso.
    return [...lista].sort(
      (a, b) =>
        new Date(b.entregadoEl ?? b.fecha_ingreso).getTime() -
        new Date(a.entregadoEl ?? a.fecha_ingreso).getTime(),
    );
  }, [archivadas, busqueda, laboratorioFiltro, soloPendientes]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const visibles = filtradas.slice(
    paginaActual * POR_PAGINA,
    paginaActual * POR_PAGINA + POR_PAGINA,
  );

  const handleVerDocumento = async (certificadoId: number) => {
    try {
      await abrirCertificado(certificadoId, 'certificado');
    } catch (err) {
      console.error('Error al descargar el documento:', err);
      await alert({ message: 'No se pudo abrir el documento' });
    }
  };

  if (!puesto) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">Puesto no identificado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No se pudo determinar su puesto de trabajo. Consulte con el
            administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Archive className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Equipos archivados
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Equipos que ya terminaron su flujo y fueron entregados. Las órdenes con pago
            pendiente se completan aquí con "Registrar pago".
          </p>
        </div>
      </div>

      {/* Regla de calibre — divisor graduado, igual que la bandeja */}
      <div className="h-px border-t border-dashed border-border" />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Error al cargar los datos'}
        </div>
      )}

      {/* Barra de herramientas */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={laboratorioFiltro}
          onChange={(e) => {
            setLaboratorioFiltro(e.target.value);
            setPagina(0);
          }}
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
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar por orden, equipo o cliente…"
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => {
              setSoloPendientes(e.target.checked);
              setPagina(0);
            }}
          />
          Solo pago pendiente
        </label>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <TH>Orden Física</TH>
                <TH>Ingreso</TH>
                <TH>Cliente</TH>
                <TH>Equipo</TH>
                <TH>Laboratorio</TH>
                <TH>Técnico</TH>
                <TH>Entregado el</TH>
                <TH>Pago</TH>
                <TH className="text-center">Documento</TH>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton cols={COLS} />
              ) : visibles.length > 0 ? (
                visibles.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() =>
                      setDetalleEquipo({ orden: f.orden, equipoId: f.id })
                    }
                    title="Ver detalles de la calibración"
                    className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-mono font-medium">
                      <span className="text-primary">{f.orden_trabajo_fisica}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
                      {formatFecha(f.fecha_ingreso, true)}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-4 text-sm text-foreground" title={f.cliente}>
                      {f.cliente || '—'}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-4 text-sm font-medium text-foreground" title={f.equipo_descripcion}>
                      {f.equipo_descripcion}
                      {f.otros_laboratorios.length > 0 && (
                        <span className="block truncate text-[11px] font-medium text-sky-700">
                          También en: {f.otros_laboratorios.join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-4 text-sm text-foreground" title={f.laboratorio?.nombre}>
                      {f.laboratorio?.nombre ?? (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-4 text-sm text-foreground" title={f.tecnico}>
                      {f.tecnico || (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
                      {formatFecha(f.entregadoEl)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {PAGO_BADGE[f.pago] ? (
                        <span
                          className={cn(
                            'inline-block rounded-full border px-2 py-0.5 text-xs font-medium',
                            PAGO_BADGE[f.pago]!.clase,
                          )}
                        >
                          {PAGO_BADGE[f.pago]!.texto}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                      {f.pago === 'PENDIENTE' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPagoOrden(f.orden);
                          }}
                          className="mt-1 flex w-fit items-center gap-1 rounded-md border border-emerald-600 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                          title="Subir el comprobante cuando el cliente pague"
                        >
                          <Wallet className="h-3.5 w-3.5" /> Registrar pago
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      {f.certificadoId !== null ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerDocumento(f.certificadoId!);
                          }}
                          title="Ver documento"
                          aria-label="Ver documento"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="italic text-muted-foreground">—</span>
                      )}
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

        {/* Paginación */}
        {!isLoading && filtradas.length > POR_PAGINA && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm text-muted-foreground">
            <span>
              Mostrando {paginaActual * POR_PAGINA + 1}–
              {Math.min((paginaActual + 1) * POR_PAGINA, filtradas.length)} de{' '}
              {filtradas.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagina(Math.max(0, paginaActual - 1))}
                disabled={paginaActual === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="tabular-nums">
                {paginaActual + 1} / {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagina(Math.min(totalPaginas - 1, paginaActual + 1))
                }
                disabled={paginaActual >= totalPaginas - 1}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <RegistrarPagoModal
        isOpen={!!pagoOrden}
        onClose={() => setPagoOrden(null)}
        ordenId={pagoOrden?.id ?? null}
        ordenFisica={pagoOrden?.orden_trabajo_fisica}
        montoSinIva={pagoOrden?.monto_sin_iva}
      />

      {detalleEquipo && (
        <VistaDetalleEquipo
          orden={detalleEquipo.orden}
          equipoId={detalleEquipo.equipoId}
          onClose={() => setDetalleEquipo(null)}
        />
      )}
    </div>
  );
}
