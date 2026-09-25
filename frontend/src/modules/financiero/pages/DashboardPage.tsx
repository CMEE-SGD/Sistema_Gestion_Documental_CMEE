import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle,
  Banknote,
  Check,
  Clock,
  Percent,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Upload,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroContext';
import {
  CMEE_PCT,
  ESPE_PCT,
  PROVISION_PCT,
  calcularDashboard,
  type Rango,
} from '../calculos';
import { MESES, anioDeIso, fmtFecha, fmtUSD, fmtUSDCompacto, mesDeIso, HOY } from '../formato';
import { Boton, EncabezadoPagina, Panel, cifraCls, colorTexto, inputCls } from '../ui';

const configMensual: ChartConfig = {
  facturado: { label: 'Facturado', color: 'var(--fin-graf-facturado)' },
  cobrado: { label: 'Cobrado', color: 'var(--fin-graf-cobrado)' },
};

const textoFacturas = (n: number) => `${n} ${n === 1 ? 'factura' : 'facturas'}`;

// `dias` viene negativo cuando la factura ya venció.
const textoAtraso = (dias: number) => {
  const n = Math.abs(dias);
  return `${n} ${n === 1 ? 'día' : 'días'} de atraso`;
};

// Eje con un paso "limpio" (1, 2, 2.5 o 5 por potencia de 10) y unas cuatro
// marcas: el dominio termina justo en la última marca, así no quedan dos
// marcas casi pegadas (por ejemplo $60k y $70k) en el borde superior.
function ejeAgradable(min: number, max: number) {
  const bruto = Math.max(max - min, 1) / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto) ?? potencia * 10;
  const inicio = Math.floor(min / paso) * paso;
  const fin = Math.ceil(max / paso) * paso;
  const marcas: number[] = [];
  for (let v = inicio; v <= fin + paso / 1000; v += paso) marcas.push(Math.round(v * 100) / 100);
  return { dominio: [inicio, fin] as [number, number], marcas };
}

function TooltipDinero({
  active,
  payload,
  label,
  etiquetas,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color?: string; fill?: string; name?: string }>;
  label?: string;
  etiquetas: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label && <div className="mb-1 font-semibold text-foreground">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color ?? p.fill }} />
          <span className="text-muted-foreground">{etiquetas[p.dataKey] ?? p.name}</span>
          <span className="ml-auto pl-4 font-medium fin-cifra text-foreground">
            {fmtUSD(Number(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

// Compara con el mismo tramo del mes anterior: el mes en curso está a medias y
// contra un mes completo casi siempre parecería una caída.
function Variacion({ actual, previo, tramo }: { actual: number; previo: number; tramo: string }) {
  if (previo === 0) return <span>Sin datos de {tramo}</span>;
  const pct = ((actual - previo) / previo) * 100;
  const sube = pct >= 0;
  const Icono = sube ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        sube ? colorTexto.ok : colorTexto.error,
      )}
    >
      <Icono className="h-3.5 w-3.5 shrink-0" />
      {sube ? '+' : ''}
      {pct.toFixed(0)}% frente a {tramo}
    </span>
  );
}

// Cada indicador es una celda de una sola franja, separada por líneas finas.
// `base` dice sobre qué se calcula la cifra (con o sin IVA), porque no todas
// comparten la misma y así no se puede restar una de otra a ojo.
function Indicador({
  titulo,
  base,
  icono,
  valor,
  detalle,
  colorValor = 'text-foreground',
  className,
}: {
  titulo: string;
  base?: string;
  icono: ReactNode;
  valor: string;
  detalle: ReactNode;
  colorValor?: string;
  className?: string;
}) {
  return (
    <div className={cn('bg-card px-4 py-4 sm:px-5 sm:py-5', className)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          {icono}
          {titulo}
        </span>
        {base && <span className="whitespace-nowrap font-normal">{base}</span>}
      </div>
      <div className={cn('fin-display fin-cifra mt-3 text-[1.85rem] font-bold leading-none sm:text-[2.2rem] xl:text-[2.6rem]', colorValor)}>
        {valor}
      </div>
      <div className="mt-2.5 space-y-1 text-xs leading-4 text-muted-foreground">{detalle}</div>
    </div>
  );
}

// Una línea del cálculo del disponible: etiqueta a la izquierda, cifra a la derecha.
function FilaPuente({
  etiqueta,
  valor,
  signo,
  fuerte,
}: {
  etiqueta: string;
  valor: number;
  signo?: '-' | '+';
  fuerte?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-1.5 text-sm',
        fuerte && 'border-t border-border pt-2.5 font-semibold',
      )}
    >
      <dt className={fuerte ? 'text-foreground' : 'text-muted-foreground'}>{etiqueta}</dt>
      <dd className="fin-cifra text-foreground">
        {valor !== 0 && signo}
        {fmtUSD(Math.abs(valor))}
      </dd>
    </div>
  );
}

// La devolución de anticipo no sale de ningún XML: se escribe a mano.
function FilaDevolucion({
  valor,
  editable,
  onGuardar,
}: {
  valor: number;
  editable: boolean;
  onGuardar: (monto: number) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState('');

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(texto);
    if (!Number.isFinite(n) || n < 0) return;
    onGuardar(n);
    setEditando(false);
  };

  if (editando) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-1.5 text-sm">
        <dt className="text-muted-foreground">
          <label htmlFor="devolucion-anticipo">Devolución de anticipo</label>
        </dt>
        <dd>
          <form onSubmit={guardar} className="flex items-center gap-2">
            <span className="relative">
              <span
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                aria-hidden
              >
                $
              </span>
              <input
                id="devolucion-anticipo"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoFocus
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className={cn(inputCls, 'fin-cifra h-8 w-28 py-1 pl-6')}
              />
            </span>
            <Boton size="sm" type="submit">
              Guardar
            </Boton>
            <Boton size="sm" variant="outline" onClick={() => setEditando(false)}>
              Cancelar
            </Boton>
          </form>
        </dd>
      </div>
    );
  }

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">
        Devolución de anticipo
        {editable && (
          <button
            type="button"
            onClick={() => {
              setTexto(valor > 0 ? valor.toFixed(2) : '');
              setEditando(true);
            }}
            aria-label={valor > 0 ? 'Cambiar la devolución de anticipo' : 'Registrar la devolución de anticipo'}
            className="ml-2 rounded-sm text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {valor > 0 ? 'Cambiar' : 'Registrar'}
          </button>
        )}
      </dt>
      <dd className="fin-cifra text-foreground">
        {valor > 0 && '+'}
        {fmtUSD(valor)}
      </dd>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { facturas, egresos, notasSueltas, devolucion, vacio, establecerDevolucion } = useFinanciero();
  const [rango, setRango] = useState<Rango>('ACUMULADO');
  const d = useMemo(
    () => calcularDashboard(facturas, egresos, rango, notasSueltas, devolucion),
    [facturas, egresos, rango, notasSueltas, devolucion],
  );

  const mesActual = MESES[mesDeIso(HOY) - 1];
  const etiquetaRango = rango === 'MES' ? `${mesActual} de ${anioDeIso(HOY)}` : 'Acumulado del proyecto';
  const maxAntiguedad = Math.max(1, ...d.antiguedad.map((a) => a.monto));
  const totalCategorias = d.egresosPorCategoria.reduce((s, c) => s + c.monto, 0);
  const maxCategoria = Math.max(1, ...d.egresosPorCategoria.map((c) => c.monto));
  const ejeMensual = ejeAgradable(
    0,
    Math.max(1, ...d.serieMensual.flatMap((m) => [m.facturado, m.cobrado])),
  );
  const conVariacion = rango === 'MES';
  const conSaldo = d.antiguedad.reduce((s, a) => s + a.cantidad, 0);
  const icono = 'h-4 w-4';

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Resumen financiero"
        descripcion="Ingresos, cobros y egresos del proyecto."
      >
        {!vacio && (
          <div
            role="group"
            aria-label="Periodo"
            className="inline-flex rounded-lg border border-input bg-card p-0.5 text-sm"
          >
            {(
              [
                ['MES', 'Este mes'],
                ['ACUMULADO', 'Acumulado'],
              ] as Array<[Rango, string]>
            ).map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={rango === valor}
                onClick={() => setRango(valor)}
                className={cn(
                  'rounded-md px-3.5 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  rango === valor
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {texto}
              </button>
            ))}
          </div>
        )}
      </EncabezadoPagina>

      {vacio ? (
        <Panel>
          <div className="flex flex-col items-center gap-5 px-2 py-14 text-center">
            <h2 className="fin-display text-[2rem] font-bold leading-none text-foreground">
              Empieza cargando tus datos
            </h2>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground">
              Sube los XML de tus facturas y notas de crédito, y registra los egresos del proyecto.
              El total disponible, la cartera y los gráficos se arman solos con lo que cargues.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Boton onClick={() => navigate('/financiero/facturas', { state: { subir: true } })}>
                <Upload className="h-4 w-4" />
                Subir facturas
              </Boton>
              <Boton
                variant="outline"
                onClick={() => navigate('/financiero/egresos', { state: { nuevo: true } })}
              >
                <Plus className="h-4 w-4" />
                Registrar un egreso
              </Boton>
            </div>
            <p className="max-w-md text-xs leading-5 text-muted-foreground">
              Lo que cargues se guarda en este navegador. Si ya tienes una copia guardada, cárgala
              con «Cargar copia» en el menú lateral.
            </p>
          </div>
        </Panel>
      ) : (
        <>
          {/* Lo primero que se ve: cuánto queda disponible y cómo se llega a esa cifra. */}
          <section
            aria-label="Disponible CMEE"
            className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(14,26,43,0.05)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            <div className="flex flex-col justify-between gap-6 border-b border-[var(--fin-oro)] bg-[var(--fin-oro-tinte)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <div>
                <h2 className="text-[13px] font-semibold text-[var(--fin-oro-tinta)]">
                  Total disponible CMEE
                </h2>
                <p className="mt-0.5 text-xs text-[var(--fin-oro-tinta)]">
                  {etiquetaRango}, al {fmtFecha(HOY)}
                </p>
                <div className="fin-display fin-cifra mt-3 text-[3.25rem] font-bold leading-none text-foreground sm:text-[4rem] xl:text-[4.5rem]">
                  {fmtUSD(d.totalDisponible)}
                </div>
              </div>
              <div className="space-y-2 text-[13px] leading-5 text-[var(--fin-oro-tinta)]">
                <p>
                  Es el {CMEE_PCT}% del ingreso neto, menos los egresos, más la devolución de anticipo y
                  menos la provisión del {PROVISION_PCT}%.
                </p>
                <p>
                  Son reglas del Excel actual, aún por confirmar.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/financiero/reglas')}
                    className="rounded-sm font-semibold underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Revisarlas en Reglas y supuestos
                  </button>
                </p>
              </div>
            </div>

            <div className="min-w-0 p-5 sm:p-6">
              <h3 className="text-[15px] font-semibold leading-5 text-foreground">Cómo se calcula</h3>
              <dl className="mt-3">
                <FilaPuente etiqueta="Ingreso neto" valor={d.ingresoNeto} />
                <FilaPuente etiqueta={`ESPE ${ESPE_PCT}%`} valor={d.espe} signo="-" />
                <FilaPuente etiqueta={`CMEE ${CMEE_PCT}%`} valor={d.cmee} fuerte />
                <FilaPuente etiqueta="Egresos (pagados y por pagar)" valor={d.totalEgresos} signo="-" />
                <FilaDevolucion
                  valor={d.devolucion}
                  editable={rango === 'ACUMULADO'}
                  onGuardar={establecerDevolucion}
                />
                <FilaPuente etiqueta="Disponible" valor={d.disponible} fuerte />
                <FilaPuente etiqueta={`Provisión ${PROVISION_PCT}%`} valor={d.provision} signo="-" />
              </dl>
            </div>
          </section>

          <section
            aria-label="Indicadores"
            className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-[0_1px_2px_rgba(14,26,43,0.05)] xl:grid-cols-4"
          >
            <Indicador
              titulo="Facturado"
              base="sin IVA"
              icono={<Receipt className={icono} strokeWidth={1.75} />}
              valor={fmtUSD(d.facturado)}
              detalle={
                conVariacion ? (
                  <Variacion actual={d.facturado} previo={d.facturadoPrevio} tramo={d.tramoPrevio} />
                ) : d.notasBase > 0 ? (
                  `Menos ${fmtUSD(d.notasBase)} en notas de crédito`
                ) : (
                  'Facturas no anuladas'
                )
              }
            />
            <Indicador
              titulo="Cobrado"
              base="con IVA"
              icono={<Banknote className={icono} strokeWidth={1.75} />}
              valor={fmtUSD(d.cobrado)}
              colorValor={colorTexto.ok}
              detalle={
                conVariacion ? (
                  <Variacion actual={d.cobrado} previo={d.cobradoPrevio} tramo={d.tramoPrevio} />
                ) : (
                  'Pagos y entregas de equipos'
                )
              }
            />
            <Indicador
              titulo="Retenciones"
              icono={<Percent className={icono} strokeWidth={1.75} />}
              valor={fmtUSD(d.retenciones)}
              detalle="Descontadas por los clientes al pagar"
            />
            <Indicador
              titulo="Por cobrar"
              base="con IVA"
              icono={<Clock className={icono} strokeWidth={1.75} />}
              valor={fmtUSD(d.porCobrar)}
              detalle={
                <>
                  <div>{textoFacturas(conSaldo)} con saldo, a hoy</div>
                  {d.vencido > 0 ? (
                    <div className={cn('flex items-start gap-1.5 font-semibold', colorTexto.error)}>
                      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                      <span>
                        De ese saldo, {fmtUSD(d.vencido)} está vencido ({textoFacturas(d.facturasVencidas)})
                      </span>
                    </div>
                  ) : (
                    <div className={cn('flex items-center gap-1.5 font-semibold', colorTexto.ok)}>
                      <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                      Ninguna factura vencida
                    </div>
                  )}
                </>
              }
            />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              titulo="Facturado y cobrado por mes"
              descripcion={`Últimos 6 meses.${d.mesParcial ? ` El último llega hasta hoy, ${fmtFecha(HOY)}.` : ''} Facturado en base sin IVA; cobrado según la fecha del pago.`}
            >
              <ChartContainer config={configMensual} className="h-64 w-full">
                <BarChart data={d.serieMensual} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={fmtUSDCompacto}
                    domain={ejeMensual.dominio}
                    ticks={ejeMensual.marcas}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(30,58,95,0.06)' }}
                    content={<TooltipDinero etiquetas={{ facturado: 'Facturado', cobrado: 'Cobrado' }} />}
                  />
                  <Bar dataKey="facturado" fill="var(--color-facturado)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cobrado" fill="var(--color-cobrado)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--fin-graf-facturado)]" /> Facturado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--fin-graf-cobrado)]" /> Cobrado
                </span>
              </div>
            </Panel>

            <Panel titulo="Cartera por antigüedad" descripcion="Saldo pendiente según los días de atraso.">
              <ul className="space-y-3.5">
                {d.antiguedad.map((a) => (
                  <li key={a.clave}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-foreground">{a.etiqueta}</span>
                      <span className="fin-cifra font-semibold text-foreground">{fmtUSD(a.monto)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2.5">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(a.monto / maxAntiguedad) * 100}%`, background: a.color }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-muted-foreground">
                        {textoFacturas(a.cantidad)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel titulo="Egresos por categoría" descripcion={etiquetaRango}>
              {d.egresosPorCategoria.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No hay egresos registrados en este periodo.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {d.egresosPorCategoria.map((c) => (
                    <li key={c.categoria}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="text-foreground">{c.etiqueta}</span>
                        <span className="fin-cifra text-foreground">
                          <span className="font-semibold">{fmtUSD(c.monto)}</span>
                          <span className="ml-2 inline-block w-9 text-right text-xs text-muted-foreground">
                            {((c.monto / totalCategorias) * 100).toFixed(0)}%
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{ width: `${(c.monto / maxCategoria) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                  <li className="flex items-baseline justify-between border-t border-border pt-3 text-sm font-semibold">
                    <span>Total egresos</span>
                    <span className="fin-cifra">{fmtUSD(totalCategorias)}</span>
                  </li>
                </ul>
              )}
            </Panel>

            <Panel
              titulo="Facturas que requieren atención"
              descripcion="Las cinco más atrasadas, con saldo por cobrar."
            >
              {d.atencion.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {facturas.length === 0
                    ? 'Todavía no hay facturas cargadas.'
                    : 'No hay facturas vencidas. La cartera está al día.'}
                </p>
              ) : (
                <ul className="-mx-2 divide-y divide-border">
                  {d.atencion.map(({ factura, saldo, dias }) => (
                    <li key={factura.id}>
                      <button
                        type="button"
                        onClick={() => navigate('/financiero/facturas', { state: { abrir: factura.id } })}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {factura.clienteNombre}
                          </div>
                          <div className="fin-codigo text-xs text-muted-foreground">{factura.numero}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={cn('text-sm font-semibold text-foreground', cifraCls)}>
                            {fmtUSD(saldo)}
                          </div>
                          <div className={cn('text-xs font-semibold', colorTexto.error)}>
                            {textoAtraso(dias)}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => navigate('/financiero/facturas')}
                className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver todas las facturas
              </button>
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}
