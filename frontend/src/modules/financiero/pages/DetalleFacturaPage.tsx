// Detalle de factura — página completa dentro del módulo financiero
// (/financiero/facturas/:id), abierta en "ventana nueva" desde el listado de
// facturación. Muestra cabecera, ítems, cobros (pagos + compensación), nota de
// entrega y cambio de estado.

import { type ReactNode, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileDown, Loader2, Plus, Trash2 } from 'lucide-react';
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
} from './financieroUtils';
import { type FacturaResumen } from './FacturasPage';

// ---------------------------------------------------------------------------
// Tipos del detalle
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function DetalleFacturaPage() {
  const { id } = useParams<{ id: string }>();
  const facturaId = Number(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { alert, confirm } = useAlert();
  const queryClient = useQueryClient();
  const esAdmin = esUsuarioAdministrador();
  const [formCobro, setFormCobro] = useState<'pago' | 'compensacion' | null>(
    null,
  );

  const { data: factura, isLoading } = useQuery<FacturaDetalle>({
    queryKey: ['factura', facturaId],
    queryFn: async () => {
      const res = await api.get(`/facturacion/facturas/${facturaId}`);
      return res.data;
    },
    enabled: facturaId > 0,
  });

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

  if (!(facturaId > 0)) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/financiero/facturas')}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a facturación
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Identificador de factura no válido.
        </div>
      </div>
    );
  }

  if (isLoading || !factura) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando factura…
      </div>
    );
  }

  const apiBase = import.meta.env.VITE_API_URL as string | undefined;

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/financiero/facturas')}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
              Factura {factura.numero}
              <span className={badgeClass(ESTADO_FACTURA_STYLE[factura.estado])}>
                {ESTADO_FACTURA_LABEL[factura.estado] || factura.estado}
              </span>
              {factura.estado_cartera === 'VENCIDA' && (
                <span className={badgeClass('border-red-300 bg-red-100 text-red-700')}>
                  {factura.dias_vencida} día(s) vencida
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              Detalle, cobros y estado de la factura.
            </p>
          </div>
        </div>
        {factura.ruta_xml && (
          <a
            href={`${apiBase ?? ''}${factura.ruta_xml}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
          >
            <FileDown className="h-3.5 w-3.5" /> Ver XML
          </a>
        )}
      </div>

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
            <p className="mt-0.5 break-all font-mono text-xs">{factura.clave_acceso}</p>
          </div>
        )}
        {factura.numero_autorizacion && (
          <div>
            <span className={labelCls}>Nº autorización SRI</span>
            <p className="break-all font-mono text-xs">
              {factura.numero_autorizacion}
            </p>
          </div>
        )}
        {factura.fecha_autorizacion && (
          <InfoCampo
            label="Fecha autorización"
            valor={new Date(factura.fecha_autorizacion).toLocaleString('es-EC')}
          />
        )}
        {factura.ambiente && (
          <InfoCampo label="Ambiente SRI" valor={factura.ambiente} />
        )}
        {factura.info_adicional?.['RUC Proveedor'] && (
          <InfoCampo
            label="RUC proveedor (XML)"
            valor={factura.info_adicional['RUC Proveedor']}
          />
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
              <div className="mt-3">
                {formCobro === 'pago' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nuevo cobro
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormCobro(null)}
                        className="text-xs font-medium text-muted-foreground underline hover:text-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                    <FormPago
                      facturaId={factura.id}
                      saldo={factura.saldo}
                      onCreado={() => {
                        refrescar();
                        setFormCobro(null);
                      }}
                    />
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormCobro('pago')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-400 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" /> Agregar cobro
                  </button>
                )}
              </div>
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
              <div className="mt-3">
                {formCobro === 'compensacion' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nueva compensación
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormCobro(null)}
                        className="text-xs font-medium text-muted-foreground underline hover:text-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                    <FormCompensacion
                      facturaId={factura.id}
                      saldo={factura.saldo}
                      onCreada={() => {
                        refrescar();
                        setFormCobro(null);
                      }}
                    />
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormCobro('compensacion')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-400 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" /> Agregar compensación
                  </button>
                )}
              </div>
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
                navigate('/financiero/facturas');
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" /> Eliminar factura
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------------

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