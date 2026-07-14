import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Award,
  Copy,
  Eye,
  Inbox,
  Search,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import api from '../../../core/api/axios';

// ---------------------------------------------------------------------------
// Types — reflejan certificados.service.ts::findAll()
// ---------------------------------------------------------------------------

interface LaboratorioResumen {
  id: number;
  nombre: string;
}

interface ClienteResumen {
  id: number;
  nombre: string;
}

interface TecnicoResumen {
  id: number;
  nombre: string;
  apellidos: string;
}

interface CertificadoListado {
  id: number;
  numero_certificado: number;
  numero_certificado_formateado: string;
  codigo_verificacion: string;
  nombre_original: string;
  fecha_subida: string;
  tecnico: TecnicoResumen;
  equipo_recepcion: {
    id: number;
    estado: string;
    equipo_descripcion: string;
    laboratorio: LaboratorioResumen | null;
    orden_trabajo: {
      orden_trabajo_fisica: string;
      cliente: ClienteResumen | null;
    } | null;
  };
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

function normalize(str: string) {
  return Array.from(str.toLowerCase().normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join('');
}

const ESTADO_LABEL: Record<string, string> = {
  EN_ESPERA: 'En espera',
  EN_CALIBRACION: 'En calibración',
  REVISION_OBT: 'Revisión OBT',
  PENDIENTE_FIRMA_TECNICO: 'Pendiente firma técnico',
  REVISION_JEFE: 'Revisión jefe',
  REVISION_DIRECTOR: 'Revisión director',
  LISTO_PARA_ENTREGA: 'Listo para entrega',
  FINALIZADO: 'Finalizado',
};

const ESTADO_COLOR: Record<string, string> = {
  EN_ESPERA: 'bg-amber-100 text-amber-800',
  EN_CALIBRACION: 'bg-blue-100 text-blue-800',
  REVISION_OBT: 'bg-violet-100 text-violet-800',
  PENDIENTE_FIRMA_TECNICO: 'bg-orange-100 text-orange-800',
  REVISION_JEFE: 'bg-indigo-100 text-indigo-800',
  REVISION_DIRECTOR: 'bg-purple-100 text-purple-800',
  LISTO_PARA_ENTREGA: 'bg-teal-100 text-teal-800',
  FINALIZADO: 'bg-green-100 text-green-800',
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

function useCertificados() {
  return useQuery<CertificadoListado[]>({
    queryKey: ['certificados'],
    queryFn: async () => {
      const res = await api.get<CertificadoListado[]>('/certificados');
      return res.data;
    },
    retry: 1,
  });
}

async function verCertificado(certificadoId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/certificados/download/${certificadoId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `Error HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
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
              ? 'Sin resultados para los filtros aplicados'
              : 'No hay certificados emitidos'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilter
              ? 'Intente con otro laboratorio, cliente o número.'
              : 'Los certificados subidos desde la bandeja de trabajo aparecerán aquí.'}
          </p>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const COLS = 8;

export default function CertificadosPage() {
  const { data: certificados, isLoading, isError, error } = useCertificados();

  const [busqueda, setBusqueda] = useState('');
  const [laboratorioId, setLaboratorioId] = useState<string>('');
  const [copiadoId, setCopiadoId] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const laboratorios = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const c of certificados ?? []) {
      const lab = c.equipo_recepcion.laboratorio;
      if (lab) mapa.set(lab.id, lab.nombre);
    }
    return Array.from(mapa.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [certificados]);

  const certificadosFiltrados = useMemo(() => {
    const lista = certificados ?? [];
    const termino = normalize(busqueda.trim());

    return lista.filter((c) => {
      if (laboratorioId && String(c.equipo_recepcion.laboratorio?.id) !== laboratorioId) {
        return false;
      }
      if (!termino) return true;

      const haystack = normalize(
        [
          c.numero_certificado_formateado,
          c.equipo_recepcion.orden_trabajo?.cliente?.nombre ?? '',
          c.equipo_recepcion.orden_trabajo?.orden_trabajo_fisica ?? '',
          c.equipo_recepcion.equipo_descripcion,
        ].join(' '),
      );
      return haystack.includes(termino);
    });
  }, [certificados, busqueda, laboratorioId]);

  const handleVer = async (id: number) => {
    setErrorAccion(null);
    try {
      await verCertificado(id);
    } catch (err) {
      setErrorAccion(
        err instanceof Error ? err.message : 'No se pudo abrir el certificado',
      );
    }
  };

  const handleCopiarCodigo = async (codigo: string, id: number) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      setErrorAccion('No se pudo copiar el código al portapapeles');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Certificados Emitidos
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Repositorio de certificados cargados en el sistema
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={laboratorioId}
            onChange={(e) => setLaboratorioId(e.target.value)}
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
              placeholder="Buscar por número, cliente, orden…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error banners */}
      {/* ------------------------------------------------------------------ */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error instanceof Error
            ? error.message
            : 'No se pudieron cargar los certificados. Intente nuevamente.'}
        </div>
      )}
      {errorAccion && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorAccion}
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
                <TH>Número</TH>
                <TH>Fecha</TH>
                <TH>Laboratorio</TH>
                <TH>Cliente</TH>
                <TH>Orden Física</TH>
                <TH>Técnico</TH>
                <TH className="text-center">Estado</TH>
                <TH className="text-center">Acciones</TH>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton cols={COLS} />
              ) : certificadosFiltrados.length > 0 ? (
                certificadosFiltrados.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-foreground">
                      {c.numero_certificado_formateado}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(c.fecha_subida)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {c.equipo_recepcion.laboratorio?.nombre ?? (
                        <span className="italic text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {c.equipo_recepcion.orden_trabajo?.cliente?.nombre ?? (
                        <span className="italic text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {c.equipo_recepcion.orden_trabajo?.orden_trabajo_fisica ? (
                        <span className="text-red-600">
                          #{c.equipo_recepcion.orden_trabajo.orden_trabajo_fisica}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {c.tecnico.nombre} {c.tecnico.apellidos}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          ESTADO_COLOR[c.equipo_recepcion.estado] ??
                            'bg-gray-100 text-gray-700',
                        )}
                      >
                        {ESTADO_LABEL[c.equipo_recepcion.estado] ??
                          c.equipo_recepcion.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleVer(c.id)}
                          title="Ver certificado"
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopiarCodigo(c.codigo_verificacion, c.id)}
                          title="Copiar código de verificación"
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiadoId === c.id ? 'Copiado' : 'Código'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState
                  cols={COLS}
                  hasFilter={busqueda.trim().length > 0 || !!laboratorioId}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
