import { useState, type ReactNode } from 'react';
import {
  Ban,
  Banknote,
  CalendarClock,
  Check,
  FileMinus,
  Link2,
  Paperclip,
  Percent,
  Plus,
  Truck,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroContext';
import {
  diasParaVencer,
  estadoDe,
  totalesFactura,
  vencimientoDe,
} from '../calculos';
import { fmtFecha, fmtUSD, textoDias } from '../formato';
import type { Cobro, Factura, TipoCobro } from '../tipos';
import { Aviso, Boton, ChipEstadoFactura, ETIQUETA_COBRO, cifraCls, colorTexto, inputCls } from '../ui';
import RegistrarCobroModal from './RegistrarCobroModal';

const ICONO_COBRO: Record<TipoCobro, typeof Banknote> = {
  PAGO: Banknote,
  RETENCION: Percent,
  ENTREGA_EQUIPOS: Truck,
};

function Seccion({
  titulo,
  accion,
  children,
}: {
  titulo: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border px-6 py-5 last:border-b-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
        {accion}
      </div>
      {children}
    </section>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function FilaMonto({
  etiqueta,
  valor,
  fuerte,
  tono,
}: {
  etiqueta: string;
  valor: number;
  fuerte?: boolean;
  tono?: string;
}) {
  return (
    <div className={cn('flex items-baseline justify-between py-1 text-sm', fuerte && 'border-t border-border pt-2 font-semibold')}>
      <span className={fuerte ? 'text-foreground' : 'text-muted-foreground'}>{etiqueta}</span>
      <span className={cn('fin-cifra', tono ?? 'text-foreground')}>{fmtUSD(valor)}</span>
    </div>
  );
}

export default function DetalleFactura({ factura }: { factura: Factura }) {
  const { registrarCobro, anularFactura, vincularOrden, facturas, notasSueltas } = useFinanciero();
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [confirmarAnular, setConfirmarAnular] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ordenElegida, setOrdenElegida] = useState('');
  const [cambiandoOrden, setCambiandoOrden] = useState(false);

  const estado = estadoDe(factura);
  const { cobrado, retenciones, credito, saldo } = totalesFactura(factura);
  const dias = diasParaVencer(factura);
  const abierta = !factura.anulada && saldo > 0.005;
  const avance = Math.min(100, ((cobrado + retenciones + credito) / factura.total) * 100);
  const cobros: Cobro[] = [...factura.cobros].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const rucProveedor = factura.infoAdicional['RUC Proveedor'];

  // Nota de crédito que anuló esta factura, y la factura que la reemplazó.
  const notaQueAnula =
    estado === 'ANULADA' && factura.creditos.length > 0
      ? factura.creditos[factura.creditos.length - 1]
      : null;
  const reemplazadaPor = notaQueAnula
    ? facturas.find(
        (f) =>
          f.id !== factura.id &&
          f.clienteRuc === factura.clienteRuc &&
          f.fechaEmision === notaQueAnula.fechaEmision &&
          Math.abs(f.total - notaQueAnula.valor) < 0.005,
      )
    : undefined;
  // Si esta factura salió el mismo día que una nota de crédito del mismo
  // cliente y por el mismo valor, es un posible reemplazo (refacturación).
  const reemplazaA = [...facturas.flatMap((f) => f.creditos), ...notasSueltas].find(
    (n) =>
      n.facturaModificada !== factura.numero &&
      n.clienteRuc === factura.clienteRuc &&
      n.fechaEmision === factura.fechaEmision &&
      Math.abs(n.valor - factura.total) < 0.005,
  );

  return (
    <div>
      <div className="border-b border-border px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="fin-codigo text-[17px] text-foreground">{factura.numero}</span>
          <ChipEstadoFactura estado={estado} />
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">{factura.clienteNombre}</p>
        <p className="text-xs text-muted-foreground">RUC {factura.clienteRuc}</p>
        {notaQueAnula && (
          <Aviso tono="neutro" className="mt-3 text-[13px]">
            Anulada por la nota de crédito {notaQueAnula.numero} del {fmtFecha(notaQueAnula.fechaEmision)}.
            Motivo: {notaQueAnula.motivo}.
            {reemplazadaPor && ` Posible reemplazo: la factura ${reemplazadaPor.numero}.`}
          </Aviso>
        )}
        {reemplazaA && (
          <Aviso tono="info" className="mt-3 text-[13px]">
            Posible reemplazo de la factura {reemplazaA.facturaModificada}, anulada por la nota de
            crédito {reemplazaA.numero} el {fmtFecha(reemplazaA.fechaEmision)}, con el mismo cliente y
            el mismo valor.
          </Aviso>
        )}
      </div>

      {aviso && (
        <div className="mx-6 mt-4">
          <Aviso tono="ok" icono={<Check className="h-4 w-4" />}>
            {aviso}
          </Aviso>
        </div>
      )}

      <Seccion titulo="Montos">
        <FilaMonto etiqueta="Subtotal con IVA 15%" valor={factura.subtotal} />
        <FilaMonto etiqueta="IVA 15%" valor={factura.iva} />
        <FilaMonto etiqueta="Total de la factura" valor={factura.total} fuerte />
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full rounded-full bg-[var(--fin-ok-punto)]" style={{ width: `${avance}%` }} />
        </div>
        <div className="mt-3">
          <FilaMonto etiqueta="Cobrado" valor={cobrado} />
          <FilaMonto etiqueta="Retenciones" valor={retenciones} />
          {credito > 0 && <FilaMonto etiqueta="Notas de crédito" valor={credito} />}
          <FilaMonto
            etiqueta="Saldo por cobrar"
            valor={saldo}
            fuerte
            tono={estado === 'VENCIDA' ? colorTexto.error : undefined}
          />
        </div>
      </Seccion>

      <Seccion titulo="Cobros" accion={
        abierta ? (
          <Boton size="sm" onClick={() => setCobroAbierto(true)}>
            <Plus className="h-3.5 w-3.5" />
            Registrar cobro
          </Boton>
        ) : undefined
      }>
        {cobros.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
            {estado === 'ANULADA'
              ? 'Factura anulada: no admite cobros.'
              : 'Todavía no hay cobros. Registra el primero cuando llegue el pago.'}
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {cobros.map((c) => {
              const Icono = ICONO_COBRO[c.tipo];
              return (
                <li key={c.id} className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <Icono className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{ETIQUETA_COBRO[c.tipo]}</span>
                    <span className={cn('text-sm font-medium text-foreground', cifraCls)}>{fmtUSD(c.monto)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fmtFecha(c.fecha)}
                    {c.referencia ? `, ${c.referencia}` : ''}
                  </p>
                  {c.observacion && <p className="text-xs text-muted-foreground">{c.observacion}</p>}
                  {c.comprobante && (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary">
                      <Paperclip className="h-3 w-3" />
                      {c.comprobante}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Seccion>

      {factura.creditos.length > 0 && (
        <Seccion titulo="Notas de crédito">
          <ul className="space-y-3">
            {factura.creditos.map((n) => (
              <li key={n.id} className="flex items-start gap-3">
                <FileMinus className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fin-info-fg)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium fin-cifra text-foreground">{n.numero}</span>
                    <span className={cn('text-sm font-medium text-foreground', cifraCls)}>
                      -{fmtUSD(n.valor)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{fmtFecha(n.fechaEmision)}, {n.motivo}</p>
                </div>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      <Seccion titulo="Vencimiento">
        <div className="flex items-center gap-3 text-sm">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">
            {fmtFecha(vencimientoDe(factura))}, plazo de {factura.plazoDias} días
          </span>
          {abierta && (
            <span className={cn('text-xs font-medium', dias < 0 ? colorTexto.error : 'text-muted-foreground')}>
              {textoDias(dias)}
            </span>
          )}
        </div>
      </Seccion>

      <Seccion titulo="Orden de trabajo">
        {factura.ordenTrabajo && !cambiandoOrden ? (
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-foreground">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              Orden {factura.ordenTrabajo}
            </span>
            <button
              type="button"
              onClick={() => {
                setCambiandoOrden(true);
                setOrdenElegida(factura.ordenTrabajo ?? '');
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="orden-vinculo" className="text-sm text-muted-foreground">
              Número de la orden de trabajo
            </label>
            <div className="flex gap-2">
              <input
                id="orden-vinculo"
                type="text"
                value={ordenElegida}
                onChange={(e) => setOrdenElegida(e.target.value)}
                placeholder="Ej. 0013563"
                maxLength={30}
                className={inputCls}
              />
              <Boton
                size="sm"
                className="h-auto shrink-0"
                disabled={!ordenElegida.trim()}
                onClick={() => {
                  const orden = ordenElegida.trim();
                  vincularOrden(factura.id, orden);
                  setCambiandoOrden(false);
                  setAviso(`Factura vinculada a la orden ${orden}.`);
                }}
              >
                Vincular
              </Boton>
            </div>
            <p className="text-xs text-muted-foreground">
              La orden es opcional. Una factura se vincula a una sola orden de trabajo.
            </p>
          </div>
        )}
      </Seccion>

      <Seccion titulo="Datos del SRI">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Dato etiqueta="Fecha de emisión">{fmtFecha(factura.fechaEmision)}</Dato>
          <Dato etiqueta="Ambiente">{factura.ambiente}</Dato>
          <Dato etiqueta="Emisor">{factura.emisor}</Dato>
          <Dato etiqueta="RUC proveedor">{rucProveedor ?? 'No indicado'}</Dato>
          {factura.ordenCompra && (
            <Dato etiqueta="Orden de compra del cliente">{factura.ordenCompra}</Dato>
          )}
          <div className="col-span-2">
            <Dato etiqueta="Clave de acceso">
              <span className="break-all text-xs fin-cifra">{factura.claveAcceso}</span>
            </Dato>
          </div>
        </dl>

        <h4 className="mb-2 mt-5 text-xs font-medium text-muted-foreground">Detalle facturado</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-1.5 text-left font-medium">Descripción</th>
              <th className="py-1.5 text-right font-medium">Cant.</th>
              <th className="py-1.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {factura.lineas.map((l, i) => (
              <tr key={`${l.codigo}-${i}`} className="border-b border-border last:border-0">
                <td className="py-2 pr-3 text-foreground">
                  {l.descripcion}
                  <div className="text-xs text-muted-foreground">{l.codigo}</div>
                </td>
                <td className="py-2 text-right fin-cifra text-foreground">{l.cantidad}</td>
                <td className="py-2 text-right fin-cifra text-foreground">{fmtUSD(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Seccion>

      {estado !== 'ANULADA' && (
        <Seccion titulo="Anular factura">
          {factura.cobros.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Una factura con cobros registrados no se puede anular. Las facturas no se eliminan del sistema.
            </p>
          ) : confirmarAnular ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-foreground">¿Anular la factura {factura.numero}?</span>
              <Boton size="sm" variant="destructive" onClick={() => anularFactura(factura.id)}>
                Sí, anular
              </Boton>
              <Boton size="sm" variant="outline" onClick={() => setConfirmarAnular(false)}>
                No
              </Boton>
            </div>
          ) : (
            <Boton size="sm" variant="outline" onClick={() => setConfirmarAnular(true)}>
              <Ban className="h-3.5 w-3.5" />
              Anular factura
            </Boton>
          )}
        </Seccion>
      )}

      {cobroAbierto && (
        <RegistrarCobroModal
          factura={factura}
          saldo={saldo}
          onCerrar={() => setCobroAbierto(false)}
          onGuardar={(cobro) => {
            registrarCobro(factura.id, cobro);
            setCobroAbierto(false);
            setAviso(`${ETIQUETA_COBRO[cobro.tipo]} de ${fmtUSD(cobro.monto)} registrado.`);
          }}
        />
      )}
    </div>
  );
}
