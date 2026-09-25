import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ClipboardList,
  Clock,
  Eye,
  FlaskConical,
  GitBranch,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  FileX,
  UserPlus,
  UploadCloud,
  Inbox,
  X,
  CheckCircle,
  FileSignature,
  ShieldCheck,
  UserCheck,
  Handshake,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { abrirPdfProtegido } from '../../../shared/utils/abrirPdfProtegido';
import api from '../../../core/api/axios';
import { getUsuarioActual } from '../../../shared/hooks/useAuth';
import { esUsuarioAdministrador } from '../../../shared/utils/auth';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { Button } from '../../../shared/components/atoms/button';
import SubirCertificadoModal from '../components/SubirCertificadoModal';
import ValidacionCertificadoModal from '../components/ValidacionCertificadoModal';
import FirmarDigitalModal from '../components/FirmarDigitalModal';
import CambiarFaseModal from '../components/CambiarFaseModal';
import FormOrdenTrabajo from '../components/FormOrdenTrabajo';
import EditarOrdenModal from '../components/EditarOrdenModal';
import VistaDetalleEquipo from '../components/VistaDetalleEquipo';
import { type OrdenTrabajoDetalle } from '../components/VistaDetalleOrden';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EstadoKey =
  | 'EN_ESPERA'
  | 'EN_CALIBRACION'
  | 'REVISION_OBT'
  | 'PENDIENTE_FIRMA_TECNICO'
  | 'REVISION_JEFE'
  | 'REVISION_DIRECTOR'
  | 'LISTO_PARA_ENTREGA'
  | 'FINALIZADO';

interface BandejaRecepcion {
  id: number;
  orden_trabajo_fisica: string;
  fecha_ingreso: string;
  equipo_descripcion: string;
  estado: EstadoKey;
  observacion: string | null;
  orden: OrdenTrabajoDetalle;
  cliente?: { id: number; nombre: string };
  laboratorio?: { id: number; nombre: string };
  tecnico?: { id: number; nombre: string; apellidos: string };
  certificados?: { id: number }[];
}

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

interface PersonaOption {
  id: number;
  nombre: string;
  apellidos: string;
  grado?: string;
}

interface LaboratorioOption {
  id: number;
  nombre: string;
}

interface ClienteOption {
  id: number;
  nombre: string;
}

// ---------------------------------------------------------------------------
// Permission helpers — match against the full job-title strings stored in
// the database (e.g. "Observador Técnico", "Responsable servicio al Cliente").
// ---------------------------------------------------------------------------

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getPermissions(puesto: string): {
  canCreate: boolean;
  canAssign: boolean;
  canExecute: boolean;
} {
  if (!puesto) return { canCreate: false, canAssign: false, canExecute: false };

  const n = normalize(puesto);

  const canCreate = n.includes('responsable servicio al cliente');
  const canAssign = n.includes('observador');
  const canExecute = n.includes('tecnico') && !n.includes('observador');

  return { canCreate, canAssign, canExecute };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ESTADO_STYLES: Record<EstadoKey, string> = {
  EN_ESPERA:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  EN_CALIBRACION:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  REVISION_OBT:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  PENDIENTE_FIRMA_TECNICO:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  REVISION_JEFE:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  REVISION_DIRECTOR:
    'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  LISTO_PARA_ENTREGA:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  FINALIZADO:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function viewTitle(): string {
  return 'Gestión y seguimiento de equipos de laboratorio';
}

// ---------------------------------------------------------------------------
const ESTADO_ORDEN: Record<EstadoKey, number> = {
  EN_ESPERA: 1,
  EN_CALIBRACION: 2,
  REVISION_OBT: 3,
  PENDIENTE_FIRMA_TECNICO: 4,
  REVISION_JEFE: 5,
  REVISION_DIRECTOR: 6,
  LISTO_PARA_ENTREGA: 7,
  FINALIZADO: 8,
};

// Sub-components
// ---------------------------------------------------------------------------

const STAT_TONE_STYLES = {
  neutral: {
    chip: 'bg-primary/10',
    icon: 'text-primary',
    value: 'text-primary',
  },
  amber: {
    chip: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    chip: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    value: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    chip: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
  },
} as const;

function StatItem({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: number;
  tone: keyof typeof STAT_TONE_STYLES;
}) {
  const styles = STAT_TONE_STYLES[tone];
  return (
    <div className="flex flex-1 items-center gap-3 px-6 py-4">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
          styles.chip,
        )}
      >
        <Icon className={cn('h-5 w-5', styles.icon)} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={cn('mt-0.5 font-mono text-2xl font-bold tabular-nums', styles.value)}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ estado }: { estado: EstadoKey }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        ESTADO_STYLES[estado] ?? 'bg-gray-100 text-gray-800',
      )}
    >
      {estado.replace(/_/g, ' ')}
    </span>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {hasFilter ? 'Sin resultados para la búsqueda' : 'No hay registros pendientes'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilter
              ? 'Intente con otro número de orden, equipo, cliente o técnico.'
              : 'Todos los equipos han sido procesados o no hay solicitudes activas en este momento.'}
          </p>
        </div>
      </td>
    </tr>
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

// ---------------------------------------------------------------------------
// NuevoRegistroModal — Reemplaza el antiguo RegistroRapidoModal
// usando el nuevo componente FormOrdenTrabajo (Master-Detail)
// ---------------------------------------------------------------------------

function NuevoRegistroModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-sm bg-black/40 py-4">
      {/* PATCH: max-w-[1800px] + min-h-[85vh] para aprovechar monitores grandes */}
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-[95vw] max-w-[1800px] min-h-[85vh] relative mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold">Nueva Orden de Trabajo</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — flex-1 + overflow-auto para que la tabla scrollée sin comprimir */}
        <div className="flex-1 overflow-auto p-6">
          <FormOrdenTrabajo
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AsignarTecnicoModal
// ---------------------------------------------------------------------------

function AsignarTecnicoModal({
  open,
  recepcionId,
  laboratorioId,
  onClose,
}: {
  open: boolean;
  recepcionId: number | null;
  laboratorioId: number | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();
  const { toast } = useToast();

  const { data: personas } = useQuery<PersonaOption[]>({
    queryKey: ['personas', 'laboratorio', laboratorioId],
    queryFn: async () => {
      const res = await api.get('/personas', {
        params: { laboratorio_id: laboratorioId },
      });
      return res.data;
    },
    enabled: open && !!laboratorioId,
  });

  const [selectedTecnicoId, setSelectedTecnicoId] = useState<number | null>(
    null,
  );

  const mutation = useMutation({
    mutationFn: async (data: { tecnico_id: number }) => {
      const res = await api.patch(
        `/recepcion-equipos/${recepcionId}/asignar-tecnico`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({ message: 'Técnico asignado correctamente.' });
      onClose();
    },
    onError: async (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = err as any;
      await alert(
        { message: apiErr?.response?.data?.message || 'Error al asignar técnico' },
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTecnicoId) return;
    mutation.mutate({ tecnico_id: selectedTecnicoId });
  };

  if (!open || !recepcionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-lg relative mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Asignar técnico</h2>
          <button
            type="button"
            onClick={() => {
              setSelectedTecnicoId(null);
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Seleccione el técnico que realizará la calibración del equipo.
            </p>

            <div>
              <label
                htmlFor="asignar-tecnico-select"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Técnico
              </label>
              <select
                id="asignar-tecnico-select"
                value={selectedTecnicoId ?? ''}
                onChange={(e) =>
                  setSelectedTecnicoId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                disabled={!laboratorioId}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">Seleccione un técnico…</option>
                {personas?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.grado ? `${p.grado} ` : ''}
                    {p.nombre} {p.apellidos}
                  </option>
                ))}
              </select>
              {!laboratorioId && (
                <p className="mt-1.5 text-xs text-destructive">
                  Este equipo no tiene laboratorio asignado — no se puede
                  filtrar la lista de técnicos.
                </p>
              )}
              {laboratorioId && personas && personas.length === 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  No hay técnicos asignados a este laboratorio.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setSelectedTecnicoId(null);
                onClose();
              }}
              className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedTecnicoId || mutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Asignando…
                </>
              ) : (
                'Asignar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data fetching — all roles use the same unified endpoint; the backend
// applies row-level filtering via the JWT's `puesto` acronym.
//
// El backend devuelve una fila por ORDEN (cabecera) con un arreglo `equipos`
// anidado (modelo Maestro-Detalle). La bandeja de trabajo opera a nivel de
// equipo (cada acción — asignar técnico, subir certificado, transicionar
// estado — usa el id del equipo), así que aplanamos cada orden en una fila
// por equipo, heredando los datos de cabecera (nº orden, fecha, cliente).
// ---------------------------------------------------------------------------

function useBandejaData() {
  const user = getUsuarioActual();
  const puesto = user?.persona?.puesto ?? '';

  return useQuery<BandejaRecepcion[]>({
    queryKey: ['bandeja-trabajo', puesto],
    queryFn: async () => {
      const res = await api.get<OrdenTrabajoDetalle[]>('/recepcion-equipos');
      return res.data.flatMap((orden) =>
        orden.equipos.map((equipo) => {
          const historial = equipo.historial_estado ?? [];
          const rechazoVigente =
            historial[0]?.accion === 'RECHAZAR' && historial[0]?.observaciones
              ? historial[0].observaciones
              : null;
          return {
            id: equipo.id,
            orden_trabajo_fisica: orden.orden_trabajo_fisica,
            fecha_ingreso: orden.fecha_ingreso,
            equipo_descripcion: equipo.equipo_descripcion,
            estado: equipo.estado as EstadoKey,
            observacion: rechazoVigente,
            orden,
            cliente: orden.cliente,
            laboratorio: equipo.laboratorio ?? undefined,
            tecnico: equipo.tecnico ?? undefined,
            certificados: equipo.certificados,
          };
        }),
      );
    },
    enabled: !!puesto,
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function BandejaTrabajoPage() {
  const user = getUsuarioActual();
  const puesto = user?.persona?.puesto ?? '';

  const queryClient = useQueryClient();
  const { alert, confirm } = useAlert();
  const { toast } = useToast();

  // --- RBAC / ABAC flags derived from the permission helpers ---
  const { canCreate, canAssign, canExecute } = getPermissions(puesto);

  const nPuesto = normalize(puesto);
  const esObservador = nPuesto.includes('observador');
  // Excluye "jefe" de esTecnico — el puesto "Jefe Técnico de Laboratorio"
  // contiene "tecnico" en el texto, pero quien lo ocupa es el Jefe, no el
  // técnico asignado (mismo criterio que ya usan certificados.service.ts y
  // recepcion-equipos.service.ts en el backend). Sin esto, el Jefe también
  // veía el botón "Firmar Documento" del técnico en PENDIENTE_FIRMA_TECNICO.
  const esTecnico =
    nPuesto.includes('tecnico') &&
    !nPuesto.includes('observador') &&
    !nPuesto.includes('jefe');
  // "Jefe Departamento Gestión de la Calidad" no participa de este flujo,
  // pero su puesto también contiene "jefe" — se excluye para que no cuele
  // como Jefe de Laboratorio en REVISION_JEFE.
  const esJefe = nPuesto.includes('jefe') && !nPuesto.includes('calidad');
  const esDirector = nPuesto.includes('director');
  const esRSEC = nPuesto.includes('responsable servicio al cliente');

  const { data: recepciones, isLoading, error } = useBandejaData();

  const [busqueda, setBusqueda] = useState('');
  const [laboratorioFiltro, setLaboratorioFiltro] = useState('');
  const [ordenPor, setOrdenPor] = useState<'fecha' | 'estado'>('fecha');
  const [direccion, setDireccion] = useState<'asc' | 'desc'>('desc');

  const handleSort = (campo: 'fecha' | 'estado') => {
    if (ordenPor === campo) {
      setDireccion((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrdenPor(campo);
      setDireccion('desc');
    }
  };

  const esAdministrador = esUsuarioAdministrador();
  const [editarOrden, setEditarOrden] = useState<OrdenTrabajoDetalle | null>(
    null,
  );

  // Hacer clic sobre el equipo abre el detalle de su calibración.
  const [detalleEquipo, setDetalleEquipo] = useState<{
    orden: OrdenTrabajoDetalle;
    equipoId: number;
  } | null>(null);

  const eliminarOrden = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/recepcion-equipos/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
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

  const handleEliminarOrden = async (req: BandejaRecepcion) => {
    if (
      !(await confirm({
        title: 'Eliminar orden',
        message: `¿Eliminar definitivamente la Orden de Trabajo #${req.orden_trabajo_fisica}? Se borrarán también sus equipos, historial y certificados.`,
      }))
    ) {
      return;
    }
    eliminarOrden.mutate(req.orden.id);
  };

  // Elimina el/los documento(s) cargado(s) del equipo mientras está en
  // calibración — opción exclusiva de administración (el backend además
  // valida fase EN_CALIBRACION y nivel de acceso).
  const handleEliminarDocumento = async (req: BandejaRecepcion) => {
    const ids = (req.certificados ?? []).map((c) => c.id);
    if (ids.length === 0) return;
    if (
      !(await confirm({
        title: 'Eliminar documento',
        message: `¿Eliminar el documento cargado del equipo "${req.equipo_descripcion}"? Esta acción no se puede deshacer.`,
      }))
    ) {
      return;
    }
    try {
      await Promise.all(ids.map((id) => api.delete(`/certificados/${id}`)));
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      toast({ message: 'Documento eliminado correctamente.' });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      await alert({
        message:
          apiErr?.response?.data?.message || 'No se pudo eliminar el documento.',
      });
    }
  };

  const laboratorios = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const r of recepciones ?? []) {
      if (r.laboratorio) mapa.set(r.laboratorio.id, r.laboratorio.nombre);
    }
    return Array.from(mapa.entries())
      .map(([id, nombre]): LaboratorioOption => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [recepciones]);

  const recepcionesFiltradas = useMemo(() => {
    const lista = recepciones ?? [];
    const termino = normalize(busqueda.trim());

    const filtradas = lista.filter((r) => {
      if (laboratorioFiltro && String(r.laboratorio?.id) !== laboratorioFiltro) {
        return false;
      }
      if (!termino) return true;

      const haystack = normalize(
        [
          r.orden_trabajo_fisica,
          r.cliente?.nombre ?? '',
          r.equipo_descripcion,
          r.laboratorio?.nombre ?? '',
          r.tecnico ? `${r.tecnico.nombre} ${r.tecnico.apellidos}` : '',
        ].join(' '),
      );
      return haystack.includes(termino);
    });

    const factor = direccion === 'asc' ? 1 : -1;
    return [...filtradas].sort((a, b) => {
      if (ordenPor === 'estado') {
        const dif = ESTADO_ORDEN[a.estado] - ESTADO_ORDEN[b.estado];
        if (dif !== 0) return dif * factor;
        // Desempate: el más reciente primero.
        return (
          new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime()
        );
      }
      return (
        (new Date(a.fecha_ingreso).getTime() - new Date(b.fecha_ingreso).getTime()) *
        factor
      );
    });
  }, [recepciones, busqueda, laboratorioFiltro, ordenPor, direccion]);

  // Modal state
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);
  const [asignacionTecnico, setAsignacionTecnico] = useState<{
    equipoId: number;
    laboratorioId: number | null;
  } | null>(null);
  const [isCertificadoModalOpen, setIsCertificadoModalOpen] = useState(false);
  const [selectedCertificadoRecepcion, setSelectedCertificadoRecepcion] =
    useState<{ id: number; laboratorioId: number | null } | null>(null);
  const [isValidacionModalOpen, setIsValidacionModalOpen] = useState(false);
  const [selectedValidacionRecepcion, setSelectedValidacionRecepcion] =
    useState<{ id: number; estado: string; titulo: string } | null>(null);
  const [isFirmaModalOpen, setIsFirmaModalOpen] = useState(false);
  const [selectedFirma, setSelectedFirma] = useState<{
    recepcionId: number;
    certificadoId: number | null;
    tipoDocumento: 'reporte' | 'certificado';
    titulo: string;
  } | null>(null);
  const [cambiarFase, setCambiarFase] = useState<{
    id: number;
    equipoDescripcion: string;
    estado: string;
  } | null>(null);

  const handleVerCertificado = async (
    certificadoId: number,
    tipo: 'reporte' | 'certificado',
  ) => {
    try {
      await abrirPdfProtegido(
        `${import.meta.env.VITE_API_URL}/certificados/download/${certificadoId}?tipo=${tipo}`,
      );
    } catch (err) {
      console.error('Error al descargar certificado:', err);
      await alert({
        message: `No se pudo abrir el ${tipo === 'certificado' ? 'certificado' : 'reporte'}`,
      });
    }
  };

  // KPI counts
  const kpis = useMemo(() => {
    const list = recepciones ?? [];
    return {
      total: list.length,
      enEspera: list.filter((r) => r.estado === 'EN_ESPERA').length,
      enCalibracion: list.filter((r) => r.estado === 'EN_CALIBRACION').length,
      entregados: list.filter((r) => r.estado === 'FINALIZADO').length,
    };
  }, [recepciones]);

  // Guard: no role determined
  if (!puesto) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="max-w-md rounded-xl border border-border bg-card text-card-foreground p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <ClipboardList className="h-6 w-6 text-amber-600" />
          </div>
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
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Bandeja de Trabajo
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{viewTitle()}</p>
        </div>
      </div>

      {/* Regla de calibre — divisor graduado, sin decoración de más */}
      <div className="h-px border-t border-dashed border-border" />

      {/* ------------------------------------------------------------------ */}
      {/* Error banner */}
      {/* ------------------------------------------------------------------ */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Error al cargar los datos'}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KPI strip */}
      {/* ------------------------------------------------------------------ */}
      {!isLoading && recepciones && (
        <div className="flex flex-col divide-y divide-dashed divide-border overflow-hidden rounded-lg border border-border border-t-2 border-t-[#A67C3D] bg-card text-card-foreground shadow-sm sm:flex-row sm:divide-x sm:divide-y-0">
          <StatItem
            icon={ClipboardList}
            label="Total recepciones"
            value={kpis.total}
            tone="neutral"
          />
          <StatItem
            icon={Clock}
            label="En espera"
            value={kpis.enEspera}
            tone="amber"
          />
          <StatItem
            icon={FlaskConical}
            label="En calibración"
            value={kpis.enCalibracion}
            tone="blue"
          />
          <StatItem
            icon={CheckCircle}
            label="Entregados"
            value={kpis.entregados}
            tone="green"
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Table toolbar */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
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
              placeholder="Buscar por orden, equipo o cliente…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {(canCreate || esAdministrador) && (
          <button
            type="button"
            onClick={() => setIsRegistroModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nuevo registro
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Table card */}
      {/* ------------------------------------------------------------------ */}
      <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <TH>Orden Física</TH>
                <SortableTH campo="fecha" ordenPor={ordenPor} direccion={direccion} onSort={handleSort}>Fecha</SortableTH>
                <TH>Cliente</TH>
                <TH>Equipo</TH>
                <TH>Laboratorio</TH>
                <SortableTH campo="estado" ordenPor={ordenPor} direccion={direccion} onSort={handleSort} className="text-center">Estado</SortableTH>
                <TH>Técnico</TH>
                <TH>Observaciones</TH>
                {(canAssign || canExecute) && (
                  <TH className="text-center">Acción</TH>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton
                  cols={
                    canAssign || canExecute ? 9 : 8
                  }
                />
              ) : recepcionesFiltradas.length > 0 ? (
                recepcionesFiltradas.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() =>
                      setDetalleEquipo({
                        orden: req.orden,
                        equipoId: req.id,
                      })
                    }
                    title="Ver detalles de la calibración"
                    className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono font-medium">
                      <span className="text-primary">
                        #{req.orden_trabajo_fisica}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-muted-foreground">
                      {formatDate(req.fecha_ingreso)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {req.cliente?.nombre ?? (
                        <span className="italic text-muted-foreground/60">
                          Sin cliente
                        </span>
                      )}
                    </td>
                    <td className="max-w-[220px] px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetalleEquipo({
                            orden: req.orden,
                            equipoId: req.id,
                          });
                        }}
                        title="Ver detalles de la calibración"
                        className="block w-full truncate text-left font-medium text-foreground transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:underline"
                      >
                        {req.equipo_descripcion}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {req.laboratorio?.nombre ?? (
                        <span className="italic text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <StatusBadge estado={req.estado} />
                      {req.observacion && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert({
                              title: 'Motivo de rechazo',
                              message: req.observacion ?? '',
                            });
                          }}
                          className="mx-auto mt-1 inline-flex cursor-pointer items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                        >
                          <AlertCircle className="h-3 w-3" />
                          Observado
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {req.tecnico ? (
                        `${req.tecnico.nombre} ${req.tecnico.apellidos}`
                      ) : (
                        <span className="italic text-muted-foreground/60">
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="max-w-[240px] px-6 py-4 text-sm">
                      {req.orden.observaciones?.trim() ? (
                        <span
                          title={req.orden.observaciones}
                          className="block truncate text-muted-foreground"
                        >
                          {req.orden.observaciones}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </td>
                    {(canAssign || canExecute || esObservador || esJefe || esDirector || esRSEC || esAdministrador) && (
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <div
                          className="flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Administrador: Editar orden */}
                          {esAdministrador && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditarOrden(req.orden)}
                              title="Editar orden"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Administrador: Cambiar fase manualmente */}
                          {esAdministrador && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setCambiarFase({
                                  id: req.id,
                                  equipoDescripcion: req.equipo_descripcion,
                                  estado: req.estado,
                                })
                              }
                              title="Cambiar fase manualmente"
                            >
                              <GitBranch className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Administrador: Eliminar orden */}
                          {esAdministrador && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEliminarOrden(req)}
                              title="Eliminar orden"
                              disabled={eliminarOrden.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* EN_CALIBRACION: Eliminar documento (solo admin) */}
                          {esAdministrador &&
                            req.estado === 'EN_CALIBRACION' &&
                            (req.certificados?.length ?? 0) > 0 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEliminarDocumento(req)}
                                title="Eliminar documento"
                                className="text-destructive hover:text-destructive"
                              >
                                <FileX className="h-4 w-4" />
                              </Button>
                            )}

                          {/* OBT: Editar orden mientras no haya técnico asignado —
                          corrige datos mal cargados por Servicio al Cliente.
                          Una vez asignado el técnico (estado pasa a
                          EN_CALIBRACION) el botón desaparece. */}
                          {canAssign &&
                            req.estado === 'EN_ESPERA' &&
                            !req.tecnico && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditarOrden(req.orden)}
                                title="Editar orden"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}

                          {/* EN_ESPERA: Asignar técnico */}
                          {canAssign && req.estado === 'EN_ESPERA' && !req.tecnico && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setAsignacionTecnico({
                                  equipoId: req.id,
                                  laboratorioId: req.laboratorio?.id ?? null,
                                })
                              }
                              title="Asignar técnico"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}

                          {/* EN_CALIBRACION / REVISION_OBT: Cambiar técnico —
                          el OBT todavía puede corregir una mala asignación
                          mientras el técnico no haya firmado nada. */}
                          {canAssign &&
                            (req.estado === 'EN_CALIBRACION' || req.estado === 'REVISION_OBT') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setAsignacionTecnico({
                                    equipoId: req.id,
                                    laboratorioId: req.laboratorio?.id ?? null,
                                  })
                                }
                                title="Cambiar técnico"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            )}

                          {/* EN_CALIBRACION: Subir certificado */}
                          {canExecute && req.estado === 'EN_CALIBRACION' && (
                            <Button
                              variant="default"
                              size="default"
                              onClick={() => {
                                setSelectedCertificadoRecepcion({
                                  id: req.id,
                                  laboratorioId: req.laboratorio?.id ?? null,
                                });
                                setIsCertificadoModalOpen(true);
                              }}
                              title="Subir certificado"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <UploadCloud className="h-4 w-4" />
                              Subir Certificado
                            </Button>
                          )}

                          {/* REVISION_OBT: Revisar (Observador / Jefe) */}
                          {req.estado === 'REVISION_OBT' && esObservador && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedValidacionRecepcion({
                                  id: req.id,
                                  estado: req.estado,
                                  titulo: 'Revisar Certificado',
                                });
                                setIsValidacionModalOpen(true);
                              }}
                              title="Revisar certificado"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Revisar Certificado
                            </Button>
                          )}

                          {/* PENDIENTE_FIRMA_TECNICO: Firmar (Técnico) */}
                          {req.estado === 'PENDIENTE_FIRMA_TECNICO' &&
                            esTecnico && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedFirma({
                                    recepcionId: req.id,
                                    certificadoId: req.certificados?.[0]?.id ?? null,
                                    tipoDocumento: 'reporte',
                                    titulo: 'Firma del Técnico',
                                  });
                                  setIsFirmaModalOpen(true);
                                }}
                                title="Firmar documento"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <FileSignature className="h-4 w-4" />
                                Firmar Documento
                              </Button>
                            )}

                          {/* REVISION_JEFE: Validar (Jefe) */}
                          {req.estado === 'REVISION_JEFE' && esJefe && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedFirma({
                                  recepcionId: req.id,
                                  certificadoId: req.certificados?.[0]?.id ?? null,
                                  tipoDocumento: 'reporte',
                                  titulo: 'Firma del Jefe de Laboratorio',
                                });
                                setIsFirmaModalOpen(true);
                              }}
                              title="Validar jefatura"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Validar Jefatura
                            </Button>
                          )}

                          {/* REVISION_DIRECTOR: Aprobación Final (Director) */}
                          {req.estado === 'REVISION_DIRECTOR' && esDirector && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedFirma({
                                  recepcionId: req.id,
                                  certificadoId: req.certificados?.[0]?.id ?? null,
                                  tipoDocumento: 'certificado',
                                  titulo: 'Firma del Director',
                                });
                                setIsFirmaModalOpen(true);
                              }}
                              title="Aprobación final"
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              <UserCheck className="h-4 w-4" />
                              Aprobación Final
                            </Button>
                          )}

                          {/* LISTO_PARA_ENTREGA: Entregar (RSEC) */}
                          {req.estado === 'LISTO_PARA_ENTREGA' && esRSEC && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedValidacionRecepcion({
                                  id: req.id,
                                  estado: req.estado,
                                  titulo: 'Marcar como Entregado',
                                });
                                setIsValidacionModalOpen(true);
                              }}
                              title="Marcar como entregado"
                              className="bg-teal-600 hover:bg-teal-700 text-white"
                            >
                              <Handshake className="h-4 w-4" />
                              Marcar Entregado
                            </Button>
                          )}

                          {/* Ver Documento (reporte + certificado combinados en un solo PDF) */}
                          {req.certificados && req.certificados.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleVerCertificado(
                                  req.certificados![0].id,
                                  'certificado',
                                )
                              }
                              title="Ver documento"
                            >
                              <Eye className="h-4 w-4" />
                              Ver Documento
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <EmptyState
                  hasFilter={busqueda.trim().length > 0 || !!laboratorioFiltro}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modals */}
      {/* ------------------------------------------------------------------ */}
      <NuevoRegistroModal
        open={isRegistroModalOpen}
        onClose={() => setIsRegistroModalOpen(false)}
      />

      <EditarOrdenModal
        orden={editarOrden}
        onClose={() => setEditarOrden(null)}
      />

      {detalleEquipo && (
        <VistaDetalleEquipo
          orden={detalleEquipo.orden}
          equipoId={detalleEquipo.equipoId}
          onClose={() => setDetalleEquipo(null)}
        />
      )}

      <AsignarTecnicoModal
        open={asignacionTecnico !== null}
        recepcionId={asignacionTecnico?.equipoId ?? null}
        laboratorioId={asignacionTecnico?.laboratorioId ?? null}
        onClose={() => setAsignacionTecnico(null)}
      />

      <SubirCertificadoModal
        isOpen={isCertificadoModalOpen}
        onClose={() => {
          setIsCertificadoModalOpen(false);
          setSelectedCertificadoRecepcion(null);
        }}
        recepcionId={selectedCertificadoRecepcion?.id ?? null}
        laboratorioId={selectedCertificadoRecepcion?.laboratorioId ?? null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
        }}
      />

      <ValidacionCertificadoModal
        isOpen={isValidacionModalOpen}
        onClose={() => {
          setIsValidacionModalOpen(false);
          setSelectedValidacionRecepcion(null);
        }}
        recepcionId={selectedValidacionRecepcion?.id ?? null}
        estadoActual={selectedValidacionRecepcion?.estado ?? ''}
        tituloAccion={selectedValidacionRecepcion?.titulo ?? ''}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
        }}
      />

      <FirmarDigitalModal
        isOpen={isFirmaModalOpen}
        onClose={() => {
          setIsFirmaModalOpen(false);
          setSelectedFirma(null);
        }}
        recepcionId={selectedFirma?.recepcionId ?? null}
        certificadoId={selectedFirma?.certificadoId ?? null}
        tipoDocumento={selectedFirma?.tipoDocumento ?? 'reporte'}
        tituloAccion={selectedFirma?.titulo ?? ''}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
        }}
      />

      <CambiarFaseModal
        isOpen={cambiarFase !== null}
        onClose={() => setCambiarFase(null)}
        recepcionId={cambiarFase?.id ?? null}
        equipoDescripcion={cambiarFase?.equipoDescripcion ?? ''}
        estadoActual={cambiarFase?.estado ?? ''}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table-header helper
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

// Cabecera ordenable: clic sobre el label alterna la dirección, y la flecha
// muestra el orden vigente (↕ fija en gris cuando la columna no está activa).
function SortableTH({
  campo,
  ordenPor,
  direccion,
  onSort,
  className,
  children,
}: {
  campo: 'fecha' | 'estado';
  ordenPor: 'fecha' | 'estado';
  direccion: 'asc' | 'desc';
  onSort: (campo: 'fecha' | 'estado') => void;
  className?: string;
  children: React.ReactNode;
}) {
  const activo = ordenPor === campo;
  const Icono = activo && direccion === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider',
        activo ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(campo)}
        className={cn(
          'inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none',
          className?.includes('text-center') ? 'justify-center' : '',
        )}
      >
        {children}
        <Icono className={cn('h-3.5 w-3.5', activo ? '' : 'opacity-30')} />
      </button>
    </th>
  );
}
