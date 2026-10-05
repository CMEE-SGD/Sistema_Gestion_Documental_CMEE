// Egresos — compras/proveedores del módulo financiero. La información se
// alimenta importando el Excel que emite el sistema tributario (SIAT): el
// sistema extrae cada fila (fecha, documento, proveedor, montos, estado…)
// sin digitación manual.

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Loader2,
  Search,
  Trash2,
  TrendingDown,
  UploadCloud,
  X,
} from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { esUsuarioAdministrador, tienePermiso } from '../../../shared/utils/auth';
import { fmtFecha, fmtMoneda, inputCls, labelCls } from './financieroUtils';

interface Egreso {
  id: number;
  fecha: string;
  tipo_documento: string;
  numero_documento: string;
  numero_documento_relacionado: string | null;
  autorizacion: string | null;
  proveedor: string;
  identificacion: string | null;
  referencia: string | null;
  subtotal_iva: string;
  subtotal_cero: string;
  iva: string;
  ice: string;
  total: string;
  saldo: string;
  retenciones: string;
  estado: string;
  dias_vencimiento: number | null;
  fecha_vencimiento: string | null;
  forma_pago: string | null;
  tipo_emision: string | null;
  descripcion: string | null;
}

interface ResultadoImportacion {
  filas_leidas: number;
  importados: number;
  omitidos: number;
  total: number;
}

const ESTADO_STYLE: Record<string, string> = {
  Pagado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Pendiente: 'bg-amber-100 text-amber-800 border-amber-300',
};

export default function EgresosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [modalImportar, setModalImportar] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const esAdmin = esUsuarioAdministrador();
  const puedeImportar =
    esAdmin || tienePermiso('Gestion Financiera', 4);
  const puedeEliminar =
    esAdmin || tienePermiso('Gestion Financiera', 5);

  const { data: egresos = [], isLoading } = useQuery<Egreso[]>({
    queryKey: ['egresos'],
    queryFn: async () => {
      const res = await api.get('/egresos');
      return res.data;
    },
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return egresos;
    return egresos.filter(
      (e) =>
        e.numero_documento.toLowerCase().includes(q) ||
        e.proveedor.toLowerCase().includes(q) ||
        (e.estado ?? '').toLowerCase().includes(q) ||
        (e.descripcion ?? '').toLowerCase().includes(q),
    );
  }, [egresos, busqueda]);

  const totales = useMemo(() => {
    let total = 0;
    let pendiente = 0;
    for (const e of egresos) {
      const t = Number(e.total) || 0;
      total += t;
      if (e.estado === 'Pendiente' || Number(e.saldo) > 0) {
        pendiente += Number(e.saldo) || 0;
      }
    }
    return { total, pendiente };
  }, [egresos]);

  const eliminarMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/egresos/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({ message: 'Egreso eliminado.' });
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message || 'No se pudo eliminar el egreso.',
      });
    },
  });

  const vaciarMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/egresos');
      return res.data;
    },
    onSuccess: (res: { eliminados: number }) => {
      toast({
        message: `${res.eliminados} egresos eliminados.`,
      });
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message || 'No se pudieron eliminar los egresos.',
      });
    },
  });

  const handleEliminar = async (e: Egreso) => {
    const ok = await confirm({
      title: 'Eliminar egreso',
      message: `¿Eliminar el egreso ${e.numero_documento} de ${e.proveedor}?`,
    });
    if (ok) eliminarMutation.mutate(e.id);
  };

  const handleVaciar = async () => {
    if (egresos.length === 0) return;
    const ok = await confirm({
      title: 'Vaciar egresos',
      message: `¿Eliminar los ${egresos.length} egresos registrados? Esta acción no se puede deshacer.`,
    });
    if (ok) vaciarMutation.mutate();
  };

  const egresoDetalle =
    detalleId !== null ? egresos.find((e) => e.id === detalleId) ?? null : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Egresos</h1>
          <p className="text-sm text-muted-foreground">
            Compras y gastos a proveedores, extraídos de la planilla Excel del
            sistema tributario.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar por documento, proveedor…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          {puedeImportar && (
            <button
              type="button"
              onClick={() => setModalImportar(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <UploadCloud className="h-4 w-4" /> Importar Excel
            </button>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Egresos registrados
          </p>
          <p className="text-2xl font-bold">{egresos.length}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Total egresos
          </p>
          <p className="text-2xl font-bold">{fmtMoneda(totales.total)}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Pendiente de pago
          </p>
          <p className="text-2xl font-bold text-amber-600">
            {fmtMoneda(totales.pendiente)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-3 py-2 text-left font-semibold">Fecha</th>
              <th className="px-3 py-2 text-left font-semibold"># Documento</th>
              <th className="px-3 py-2 text-left font-semibold">Proveedor</th>
              <th className="px-3 py-2 text-left font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-right font-semibold">Total</th>
              <th className="px-3 py-2 text-right font-semibold">Saldo</th>
              <th className="px-3 py-2 text-left font-semibold">Descripción</th>
              {puedeEliminar && (
                <th className="px-3 py-2 text-left font-semibold">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((e) => (
              <tr
                key={e.id}
                onClick={() => setDetalleId(e.id)}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setDetalleId(e.id);
                  }
                }}
                tabIndex={0}
                title="Ver detalle del egreso"
                className="cursor-pointer border-b border-slate-200 even:bg-slate-50 hover:bg-slate-100 focus:outline-none focus-visible:bg-slate-100"
              >
                <td className="px-3 py-2 whitespace-nowrap">{fmtFecha(e.fecha)}</td>
                <td className="px-3 py-2 font-mono text-xs font-semibold">
                  {e.numero_documento}
                </td>
                <td className="px-3 py-2 max-w-[240px] truncate" title={e.proveedor}>
                  {e.proveedor}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{e.tipo_documento}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${
                      ESTADO_STYLE[e.estado] ??
                      'border-slate-300 bg-slate-100 text-slate-700'
                    }`}
                  >
                    {e.estado}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {fmtMoneda(e.total)}
                </td>
                <td className="px-3 py-2 text-right">
                  {Number(e.saldo) > 0 ? (
                    <span className="font-semibold text-amber-600">
                      {fmtMoneda(e.saldo)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 max-w-[260px] truncate" title={e.descripcion ?? ''}>
                  {e.descripcion || '—'}
                </td>
                {puedeEliminar && (
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleEliminar(e);
                      }}
                      title="Eliminar egreso"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td
                  colSpan={puedeEliminar ? 9 : 8}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Cargando egresos…
                </td>
              </tr>
            )}
            {!isLoading && filtrados.length === 0 && (
              <tr>
                <td
                  colSpan={puedeEliminar ? 9 : 8}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  <TrendingDown className="mx-auto mb-2 h-8 w-8" />
                  {busqueda.trim()
                    ? 'No hay egresos que coincidan con la búsqueda.'
                    : 'Aún no hay egresos registrados. Importe el Excel para extraerlos.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {puedeEliminar && egresos.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleVaciar}
            disabled={vaciarMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> Vaciar egresos
          </button>
        </div>
      )}

      {modalImportar && (
        <ModalImportarExcel onClose={() => setModalImportar(false)} />
      )}

      {egresoDetalle && (
        <ModalDetalleEgreso
          egreso={egresoDetalle}
          onClose={() => setDetalleId(null)}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Importación del Excel de egresos
// ===========================================================================

function ModalImportarExcel({ onClose }: { onClose: () => void }) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  const importar = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<ResultadoImportacion>('/egresos/importar', fd);
      return res.data;
    },
    onSuccess: (r) => {
      const importados = r.importados ?? 0;
      const omitidos = r.omitidos ?? 0;
      if (importados > 0) {
        toast({
          message: `Se importaron ${importados} egresos por USD ${
            Number(r.total)?.toLocaleString('es-BO', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) ?? '0,00'
          }.${omitidos > 0 ? ` ${omitidos} filas omitidas.` : ''}`,
        });
      } else {
        toast({
          message:
            omitidos > 0
              ? 'No se importaron egresos nuevos: las filas ya estaban registradas.'
              : 'El archivo no contenía filas de egresos.',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
      onClose();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo importar el Excel de egresos.',
      });
    },
  });

  const invalido = !archivo;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-10">
      <div className="w-[95vw] max-w-lg rounded-xl border border-border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <UploadCloud className="h-4 w-4" /> Importar Excel de egresos
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm text-muted-foreground">
            Suba el Excel exportado del sistema tributario (SIAT). El sistema
            detecta automáticamente la fila de encabezados y extrae fecha,
            documento, proveedor, identificación, subtotales, IVA, total,
            saldo, estado y descripción de cada compra. Los documentos ya
            registrados se omiten.
          </p>
          <div>
            <label className={labelCls}>Archivo Excel (.xls o .xlsx) *</label>
            <input
              type="file"
              accept=".xls,.xlsx"
              className={`${inputCls} file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-slate-600 hover:file:bg-slate-200`}
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
            {archivo && (
              <p className="mt-1 text-xs text-muted-foreground">{archivo.name}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={invalido || importar.isPending}
              onClick={() => archivo && importar.mutate(archivo)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Importar y extraer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Detalle (solo lectura) de un egreso
// ===========================================================================

function ModalDetalleEgreso({
  egreso,
  onClose,
}: {
  egreso: Egreso;
  onClose: () => void;
}) {
  const o = egreso;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-10">
      <div className="w-[95vw] max-w-2xl rounded-xl border border-border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4" /> Detalle de egreso
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-lg font-bold text-primary">
              {o.numero_documento}
            </span>
            <span
              className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${
                ESTADO_STYLE[o.estado] ??
                'border-slate-300 bg-slate-100 text-slate-700'
              }`}
            >
              {o.estado}
            </span>
          </div>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className={labelCls}>Fecha</dt>
              <dd className="font-semibold">{fmtFecha(o.fecha)}</dd>
            </div>
            <div>
              <dt className={labelCls}>Tipo de documento</dt>
              <dd className="font-semibold">{o.tipo_documento}</dd>
            </div>
            <div>
              <dt className={labelCls}>Proveedor</dt>
              <dd className="font-semibold">{o.proveedor}</dd>
            </div>
            <div>
              <dt className={labelCls}>Identificación</dt>
              <dd>{o.identificacion || '—'}</dd>
            </div>
            <div>
              <dt className={labelCls}>Autorización</dt>
              <dd className="break-all">{o.autorizacion || '—'}</dd>
            </div>
            <div>
              <dt className={labelCls}>Documento relacionado</dt>
              <dd>{o.numero_documento_relacionado || '—'}</dd>
            </div>
            <div>
              <dt className={labelCls}>Referencia</dt>
              <dd>{o.referencia || '—'}</dd>
            </div>
            <div>
              <dt className={labelCls}>Forma de pago</dt>
              <dd>{o.forma_pago || '—'}</dd>
            </div>
            <div>
              <dt className={labelCls}>Subtotal IVA &gt; 0%</dt>
              <dd className="text-right">{fmtMoneda(o.subtotal_iva)}</dd>
            </div>
            <div>
              <dt className={labelCls}>Subtotal IVA 0%</dt>
              <dd className="text-right">{fmtMoneda(o.subtotal_cero)}</dd>
            </div>
            <div>
              <dt className={labelCls}>IVA</dt>
              <dd className="text-right">{fmtMoneda(o.iva)}</dd>
            </div>
            <div>
              <dt className={labelCls}>ICE</dt>
              <dd className="text-right">{fmtMoneda(o.ice)}</dd>
            </div>
            <div>
              <dt className={labelCls}>Total</dt>
              <dd className="text-right font-bold">{fmtMoneda(o.total)}</dd>
            </div>
            <div>
              <dt className={labelCls}>Saldo</dt>
              <dd
                className={`text-right ${Number(o.saldo) > 0 ? 'font-semibold text-amber-600' : ''}`}
              >
                {fmtMoneda(o.saldo)}
              </dd>
            </div>
            <div>
              <dt className={labelCls}>Retenciones</dt>
              <dd className="text-right">{fmtMoneda(o.retenciones)}</dd>
            </div>
            <div>
              <dt className={labelCls}>Días de vencimiento</dt>
              <dd className="text-right">
                {o.dias_vencimiento !== null && o.dias_vencimiento !== undefined
                  ? o.dias_vencimiento
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className={labelCls}>Fecha de vencimiento</dt>
              <dd>{fmtFecha(o.fecha_vencimiento)}</dd>
            </div>
            <div>
              <dt className={labelCls}>Tipo de emisión</dt>
              <dd>{o.tipo_emision || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={labelCls}>Descripción</dt>
              <dd className="whitespace-pre-wrap">{o.descripcion || '—'}</dd>
            </div>
          </dl>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}