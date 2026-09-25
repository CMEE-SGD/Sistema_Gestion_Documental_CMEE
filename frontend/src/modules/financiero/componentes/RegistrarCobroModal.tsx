import { useState, type FormEvent } from 'react';
import { Banknote, Percent, Truck } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import type { Cobro, Factura, TipoCobro } from '../tipos';
import { HOY, fmtUSD } from '../formato';
import { Aviso, Boton, Modal, inputCls, labelCls } from '../ui';

const TIPOS: Array<{
  clave: TipoCobro;
  titulo: string;
  descripcion: string;
  icono: typeof Banknote;
  ejemploReferencia: string;
}> = [
  {
    clave: 'PAGO',
    titulo: 'Pago',
    descripcion: 'Transferencia, efectivo o cheque',
    icono: Banknote,
    ejemploReferencia: 'Ej. Transferencia 5663969',
  },
  {
    clave: 'RETENCION',
    titulo: 'Retención',
    descripcion: 'Comprobante de retención del cliente',
    icono: Percent,
    ejemploReferencia: 'Ej. Retención 001-003-000012345',
  },
  {
    clave: 'ENTREGA_EQUIPOS',
    titulo: 'Entrega de equipos',
    descripcion: 'El cliente paga con equipos',
    icono: Truck,
    ejemploReferencia: 'Ej. Acta de recepción 0045',
  },
];

export default function RegistrarCobroModal({
  factura,
  saldo,
  onCerrar,
  onGuardar,
}: {
  factura: Factura;
  saldo: number;
  onCerrar: () => void;
  onGuardar: (cobro: Omit<Cobro, 'id'>) => void;
}) {
  const [tipo, setTipo] = useState<TipoCobro>('PAGO');
  const [fecha, setFecha] = useState(HOY);
  const [monto, setMonto] = useState(saldo.toFixed(2));
  const [referencia, setReferencia] = useState('');
  const [observacion, setObservacion] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [error, setError] = useState<string | null>(null);

  const ejemplo = TIPOS.find((t) => t.clave === tipo)?.ejemploReferencia ?? '';

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      setError('Ingresa un monto mayor a cero.');
      return;
    }
    if (valor > saldo + 0.005) {
      setError(`El monto supera el saldo pendiente de ${fmtUSD(saldo)}.`);
      return;
    }
    if (!fecha) {
      setError('Elige la fecha del cobro.');
      return;
    }
    onGuardar({
      tipo,
      fecha,
      monto: Math.round(valor * 100) / 100,
      referencia: referencia.trim() || undefined,
      observacion: observacion.trim() || undefined,
      comprobante: comprobante || undefined,
    });
  };

  return (
    <Modal isOpen onClose={onCerrar} title={`Registrar cobro de la factura ${factura.numero}`}>
      <form onSubmit={guardar} className="space-y-5" noValidate>
        <p className="text-sm text-muted-foreground">
          Saldo pendiente de <span className="font-medium fin-cifra text-foreground">{fmtUSD(saldo)}</span>{' '}
          de una factura de {fmtUSD(factura.total)}.
        </p>

        <fieldset>
          <legend className={labelCls}>Tipo de cobro</legend>
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
            {TIPOS.map((t) => {
              const Icono = t.icono;
              const activo = tipo === t.clave;
              return (
                <label
                  key={t.clave}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors focus-within:ring-1 focus-within:ring-ring',
                    activo
                      ? 'border-primary bg-[#eaf0f8] ring-1 ring-primary/30'
                      : 'border-border hover:bg-muted',
                  )}
                >
                  <input
                    type="radio"
                    name="tipo-cobro"
                    value={t.clave}
                    checked={activo}
                    onChange={() => setTipo(t.clave)}
                    className="sr-only"
                  />
                  <span className={cn('flex items-center gap-2 font-medium', activo ? 'text-primary' : 'text-foreground')}>
                    <Icono className="h-4 w-4" />
                    {t.titulo}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.descripcion}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cobro-fecha" className={labelCls}>
              Fecha del cobro
            </label>
            <input
              id="cobro-fecha"
              type="date"
              max={HOY}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="cobro-monto" className={labelCls}>
              Monto
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  aria-hidden
                >
                  $
                </span>
                <input
                  id="cobro-monto"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className={cn(inputCls, 'fin-cifra pl-7')}
                />
              </div>
              <Boton type="button" variant="outline" size="sm" className="h-auto shrink-0" onClick={() => setMonto(saldo.toFixed(2))}>
                Todo el saldo
              </Boton>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="cobro-ref" className={labelCls}>
            Referencia
          </label>
          <input
            id="cobro-ref"
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder={ejemplo}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="cobro-comprobante" className={labelCls}>
            Comprobante (opcional)
          </label>
          <input
            id="cobro-comprobante"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setComprobante(e.target.files?.[0]?.name ?? '')}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
          />
        </div>

        <div>
          <label htmlFor="cobro-obs" className={labelCls}>
            Observación (opcional)
          </label>
          <textarea
            id="cobro-obs"
            rows={2}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className={inputCls}
          />
        </div>

        {error && <Aviso tono="error">{error}</Aviso>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Boton type="button" variant="outline" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit">Guardar cobro</Boton>
        </div>
      </form>
    </Modal>
  );
}
