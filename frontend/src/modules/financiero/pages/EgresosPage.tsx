// Egresos — compras/proveedores del módulo financiero. La información se
// alimenta importando el Excel que emite el sistema tributario (SIAT): el
// sistema extrae cada fila (fecha, documento, proveedor, montos, estado…)
// sin digitación manual. También admite alta manual: viáticos y gastos que
// no aparecen en el Excel. Los viáticos llevan un control de cumplimiento
// (checkbox ¿Cumple?).

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Loader2,
  Plus,
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
  es_viatico: boolean;
  cumple_viatico: boolean | null;
}

interface ResultadoImportacion {
  filas_leidas: number;
  importados: number;
  omitidos: number;
  total: number;
}

type FiltroTipo = 'todos' | 'viaticos';

const ESTADO_STYLE: Record<string, string> = {
  Pagado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Pendiente: 'bg-amber-100 text-amber-800 border-amber-300',
};

const TIPOS_DOCUMENTO = [
  'Factura',
  'Nota de Venta',
  'Liquidación de Compra',
  'Comprobante de Anticipo',
  'Otro',
];

const redondear = (n: number) => Math.round(n * 100) / 100;

export default function EgresosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroTipo>('todos');
  const [modalImportar, setModalImportar] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const esAdmin = esUsuarioAdministrador();
  const puedeEscribir =
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
    return egresos.filter((e) => {
      const porTipo = filtro === 'todos' || e.es_viatico;
      if (!porTipo) return false;
      if (!q) return true;
      return (
        e.numero_documento.toLowerCase().includes(q) ||
        e.proveedor.toLowerCase().includes(q) ||
        (e.estado ?? '').toLowerCase().includes(q) ||
        (e.descripcion ?? '').toLowerCase().includes(q)
      );
    });
  }, [egresos, busqueda, filtro]);

  const cantidadViaticos = useMemo(
    () => egresos.filter((e) => e.es_viatico).length,
    [egresos],
  );

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

  const cumpleMutation = useMutation({
    mutationFn: async ({
      id,
      cumple,
    }: {
      id: number;
      cumple: boolean;
    }) => {
      await api.patch(`/egresos/${id}`, { cumple_viatico: cumple });
      return { id, cumple };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message || 'No se pudo actualizar el viático.',
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
            Compras y gastos a proveedores: extraídos del Excel del sistema
            tributario o registrados manualmente (viáticos incluidos).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar por documento, proveedor…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          {puedeEscribir && (
            <button
              type="button"
              onClick={() => setModalNuevo(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Nuevo egreso
            </button>
          )}
          {puedeEscribir && (
            <button
              type="button"
              onClick={() => setModalImportar(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <UploadCloud className="h-4 w-4" /> Importar Excel
            </button>
          )}
        </div>
      </div>

      {/* Apartados: Todos / Viáticos */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltro('todos')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filtro === 'todos'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setFiltro('viaticos')}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filtro === 'viaticos'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Viáticos
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
              filtro === 'viaticos'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {cantidadViaticos}
          </span>
        </button>
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
              <th className="px-3 py-2 text-left font-semibold">Viático</th>
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
                <td className="px-3 py-2 max-w-[220px] truncate" title={e.proveedor}>
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
                <td className="px-3 py-2">
                  {e.es_viatico ? (
                    <label
                      className="inline-flex items-center gap-1.5 cursor-pointer"
                      onClick={(ev) => ev.stopPropagation()}
                      title={
                        e.cumple_viatico
                          ? 'Viático: cumple'
                          : 'Viático: no cumple'
                      }
                    >
                      <input
                        type="checkbox"
                        checked={!!e.cumple_viatico}
                        disabled={!puedeEscribir || cumpleMutation.isPending}
                        onChange={(ev) =>
                          cumpleMutation.mutate({
                            id: e.id,
                            cumple: ev.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50"
                      />
                      <span className="text-xs font-medium text-slate-600">
                        ¿Cumple?
                      </span>
                    </label>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
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
                <td className="px-3 py-2 max-w-[240px] truncate" title={e.descripcion ?? ''}>
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
                  colSpan={puedeEliminar ? 10 : 9}
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
                  colSpan={puedeEliminar ? 10 : 9}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  <TrendingDown className="mx-auto mb-2 h-8 w-8" />
                  {busqueda.trim() || filtro === 'viaticos'
                    ? 'No hay egresos que coincidan con el filtro.'
                    : 'Aún no hay egresos registrados. Cree uno manualmente o importe el Excel.'}
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

      {modalNuevo && (
        <ModalNuevoEgreso onClose={() => setModalNuevo(false)} />
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
// Alta manual de un egreso (viáticos incluidos)
// ===========================================================================

interface FormEgreso {
  fecha: string;
  tipo_documento: string;
  numero_documento: string;
  autorizacion: string;
  proveedor: string;
  identificacion: string;
  referencia: string;
  subtotal_iva: string;
  iva: string;
  total: string;
  estado: string;
  forma_pago: string;
  descripcion: string;
  es_viatico: boolean;
  cumple_viatico: boolean;
}

const formVacio = (): FormEgreso => ({
  fecha: '',
  tipo_documento: 'Factura',
  numero_documento: '',
  autorizacion: '',
  proveedor: '',
  identificacion: '',
  referencia: '',
  subtotal_iva: '',
  iva: '',
  total: '',
  estado: 'Pagado',
  forma_pago: '',
  descripcion: '',
  es_viatico: false,
  cumple_viatico: false,
});

function ModalNuevoEgreso({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormEgreso>(formVacio);
  const [totalTocado, setTotalTocado] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { alert } = useAlert();

  const set = (campo: keyof FormEgreso, valor: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const totalCalculado = redondear(
    (Number(form.subtotal_iva) || 0) + (Number(form.iva) || 0),
  );

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        fecha: form.fecha,
        tipo_documento: form.tipo_documento,
        numero_documento: form.numero_documento.trim() || 'S/N',
        autorizacion: form.autorizacion.trim() || undefined,
        proveedor: form.proveedor.trim() || '—',
        identificacion: form.identificacion.trim() || undefined,
        referencia: form.referencia.trim() || undefined,
        subtotal_iva: Number(form.subtotal_iva) || 0,
        iva: Number(form.iva) || 0,
        total: totalTocado
          ? Number(form.total) || 0
          : totalCalculado,
        estado: form.estado,
        forma_pago: form.forma_pago.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        es_viatico: form.es_viatico,
        cumple_viatico: form.es_viatico ? form.cumple_viatico : undefined,
      };
      const res = await api.post<Egreso>('/egresos', payload);
      return res.data;
    },
    onSuccess: (r) => {
      toast({
        message: `Egreso ${r.numero_documento} registrado${
          r.es_viatico ? ' (viático)' : ''
        }.`,
      });
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
      onClose();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo registrar el egreso.',
      });
    },
  });

  const camposRequeridos =
    form.fecha && form.tipo_documento && form.proveedor;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-10">
      <div className="w-[95vw] max-w-2xl rounded-xl border border-border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Plus className="h-4 w-4" /> Nuevo egreso
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Tipo de documento *</label>
              <select
                value={form.tipo_documento}
                onChange={(e) => set('tipo_documento', e.target.value)}
                className={inputCls}
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}># Documento</label>
              <input
                value={form.numero_documento}
                onChange={(e) => set('numero_documento', e.target.value)}
                placeholder="Ej. 001-001-000000250"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Proveedor *</label>
              <input
                value={form.proveedor}
                onChange={(e) => set('proveedor', e.target.value)}
                placeholder="Nombre del proveedor"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Identificación</label>
              <input
                value={form.identificacion}
                onChange={(e) => set('identificacion', e.target.value)}
                placeholder="RUC / cédula"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Autorización</label>
              <input
                value={form.autorizacion}
                onChange={(e) => set('autorizacion', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Referencia</label>
              <input
                value={form.referencia}
                onChange={(e) => set('referencia', e.target.value)}
                placeholder="Motivo / concepto del egreso"
                className={inputCls}
              />
            </div>
          </div>

          {/* Montos */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Subtotal sin IVA</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.subtotal_iva}
                onChange={(e) => {
                  set('subtotal_iva', e.target.value);
                  setTotalTocado(false);
                }}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>IVA</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.iva}
                onChange={(e) => {
                  set('iva', e.target.value);
                  setTotalTocado(false);
                }}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Total</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalTocado ? form.total : (totalCalculado || '')}
                onChange={(e) => {
                  set('total', e.target.value);
                  setTotalTocado(true);
                }}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select
                value={form.estado}
                onChange={(e) => set('estado', e.target.value)}
                className={inputCls}
              >
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Forma de pago</label>
              <input
                value={form.forma_pago}
                onChange={(e) => set('forma_pago', e.target.value)}
                placeholder="Efectivo, transferencia…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Apartado viáticos */}
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.es_viatico}
                onChange={(e) => set('es_viatico', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              Es un viático
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Viáticos son gastos que no aparecen en el Excel y se registran a
              mano (movilización, alimentación, hospedaje…).
            </p>
            {form.es_viatico && (
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.cumple_viatico}
                  onChange={(e) => set('cumple_viatico', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                ¿Cumple?
              </label>
            )}
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              rows={2}
              placeholder="Detalle del gasto o viático"
              className={inputCls}
            />
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
              disabled={!camposRequeridos || guardar.isPending}
              onClick={() => guardar.mutate()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar egreso
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
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${
                  ESTADO_STYLE[o.estado] ??
                  'border-slate-300 bg-slate-100 text-slate-700'
                }`}
              >
                {o.estado}
              </span>
              {o.es_viatico && (
                <span className="inline-flex items-center gap-1 rounded border border-violet-300 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                  Viático · ¿Cumple?{' '}
                  {o.cumple_viatico ? (
                    <b className="text-emerald-600">Sí</b>
                  ) : (
                    <b className="text-red-500">No</b>
                  )}
                </span>
              )}
            </div>
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