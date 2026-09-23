// Facturación — Fase B/C del flujograma.
// - La encargada del sistema financiero emite la factura en su sistema y aquí
//   se IMPORTAN los datos desde el XML (subtotal/IVA/total, detalle, RUC).
// - También hay alta manual.
// - Cobros: pagos (efectivo/transferencia/cheque) y compensación (entrega de
//   equipos). Nota de entrega vinculada a la factura.

import { type ReactNode, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Eye,
  FileDown,
  Loader2,
  Plus,
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

interface ClienteOption {
  id: number;
  nombre: string;
  ruc?: string | null;
}

interface FacturaResumen {
  id: number;
  numero: string;
  clave_acceso: string | null;
  ruta_xml: string | null;
  nombre_original_xml: string | null;
  cliente_id: number;
  cliente: ClienteOption;
  razon_social_cliente: string | null;
  ruc_cliente: string | null;
  fecha_emision: string;
  fecha_vencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
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
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const esAdmin = esUsuarioAdministrador();

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
      if (detalleId) setDetalleId(null);
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
              <th className="px-3 py-2 text-left font-semibold">Estado</th>
              <th className="px-3 py-2 text-left font-semibold">Origen</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((f) => (
              <tr key={f.id} className="border-b border-slate-200 even:bg-slate-50">
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
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDetalleId(f.id)}
                      title="Ver detalle y cobros"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-muted-foreground hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> Detalle
                    </button>
                    {esAdmin && (
                      <button
                        type="button"
                        onClick={async () => {
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
                <td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">
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
          onClose={() => setTipoModal(null)}
          onImportado={() => {
            setTipoModal(null);
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
          }}
        />
      )}
      {tipoModal === 'manual' && (
        <ModalFacturaManual
          clientes={clientes}
          onClose={() => setTipoModal(null)}
          onCreada={() => {
            setTipoModal(null);
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
          }}
        />
      )}
      {detalleId !== null && (
        <ModalDetalleFactura
          facturaId={detalleId}
          onClose={() => setDetalleId(null)}
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
  onClose,
  onImportado,
}: {
  clientes: ClienteOption[];
  onClose: () => void;
  onImportado: () => void;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [clienteId, setClienteId] = useState<number | ''>('');
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
          cliente, fechas, subtotal, IVA, total y el detalle de ítems.
        </p>
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
  onClose,
  onCreada,
}: {
  clientes: ClienteOption[];
  onClose: () => void;
  onCreada: () => void;
}) {
  const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [plazo, setPlazo] = useState(30);
  const [iva, setIva] = useState('');
  const [notas, setNotas] = useState('');
  const [filas, setFilas] = useState<FilaDetalle[]>([
    { concepto: '', cantidad: 1, precio: 0 },
  ]);
  const { toast } = useToast();
  const { alert } = useAlert();
  const queryClient = useQueryClient();

  const subtotal = filas.reduce((s, f) => s + f.cantidad * f.precio, 0);
  const ivaN = iva === '' ? 0 : Number(iva);
  const total = subtotal + (Number.isNaN(ivaN) ? 0 : ivaN);

  const actualizarFila = (i: number, campo: keyof FilaDetalle, valor: string | number) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  };

  const crear = useMutation({
    mutationFn: async () => {
      const res = await api.post('/facturacion/facturas', {
        numero: numero.trim() || undefined,
        cliente_id: Number(clienteId),
        fecha_emision: fecha,
        plazo_dias: plazo,
        subtotal,
        iva: Number.isNaN(ivaN) ? 0 : ivaN,
        total,
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

// ===========================================================================
// Detalle de factura: cobros (pagos + compensación), nota de entrega, estado
// ===========================================================================

interface EquipoRef {
  id: number;
  equipo_descripcion: string;
  codigo_serie: string | null;
}

interface DetalleItem {
  id: number;
  concepto: string;
  cantidad: number;
  precio_unitario: number;
  valor_total: number;
  equipo_recepcion: EquipoRef | null;
}

interface PersonaResumen {
  id: number;
  nombre: string;
  apellidos: string;
}

interface PagoDetalle {
  id: number;
  monto: number;
  fecha: string;
  metodo: string;
  referencia: string | null;
  observaciones: string | null;
  ruta_comprobante: string | null;
  registrado_por: PersonaResumen | null;
  compensacion: { id: number } | null;
}

interface NotaEntregaDetalle {
  id: number;
  numero: string;
  fecha: string;
  recibido_por: string | null;
  fecha_entrega: string | null;
  observaciones: string | null;
  entregado_por: PersonaResumen | null;
}

interface CompensacionDetalle {
  id: number;
  descripcion_equipo: string | null;
  autorizacion_previa: boolean;
  ruta_factura_compra: string | null;
  ruta_acta: string | null;
  descuento_autorizado: number | null;
  observaciones: string | null;
}

interface FacturaDetalle extends FacturaResumen {
  detalle: DetalleItem[];
  pagos: PagoDetalle[];
  notas_entrega: NotaEntregaDetalle[];
  compensaciones: CompensacionDetalle[];
}

function ModalDetalleFactura({
  facturaId,
  onClose,
}: {
  facturaId: number;
  onClose: () => void;
}) {
  const { data: factura, isLoading } = useQuery<FacturaDetalle>({
    queryKey: ['factura', facturaId],
    queryFn: async () => {
      const res = await api.get(`/facturacion/facturas/${facturaId}`);
      return res.data;
    },
  });
  const { toast } = useToast();
  const { alert, confirm } = useAlert();
  const queryClient = useQueryClient();
  const esAdmin = esUsuarioAdministrador();

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ['factura', facturaId] });
    queryClient.invalidateQueries({ queryKey: ['facturas'] });
    queryClient.invalidateQueries({ queryKey: ['cartera'] });
  };

  const cambiarEstado = useMutation({
    mutationFn: async (estado: string) => {
      const res = await api.patch(`/facturacion/facturas/${facturaId}`, {
        estado,
      });
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Estado de la factura actualizado.' });
      refrescar();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo actualizar el estado de la factura.',
      });
    },
  });

  if (isLoading || !factura) {
    return (
      <ModalShell titulo="Detalle de factura" onClose={onClose}>
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando factura…
        </div>
      </ModalShell>
    );
  }

  const apiBase = import.meta.env.VITE_API_URL as string | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8">
      <div className="w-[95vw] max-w-4xl rounded-xl border border-border bg-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            Factura {factura.numero}
            <span className={badgeClass(ESTADO_FACTURA_STYLE[factura.estado])}>
              {ESTADO_FACTURA_LABEL[factura.estado] || factura.estado}
            </span>
            {factura.estado_cartera === 'VENCIDA' && (
              <span className={badgeClass('border-red-300 bg-red-100 text-red-700')}>
                {factura.dias_vencida} día(s) vencida
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {factura.ruta_xml && (
              <a
                href={`${apiBase ?? ''}${factura.ruta_xml}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              >
                <FileDown className="h-3.5 w-3.5" /> Ver XML
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-5">
          {/* Datos de cabecera */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
            <InfoCampo label="Cliente" valor={factura.cliente?.nombre || '—'} />
            <InfoCampo
              label="RUC comprador (XML)"
              valor={factura.ruc_cliente || factura.cliente?.ruc || '—'}
            />
            <InfoCampo
              label="Razón social (XML)"
              valor={factura.razon_social_cliente || '—'}
            />
            <InfoCampo label="Emisión" valor={fmtFecha(factura.fecha_emision)} />
            <InfoCampo
              label="Vencimiento"
              valor={fmtFecha(factura.fecha_vencimiento)}
            />
            <InfoCampo label="Plazo" valor={`${factura.plazo_dias} días`} />
            <InfoCampo label="Subtotal" valor={fmtMoneda(factura.subtotal)} />
            <InfoCampo label="IVA" valor={fmtMoneda(factura.iva)} />
            <InfoCampo label="Total" valor={fmtMoneda(factura.total)} />
            <InfoCampo label="Pagado" valor={fmtMoneda(factura.pagado)} />
            <InfoCampo
              label="Saldo"
              valor={fmtMoneda(factura.saldo)}
              resaltado={factura.saldo > 0.005}
            />
            {factura.clave_acceso && (
              <div>
                <span className={labelCls}>Clave de acceso</span>
                <p className="break-all font-mono text-xs">{factura.clave_acceso}</p>
              </div>
            )}
          </div>

          {/* Ítems */}
          <Seccion titulo="Detalle de ítems">
            <div className="overflow-x-auto rounded-md border border-slate-300">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="px-3 py-1.5 text-left font-semibold">Concepto</th>
                    <th className="px-3 py-1.5 text-right font-semibold">Cant.</th>
                    <th className="px-3 py-1.5 text-right font-semibold">P. unitario</th>
                    <th className="px-3 py-1.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {factura.detalle.map((d) => (
                    <tr key={d.id} className="border-t border-slate-200">
                      <td className="px-3 py-2">
                        {d.concepto}
                        {d.equipo_recepcion && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (equipo: {d.equipo_recepcion.equipo_descripcion})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">{d.cantidad}</td>
                      <td className="px-3 py-2 text-right">
                        {fmtMoneda(d.precio_unitario)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {fmtMoneda(d.valor_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Seccion>

          {/* Cobros */}
          <Seccion titulo="Cobros">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">
                  Pagos registrados
                </h4>
                <ul className="space-y-2">
                  {factura.pagos.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{fmtMoneda(p.monto)}</span>
                        <span className="text-xs text-muted-foreground">
                          {fmtFecha(p.fecha)} ·{' '}
                          {METODO_PAGO_LABEL[p.metodo] || p.metodo}
                        </span>
                      </div>
                      {(p.referencia || p.observaciones) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {p.referencia}
                          {p.referencia && p.observaciones ? ' — ' : ''}
                          {p.observaciones}
                        </p>
                      )}
                      {p.registrado_por && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Registrado por: {p.registrado_por.nombre}{' '}
                          {p.registrado_por.apellidos}
                        </p>
                      )}
                      {p.ruta_comprobante && (
                        <a
                          href={`${apiBase ?? ''}${p.ruta_comprobante}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-sky-700 underline"
                        >
                          <FileDown className="h-3 w-3" /> Comprobante
                        </a>
                      )}
                    </li>
                  ))}
                  {factura.pagos.length === 0 && (
                    <li className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-center text-xs text-muted-foreground">
                      Sin pagos registrados todavía.
                    </li>
                  )}
                </ul>

                {factura.estado !== 'ANULADA' && factura.saldo > 0.005 && (
                  <FormPago
                    facturaId={factura.id}
                    saldo={factura.saldo}
                    onCreado={refrescar}
                  />
                )}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">
                  Compensación (pago con entrega de equipos)
                </h4>
                <ul className="space-y-2">
                  {factura.compensaciones.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <p className="font-semibold">
                        {c.descripcion_equipo || 'Entrega de equipos'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Autorización previa:{' '}
                        {c.autorizacion_previa ? 'sí' : 'no'} · Valor acordado:{' '}
                        {c.descuento_autorizado
                          ? fmtMoneda(c.descuento_autorizado)
                          : '—'}
                      </p>
                      {(c.ruta_acta || c.ruta_factura_compra) && (
                        <div className="mt-1 flex gap-3 text-xs">
                          {c.ruta_acta && (
                            <a
                              href={`${apiBase ?? ''}${c.ruta_acta}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-sky-700 underline"
                            >
                              Acta de compensación
                            </a>
                          )}
                          {c.ruta_factura_compra && (
                            <a
                              href={`${apiBase ?? ''}${c.ruta_factura_compra}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-sky-700 underline"
                            >
                              Factura de compra
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                  {factura.compensaciones.length === 0 && (
                    <li className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-center text-xs text-muted-foreground">
                      Sin compensaciones registradas.
                    </li>
                  )}
                </ul>

                {factura.estado !== 'ANULADA' && factura.saldo > 0.005 && (
                  <FormCompensacion
                    facturaId={factura.id}
                    saldo={factura.saldo}
                    onCreada={refrescar}
                  />
                )}
              </div>
            </div>
          </Seccion>

          {/* Nota de entrega */}
          <Seccion titulo="Nota de entrega">
            <ul className="space-y-2">
              {factura.notas_entrega.map((n) => (
                <li
                  key={n.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold">{n.numero}</span>
                    <span className="text-xs text-muted-foreground">
                      {fmtFecha(n.fecha_entrega || n.fecha)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recibido por: {n.recibido_por || '—'}
                    {n.entregado_por
                      ? ` · Entregó: ${n.entregado_por.nombre} ${n.entregado_por.apellidos}`
                      : ''}
                  </p>
                  {n.observaciones && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.observaciones}
                    </p>
                  )}
                </li>
              ))}
              {factura.notas_entrega.length === 0 && (
                <li className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-center text-xs text-muted-foreground">
                  Sin nota de entrega registrada.
                </li>
              )}
            </ul>
            <FormNotaEntrega facturaId={factura.id} onCreada={refrescar} />
          </Seccion>

          {/* Estado / acciones */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-300 p-4">
            <div className="flex items-center gap-3">
              <span className={labelCls}>Cambiar estado</span>
              <select
                value={factura.estado}
                onChange={(e) => cambiarEstado.mutate(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none"
              >
                <option value="EMITIDA">Emitida</option>
                <option value="PARCIAL">Pago parcial</option>
                <option value="PAGADA">Cobrada</option>
                <option value="ANULADA">Anulada</option>
              </select>
              <span className="text-xs text-muted-foreground">
                PARCIAL / PAGADA se recalculan solos al registrar cobros.
              </span>
            </div>
            {esAdmin && (
              <button
                type="button"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar factura',
                    message: `¿Eliminar la factura ${factura.numero}? Se eliminarán sus pagos, notas de entrega y compensaciones.`,
                  });
                  if (ok) {
                    await api.delete(`/facturacion/facturas/${factura.id}`);
                    toast({ message: 'Factura eliminada.' });
                    refrescar();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" /> Eliminar factura
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCampo({
  label,
  valor,
  resaltado,
}: {
  label: string;
  valor: string;
  resaltado?: boolean;
}) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <p className={`mt-0.5 font-medium ${resaltado ? 'text-red-700' : ''}`}>
        {valor}
      </p>
    </div>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-500">
        {titulo}
      </h3>
      {children}
    </div>
  );
}

// --- Formularios -----------------------------------------------------------

function FormPago({
  facturaId,
  saldo,
  onCreado,
}: {
  facturaId: number;
  saldo: number;
  onCreado: () => void;
}) {
  const [monto, setMonto] = useState(''); // '0' no: vacío
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [metodo, setMetodo] = useState('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const { toast } = useToast();
  const { alert } = useAlert();
  const queryClient = useQueryClient();

  const registrar = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('monto', String(Number(monto)));
      fd.append('fecha', fecha);
      fd.append('metodo', metodo);
      fd.append('referencia', referencia.trim());
      fd.append('observaciones', observaciones.trim());
      if (comprobante) fd.append('comprobante', comprobante);
      const res = await api.post(`/facturacion/facturas/${facturaId}/pagos`, fd);
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Pago registrado correctamente.' });
      setMonto('');
      setReferencia('');
      setObservaciones('');
      setComprobante(null);
      queryClient.invalidateQueries({ queryKey: ['factura', facturaId] });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['cartera'] });
      onCreado();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message: apiErr?.response?.data?.message || 'No se pudo registrar el pago.',
      });
    },
  });

  const montoN = monto === '' ? NaN : Number(monto);
  const invalido = Number.isNaN(montoN) || montoN <= 0 || montoN > saldo + 0.005;

  return (
    <form
      className="mt-3 rounded-md border border-dashed border-slate-300 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        registrar.mutate();
      }}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Registrar pago (saldo: {fmtMoneda(saldo)})
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Monto *</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Fecha</label>
          <input
            type="date"
            className={inputCls}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Forma *</label>
          <select
            className={inputCls}
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CHEQUE">Cheque</option>
            <option value="COMPENSACION">Entrega de equipos</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Referencia (Nº comprobante/transferencia)</label>
          <input
            className={inputCls}
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Comprobante (PDF)</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
            className={`${inputCls} file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs`}
          />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Observaciones</label>
          <input
            className={inputCls}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={invalido || registrar.isPending}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {registrar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Registrar pago
      </button>
      {!Number.isNaN(montoN) && montoN > saldo + 0.005 && (
        <p className="mt-1 text-xs text-red-600">
          El monto excede el saldo pendiente ({fmtMoneda(saldo)}).
        </p>
      )}
    </form>
  );
}

function FormCompensacion({
  facturaId,
  saldo,
  onCreada,
}: {
  facturaId: number;
  saldo: number;
  onCreada: () => void;
}) {
  const [descripcion, setDescripcion] = useState('');
  const [autorizacion, setAutorizacion] = useState(false);
  const [descuento, setDescuento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [facturaCompra, setFacturaCompra] = useState<File | null>(null);
  const [acta, setActa] = useState<File | null>(null);
  const { toast } = useToast();
  const { alert } = useAlert();
  const queryClient = useQueryClient();

  const registrar = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('descripcion_equipo', descripcion.trim());
      fd.append('autorizacion_previa', String(autorizacion));
      fd.append('observaciones', observaciones.trim());
      if (descuento !== '') fd.append('descuento_autorizado', descuento);
      if (facturaCompra) fd.append('factura_compra', facturaCompra);
      if (acta) fd.append('acta', acta);
      const res = await api.post(
        `/facturacion/facturas/${facturaId}/compensacion`,
        fd,
      );
      return res.data;
    },
    onSuccess: () => {
      toast({
        message:
          'Compensación registrada: la factura quedó abonada por entrega de equipos.',
      });
      setDescripcion('');
      setAutorizacion(false);
      setDescuento('');
      setObservaciones('');
      setFacturaCompra(null);
      setActa(null);
      queryClient.invalidateQueries({ queryKey: ['factura', facturaId] });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['cartera'] });
      onCreada();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo registrar la compensación.',
      });
    },
  });

  const descN = descuento === '' ? undefined : Number(descuento);
  const excede =
    descN !== undefined && !Number.isNaN(descN) && descN > saldo + 0.005;

  return (
    <form
      className="mt-3 rounded-md border border-dashed border-slate-300 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        registrar.mutate();
      }}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Compensar con equipos (saldo: {fmtMoneda(saldo)})
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="col-span-2">
          <label className={labelCls}>Descripción de los equipos entregados</label>
          <input
            className={inputCls}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Valor acordado (Bs)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
          />
          {excede && (
            <p className="mt-1 text-xs text-red-600">
              Excede el saldo pendiente ({fmtMoneda(saldo)}).
            </p>
          )}
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={autorizacion}
              onChange={(e) => setAutorizacion(e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            Autorización previa obtenida
          </label>
        </div>
        <div>
          <label className={labelCls}>Factura de compra (PDF)</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFacturaCompra(e.target.files?.[0] ?? null)}
            className={`${inputCls} file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs`}
          />
        </div>
        <div>
          <label className={labelCls}>Acta de compensación (PDF)</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setActa(e.target.files?.[0] ?? null)}
            className={`${inputCls} file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs`}
          />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Observaciones</label>
          <input
            className={inputCls}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={registrar.isPending || excede}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {registrar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Registrar compensación
      </button>
    </form>
  );
}

function FormNotaEntrega({
  facturaId,
  onCreada,
}: {
  facturaId: number;
  onCreada: () => void;
}) {
  const [recibidoPor, setRecibidoPor] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [observaciones, setObservaciones] = useState('');
  const { toast } = useToast();
  const { alert } = useAlert();
  const queryClient = useQueryClient();

  const registrar = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/facturacion/facturas/${facturaId}/nota-entrega`, {
        recibido_por: recibidoPor.trim() || undefined,
        fecha_entrega: fechaEntrega,
        observaciones: observaciones.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast({ message: 'Nota de entrega registrada.' });
      setRecibidoPor('');
      setObservaciones('');
      queryClient.invalidateQueries({ queryKey: ['factura', facturaId] });
      onCreada();
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { message?: string } } };
      void alert({
        message:
          apiErr?.response?.data?.message ||
          'No se pudo registrar la nota de entrega.',
      });
    },
  });

  return (
    <form
      className="mt-3 grid grid-cols-1 gap-2 rounded-md border border-dashed border-slate-300 p-3 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        registrar.mutate();
      }}
    >
      <div>
        <label className={labelCls}>Recibido por *</label>
        <input
          className={inputCls}
          value={recibidoPor}
          onChange={(e) => setRecibidoPor(e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Fecha de entrega</label>
        <input
          type="date"
          className={inputCls}
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
        />
      </div>
      <div className="sm:col-span-1">
        <label className={labelCls}>Observaciones</label>
        <input
          className={inputCls}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>
      <div className="sm:col-span-3">
        <button
          type="submit"
          disabled={!recibidoPor.trim() || registrar.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registrar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Registrar nota de entrega
        </button>
      </div>
    </form>
  );
}