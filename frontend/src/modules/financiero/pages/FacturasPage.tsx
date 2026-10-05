// Facturación — Fase B/C del flujograma.
// - La encargada del sistema financiero emite la factura en su sistema y aquí
//   se IMPORTAN los datos desde el XML (subtotal/IVA/total, detalle, RUC).
// - También hay alta manual.
// - Cobros: pagos (efectivo/transferencia/cheque) y compensación (entrega de
//   equipos). Nota de entrega vinculada a la factura.

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  Loader2,
  Plus,
  Receipt,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { esUsuarioAdministrador } from '../../../shared/utils/auth';
import {
  badgeClass,
  ESTADO_FACTURA_LABEL,
  ESTADO_FACTURA_STYLE,
  fmtFecha,
  fmtMoneda,
  inputCls,
  labelCls,
  METODO_PAGO_LABEL,
  PLAZOS_CREDITO,
} from './financieroUtils';

export interface ClienteOption {
  id: number;
  nombre: string;
  ruc?: string | null;
}

export interface FacturaResumen {
  id: number;
  numero: string;
  clave_acceso: string | null;
  numero_autorizacion: string | null;
  fecha_autorizacion: string | null;
  ambiente: string | null;
  info_adicional?: Record<string, string> | null;
  ruta_xml: string | null;
  nombre_original_xml: string | null;
  cliente_id: number;
  cliente: ClienteOption;
  /** Orden de trabajo que dio origen a la factura (solo lectura). */
  orden_trabajo?: {
    id: number;
    orden_trabajo_fisica: string;
  } | null;
  razon_social_cliente: string | null;
  ruc_cliente: string | null;
  fecha_emision: string;
  fecha_vencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
  // Retención de IVA (Ecuador): el cliente retiene al pagar; el saldo por
  // cobrar es total − retención_iva − pagos. `retenciones` = detalle del XML.
  retencion_iva: number;
  porcentaje_retencion_iva: number;
  retenciones?: Array<{
    codigo: string;
    codigoPorcentaje: string;
    baseImponible: number;
    porcentajeRetener: number;
    valorRetenido: number;
  }> | null;
  pagado: number;
  saldo: number;
  estado: string;
  estado_cartera: string;
  plazo_dias: number;
  notas: string | null;
  dias_vencida: number;
  dias_restantes: number;
}

export default function FacturasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [tipoModal, setTipoModal] = useState<'xml' | 'manual' | null>(null);
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const esAdmin = esUsuarioAdministrador();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Contexto de vinculación: llega desde "Facturar" en los listados de
  // recepción (orden completa con todos sus equipos FINALIZADO).
  const ordenContext = searchParams.get('orden_id')
    ? Number(searchParams.get('orden_id'))
    : null;
  const clienteContext = searchParams.get('cliente_id')
    ? Number(searchParams.get('cliente_id'))
    : null;

  // Datos de la orden vinculada (número físico, cliente y equipos) para
  // mostrar el contexto y precargar el detalle de la factura manual.
  const { data: ordenContextoData } = useQuery({
    queryKey: ['orden-factura-contexto', ordenContext],
    queryFn: async () => {
      const res = await api.get(`/facturacion/ordenes/${ordenContext}`);
      return res.data as {
        id: number;
        orden_trabajo_fisica: string;
        cliente?: { id: number; nombre: string };
        equipos?: Array<{
          id: number;
          equipo_descripcion: string;
          estado: string;
        }>;
      };
    },
    enabled: ordenContext !== null,
    retry: 1,
  });

  const limpiarContextoOrden = () => {
    setSearchParams({}, { replace: true });
  };

  // La orden vinculada habilita la factura solo si TODOS sus equipos están
  // FINALIZADO (misma condición que valida el backend al crear/importar).
  const contextoOrdenFacturable = useMemo(() => {
    const equipos = ordenContextoData?.equipos ?? [];
    return equipos.length > 0 && equipos.every((e) => e.estado === 'FINALIZADO');
  }, [ordenContextoData]);

  // Al llegar desde "Facturar" en los listados, abrir el modal según el modo
  // elegido (tipo=xml → importar XML; tipo=manual o ausente → alta manual)
  // con el contexto de la orden precargado. Solo si la orden habilita la
  // factura.
  const tipoContexto = searchParams.get('tipo');
  const contextoAutoAbierto = useRef(false);
  useEffect(() => {
    if (
      ordenContext !== null &&
      ordenContextoData &&
      contextoOrdenFacturable &&
      !contextoAutoAbierto.current
    ) {
      contextoAutoAbierto.current = true;
      setTipoModal(tipoContexto === 'xml' ? 'xml' : 'manual');
    }
  }, [ordenContext, ordenContextoData, contextoOrdenFacturable, tipoContexto]);

  const { data: facturas = [], isLoading } = useQuery<FacturaResumen[]>({
    queryKey: ['facturas'],
    queryFn: async () => {
      const res = await api.get('/facturacion/facturas');
      return res.data;
    },
  });

  const { data: clientes = [] } = useQuery<ClienteOption[]>({
    queryKey: ['clientes-opciones'],
    queryFn: async () => {
      const res = await api.get('/clientes-institucionales');
      return res.data;
    },
  });

  const eliminar = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/facturacion/facturas/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({ message: 'Factura eliminada.' });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message: apiErr?.response?.data?.message || 'No se pudo eliminar la factura.',
      });
    },
  });

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return facturas;
    return facturas.filter(
      (f) =>
        f.numero.toLowerCase().includes(q) ||
        (f.cliente?.nombre ?? '').toLowerCase().includes(q) ||
        (f.estado ?? '').toLowerCase().includes(q),
    );
  }, [facturas, busqueda]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando facturas…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Facturación</h1>
          <p className="text-sm text-muted-foreground">
            Facturas emitidas por el sistema financiero (importadas desde el
            XML) o registradas manualmente, con nota de entrega y cobros.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar factura…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          <button
            type="button"
            onClick={() => setTipoModal('xml')}
            className="inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100"
          >
            <UploadCloud className="h-4 w-4" /> Importar XML
          </button>
          <button
            type="button"
            onClick={() => setTipoModal('manual')}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Registrar manual
          </button>
        </div>
      </div>

      {ordenContext !== null && (
        <div
          className={`flex items-start justify-between gap-3 rounded-lg border p-4 ${
            contextoOrdenFacturable
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-amber-300 bg-amber-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                contextoOrdenFacturable
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Receipt className="h-4 w-4" />
            </span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  contextoOrdenFacturable
                    ? 'text-emerald-900'
                    : 'text-amber-900'
                }`}
              >
                {contextoOrdenFacturable
                  ? 'Orden de trabajo lista para facturar'
                  : 'La orden aún no habilita su factura'}
              </p>
              <p
                className={`mt-0.5 text-sm ${
                  contextoOrdenFacturable
                    ? 'text-emerald-800'
                    : 'text-amber-800'
                }`}
              >
                {ordenContextoData
                  ? contextoOrdenFacturable
                    ? `La factura quedará vinculada a la Orden #${ordenContextoData.orden_trabajo_fisica} de ${ordenContextoData.cliente?.nombre ?? 'su cliente'}. Todos sus equipos están en FINALIZADO.`
                    : `La Orden #${ordenContextoData.orden_trabajo_fisica} tiene equipos que aún no están en FINALIZADO. El sistema rechazará la factura hasta completarlos.`
                  : 'Cargando datos de la orden vinculada…'}
              </p>
              {contextoOrdenFacturable && (
                <p className="mt-1 text-xs text-emerald-700">
                  Use "Registrar manual" para precargar el detalle con los
                  equipos de la orden, o "Importar XML" para absorber el
                  comprobante del sistema financiero.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={limpiarContextoOrden}
            title="Quitar contexto de orden"
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
              contextoOrdenFacturable
                ? 'text-emerald-700 hover:bg-emerald-100'
                : 'text-amber-700 hover:bg-amber-100'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-3 py-2 text-left font-semibold">Factura</th>
              <th className="px-3 py-2 text-left font-semibold">Cliente</th>
              <th className="px-3 py-2 text-left font-semibold">Emisión</th>
              <th className="px-3 py-2 text-left font-semibold">Vencimiento</th>
              <th className="px-3 py-2 text-right font-semibold">Total</th>
              <th className="px-3 py-2 text-right font-semibold">Saldo</th>
              <th className="px-3 py-2 text-right font-semibold">Ret. IVA</th>
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Origen</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((f) => (
              <tr
                key={f.id}
                onClick={() => navigate(`/financiero/facturas/${f.id}`)}
                className="cursor-pointer border-b border-slate-200 transition-colors even:bg-slate-50 hover:bg-slate-100"
              >
                <td className="px-3 py-2 font-mono text-xs font-semibold">
                  {f.numero}
                </td>
                <td className="px-3 py-2">{f.cliente?.nombre || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtFecha(f.fecha_emision)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtFecha(f.fecha_vencimiento)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {fmtMoneda(f.total)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-semibold ${
                    f.saldo > 0.005 ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {fmtMoneda(f.saldo)}
                </td>
                <td className="px-3 py-2 text-right">
                  {f.retencion_iva > 0.005 ? (
                    <>
                      <span className="font-semibold text-rose-700">
                        {fmtMoneda(f.retencion_iva)}
                      </span>
                      {f.porcentaje_retencion_iva > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({f.porcentaje_retencion_iva}%)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={badgeClass(ESTADO_FACTURA_STYLE[f.estado])}>
                    {ESTADO_FACTURA_LABEL[f.estado] || f.estado}
                  </span>
                  {f.estado_cartera === 'VENCIDA' && (
                    <span className={`ml-1 ${badgeClass('border-red-300 bg-red-100 text-red-700')}`}>
                      +{f.dias_vencida}d
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {f.ruta_xml ? (
                    <span className={badgeClass('border-emerald-300 bg-emerald-100 text-emerald-800')}>
                      XML
                    </span>
                  ) : (
                    <span className={badgeClass('border-slate-300 bg-slate-100 text-slate-700')}>
                      Manual
                    </span>
                  )}
                  {f.orden_trabajo && (
                    <span
                      className={`ml-1 ${badgeClass('border-sky-300 bg-sky-100 text-sky-800')}`}
                      title={`Vincular a la Orden de Trabajo #${f.orden_trabajo.orden_trabajo_fisica}`}
                    >
                      Orden #{f.orden_trabajo.orden_trabajo_fisica}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/financiero/facturas/${f.id}`);
                      }}
                      title="Ver detalle y cobros"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-muted-foreground hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> Detalle
                    </button>
                    {esAdmin && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const ok = await confirm({
                            title: 'Eliminar factura',
                            message: `¿Eliminar la factura ${f.numero}? Se eliminarán sus pagos, notas de entrega y compensaciones.`,
                          });
                          if (ok) eliminar.mutate(f.id);
                        }}
                        title="Eliminar factura"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                  Sin facturas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tipoModal === 'xml' && (
        <ModalImportarXml
          clientes={clientes}
          clienteInicial={clienteContext ?? ordenContextoData?.cliente?.id ?? undefined}
          ordenId={ordenContext ?? undefined}
          ordenFisica={ordenContextoData?.orden_trabajo_fisica}
          onClose={() => setTipoModal(null)}
          onImportado={() => {
            setTipoModal(null);
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
            limpiarContextoOrden();
          }}
        />
      )}
      {tipoModal === 'manual' && (
        <ModalFacturaManual
          clientes={clientes}
          clienteInicial={clienteContext ?? ordenContextoData?.cliente?.id ?? undefined}
          ordenId={ordenContext ?? undefined}
          ordenFisica={ordenContextoData?.orden_trabajo_fisica}
          equiposIniciales={ordenContextoData?.equipos}
          onClose={() => setTipoModal(null)}
          onCreada={() => {
            setTipoModal(null);
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
            limpiarContextoOrden();
          }}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Importar XML (Fase B)
// ===========================================================================

function ModalImportarXml({
  clientes,
  clienteInicial,
  ordenId,
  ordenFisica,
  onClose,
  onImportado,
}: {
  clientes: ClienteOption[];
  clienteInicial?: number;
  ordenId?: number;
  ordenFisica?: string;
  onClose: () => void;
  onImportado: () => void;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [clienteId, setClienteId] = useState<number | ''>(clienteInicial ?? '');
  const [plazo, setPlazo] = useState(30);
  const { toast } = useToast();
  const { alert } = useAlert();
  const queryClient = useQueryClient();

  const importar = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('file', archivo as File);
      fd.append('cliente_id', String(clienteId));
      fd.append('plazo_dias', String(plazo));
      if (ordenId !== undefined) {
        fd.append('orden_trabajo_id', String(ordenId));
      }
      const res = await api.post('/facturacion/facturas/importar-xml', fd);
      return res.data;
    },
    onSuccess: (factura) => {
      toast({
        message: `Factura ${factura.numero} importada correctamente desde el XML.`,
      });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      onImportado();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo importar el XML de la factura.',
      });
    },
  });

  const invalido = !archivo || clienteId === '';

  return (
    <ModalShell titulo="Importar factura desde XML" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Suba el XML de la factura electrónica generado por el sistema de la
          encargada financiera. El sistema extrae número, clave de acceso,
          cliente, fechas, subtotal, IVA, total, el detalle de ítems y, si el
          XML trae la sección{' '}
          <span className="font-mono">&lt;retenciones&gt;</span>, la
          retención de IVA (se descuenta del saldo por cobrar).
        </p>
        {ordenId !== undefined && (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            La factura quedará vinculada a la Orden #{ordenFisica ?? ordenId}.
          </p>
        )}
        <div>
          <label className={labelCls}>Archivo XML *</label>
          <input
            type="file"
            accept=".xml,text/xml"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className={`${inputCls} file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-medium`}
          />
          {archivo && (
            <p className="mt-1 text-xs text-muted-foreground">
              {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        <div>
          <label className={labelCls}>Cliente (cuenta interna) *</label>
          <select
            className={inputCls}
            value={clienteId}
            onChange={(e) =>
              setClienteId(e.target.value ? Number(e.target.value) : '')
            }
          >
            <option value="">Seleccione un cliente…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Plazo de crédito (días)</label>
          <select
            className={inputCls}
            value={plazo}
            onChange={(e) => setPlazo(Number(e.target.value))}
          >
            {PLAZOS_CREDITO.map((p) => (
              <option key={p} value={p}>
                {p} días
              </option>
            ))}
          </select>
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
            onClick={() => importar.mutate()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Importar y absorber datos
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ===========================================================================
// Alta manual
// ===========================================================================

interface FilaDetalle {
  concepto: string;
  cantidad: number;
  precio: number;
}

function ModalFacturaManual({
  clientes,
  clienteInicial,
  ordenId,
  ordenFisica,
  equiposIniciales,
  onClose,
  onCreada,
}: {
  clientes: ClienteOption[];
  clienteInicial?: number;
  ordenId?: number;
  ordenFisica?: string;
  equiposIniciales?: Array<{ id: number; equipo_descripcion: string }>;
  onClose: () => void;
  onCreada: () => void;
}) {
  const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState<number | ''>(clienteInicial ?? '');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [plazo, setPlazo] = useState(30);
  const [iva, setIva] = useState('');
  const [retPct, setRetPct] = useState('0');
  const [retMonto, setRetMonto] = useState('0');
  const [notas, setNotas] = useState('');
  const [filas, setFilas] = useState<FilaDetalle[]>(() => {
    if (equiposIniciales && equiposIniciales.length > 0) {
      return equiposIniciales.map((eq) => ({
        concepto: eq.equipo_descripcion,
        cantidad: 1,
        precio: 0,
      }));
    }
    return [{ concepto: '', cantidad: 1, precio: 0 }];
  });
  const { toast } = useToast();
  const { alert } = useAlert();
  const queryClient = useQueryClient();

  const subtotal = filas.reduce((s, f) => s + f.cantidad * f.precio, 0);
  const ivaN = iva === '' ? 0 : Number(iva);
  const total = subtotal + (Number.isNaN(ivaN) ? 0 : ivaN);
  // Retención de IVA: se descuenta del saldo por cobrar (el cliente retiene
  // al pagar). Al elegir un % se calcula automáticamente sobre el IVA.
  const retN = retMonto === '' ? 0 : Number(retMonto);
  const retValido = Number.isFinite(retN) && retN >= 0 ? retN : 0;
  const netoPorCobrar = Math.max(0, total - retValido);
  // Retención calculada para el % elegido: % × IVA (referencia al digitar).
  const retAuto =
    Math.round((Number.isNaN(ivaN) ? 0 : ivaN) * (Number(retPct) / 100) * 100) /
    100;

  const aplicarRetPct = (pct: number) => {
    setRetPct(String(pct));
    if (pct > 0) {
      const base = Number.isNaN(ivaN) ? 0 : ivaN;
      setRetMonto(String(Math.round(base * (pct / 100) * 100) / 100));
    } else {
      setRetMonto('0');
    }
  };

  const actualizarFila = (i: number, campo: keyof FilaDetalle, valor: string | number) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  };

  const crear = useMutation({
    mutationFn: async () => {
      const res = await api.post('/facturacion/facturas', {
        numero: numero.trim() || undefined,
        cliente_id: Number(clienteId),
        orden_trabajo_id: ordenId,
        fecha_emision: fecha,
        plazo_dias: plazo,
        subtotal,
        iva: Number.isNaN(ivaN) ? 0 : ivaN,
        total,
        retencion_iva: retValido,
        porcentaje_retencion_iva: Number(retPct) || 0,
        notas: notas.trim() || undefined,
        detalle: filas
          .filter((f) => f.concepto.trim())
          .map((f) => ({
            concepto: f.concepto,
            cantidad: f.cantidad,
            precio_unitario: f.precio,
          })),
      });
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Factura registrada correctamente.' });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      onCreada();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message || 'No se pudo registrar la factura.',
      });
    },
  });

  const invalido = clienteId === '' || filas.every((f) => !f.concepto.trim());

  return (
    <ModalShell titulo="Registrar factura manualmente" onClose={onClose}>
      <div className="space-y-4">
        {ordenId !== undefined && (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            La factura quedará vinculada a la Orden #{ordenFisica ?? ordenId}.
            {equiposIniciales && equiposIniciales.length > 0
              ? ' El detalle se precargó con los equipos de la orden (ajuste precios si corresponde).'
              : ''}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Número (opcional)</label>
            <input
              className={inputCls}
              placeholder="Se genera FAC-2026-NNNN si se omite"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Cliente *</label>
            <select
              className={inputCls}
              value={clienteId}
              onChange={(e) =>
                setClienteId(e.target.value ? Number(e.target.value) : '')
              }
            >
              <option value="">Seleccione un cliente…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fecha de emisión</label>
            <input
              type="date"
              className={inputCls}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Plazo de crédito</label>
            <select
              className={inputCls}
              value={plazo}
              onChange={(e) => setPlazo(Number(e.target.value))}
            >
              {PLAZOS_CREDITO.map((p) => (
                <option key={p} value={p}>
                  {p} días
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detalle */}
        <div>
          <label className={labelCls}>Detalle de ítems *</label>
          <div className="mt-1 overflow-x-auto rounded-md border border-slate-300">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="px-2 py-1.5 text-left font-semibold">Concepto</th>
                  <th className="w-20 px-2 py-1.5 text-right font-semibold">Cant.</th>
                  <th className="w-32 px-2 py-1.5 text-right font-semibold">P. Unitario</th>
                  <th className="w-32 px-2 py-1.5 text-right font-semibold">Total</th>
                  <th className="w-10 px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="px-2 py-1">
                      <input
                        className={`${inputCls} border-transparent focus:border-primary`}
                        placeholder="Concepto del servicio"
                        value={f.concepto}
                        onChange={(e) => actualizarFila(i, 'concepto', e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min={1}
                        className={`${inputCls} border-transparent text-right focus:border-primary`}
                        value={f.cantidad}
                        onChange={(e) =>
                          actualizarFila(i, 'cantidad', Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={`${inputCls} border-transparent text-right focus:border-primary`}
                        value={f.precio}
                        onChange={(e) =>
                          actualizarFila(i, 'precio', Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="px-2 py-1 text-right font-semibold">
                      {fmtMoneda(f.cantidad * f.precio)}
                    </td>
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          setFilas((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() =>
              setFilas((prev) => [...prev, { concepto: '', cantidad: 1, precio: 0 }])
            }
            className="mt-1 inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-muted-foreground hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar ítem
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Subtotal</label>
            <div className="mt-1 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-right font-semibold">
              {fmtMoneda(subtotal)}
            </div>
          </div>
          <div>
            <label className={labelCls}>IVA</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputCls}
              placeholder="0,00"
              value={iva}
              onChange={(e) => setIva(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Total</label>
            <div className="mt-1 rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-right font-bold">
              {fmtMoneda(total)}
            </div>
          </div>
        </div>

        {/* Retención de IVA (Ecuador) */}
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-700">
            Retención de IVA — se descuenta del saldo por cobrar
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>% Retención</label>
              <select
                className={inputCls}
                value={retPct}
                onChange={(e) => aplicarRetPct(Number(e.target.value))}
              >
                <option value="0">Sin retención</option>
                <option value="10">10% (bienes, C.E.)</option>
                <option value="20">20% (servicios, C.E.)</option>
                <option value="30">30% (bienes/servicios)</option>
                <option value="70">70% (servicios/consultoría)</option>
                <option value="100">100% (persona natural)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Monto retenido</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                value={retMonto}
                onChange={(e) => setRetMonto(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Neto por cobrar</label>
              <div className="mt-1 rounded-md border border-emerald-300 bg-white px-2.5 py-1.5 text-right font-bold text-emerald-700">
                {fmtMoneda(netoPorCobrar)}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-rose-600">
            Al elegir un % se calcula automáticamente:{' '}
            {retPct}% × IVA {fmtMoneda(Number.isNaN(ivaN) ? 0 : ivaN)} ={' '}
            {fmtMoneda(retAuto)}. Ajuste el monto si el comprobante difiere.
          </p>
        </div>

        <div>
          <label className={labelCls}>Notas</label>
          <textarea
            className={`${inputCls} min-h-[60px]`}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
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
            disabled={invalido || crear.isPending}
            onClick={() => crear.mutate()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {crear.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar factura
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ===========================================================================
// Shell genérico de modales
// ===========================================================================

function ModalShell({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-10">
      <div className="w-[95vw] max-w-3xl rounded-xl border border-border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-base font-semibold">{titulo}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
