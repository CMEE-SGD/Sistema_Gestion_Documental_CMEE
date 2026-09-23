import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Banknote,
  Clock,
  Percent,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroDemoContext';
import {
  CMEE_PCT,
  ESPE_PCT,
  PROVISION_PCT,
  calcularDashboard,
  estadoDe,
  type PasoPuente,
  type Rango,
} from '../calculos';
import { MESES, fmtUSD, fmtUSDCompacto, mesDeIso, HOY, textoDias } from '../formato';
import { ChipEstadoFactura, EncabezadoPagina, Panel, cifraCls, colorTexto } from '../ui';

const configMensual: ChartConfig = {
  facturado: { label: 'Facturado', color: 'var(--fin-graf-facturado)' },
  cobrado: { label: 'Cobrado', color: 'var(--fin-graf-cobrado)' },
};

const configPuente: ChartConfig = {
  rango: { label: 'Monto', color: 'var(--fin-graf-facturado)' },
};

// Redondea el tope del eje a un múltiplo "limpio" con un poco de aire arriba,
// para que las marcas del eje no queden amontonadas.
function escalaAgradable(max: number): number {
  if (max <= 0) return 0;
  const unidad = max >= 20000 ? 10000 : max >= 6000 ? 2000 : max >= 2000 ? 1000 : 500;
  return Math.ceil((max * 1.06) / unidad) * unidad;
}

function colorPaso(p: PasoPuente): string {
  if (p.clave === 'total') return 'var(--fin-oro)';
  if (p.tipo === 'total') return 'var(--fin-graf-facturado)';
  return p.tipo === 'suma' ? 'var(--fin-graf-cobrado)' : 'var(--fin-graf-paso)';
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

function TooltipPuente({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PasoPuente }>;
}) {
  if (!active || !payload?.length) return null;
  const paso = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{paso.etiqueta}</div>
      <div className="fin-cifra text-muted-foreground">
        {paso.valor < 0 ? '-' : paso.tipo === 'suma' ? '+' : ''}
        {fmtUSD(Math.abs(paso.valor))}
      </div>
    </div>
  );
}

function Variacion({ actual, previo }: { actual: number; previo: number }) {
  if (previo === 0) return <span>Sin mes anterior</span>;
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
      <Icono className="h-3.5 w-3.5" />
      {sube ? '+' : ''}
      {pct.toFixed(0)}% frente al mes anterior
    </span>
  );
}

// Cada indicador es una celda de una sola franja, separada por líneas finas.
function Indicador({
  titulo,
  icono,
  valor,
  detalle,
  colorValor = 'text-foreground',
  className,
}: {
  titulo: string;
  icono: ReactNode;
  valor: string;
  detalle: ReactNode;
  colorValor?: string;
  className?: string;
}) {
  return (
    <div className={cn('bg-card px-4 py-4 sm:px-5 sm:py-5', className)}>
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
        {icono}
        {titulo}
      </div>
      <div className={cn('fin-display fin-cifra mt-3 text-[1.85rem] font-bold leading-none sm:text-[2.2rem] xl:text-[2.6rem]', colorValor)}>
        {valor}
      </div>
      <div className="mt-2.5 text-xs leading-4 text-muted-foreground">{detalle}</div>
    </div>
  );
}

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
      <span className={fuerte ? 'text-foreground' : 'text-muted-foreground'}>{etiqueta}</span>
      <span className="fin-cifra text-foreground">
        {signo}
        {fmtUSD(Math.abs(valor))}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { facturas, egresos, notasSueltas } = useFinanciero();
  const [rango, setRango] = useState<Rango>('ACUMULADO');
  const d = useMemo(
    () => calcularDashboard(facturas, egresos, rango, notasSueltas),
    [facturas, egresos, rango, notasSueltas],
  );

  const mesActual = MESES[mesDeIso(HOY) - 1];
  const etiquetaRango = rango === 'MES' ? `${mesActual} de 2026` : 'Acumulado de 2026';
  const maxAntiguedad = Math.max(1, ...d.antiguedad.map((a) => a.monto));
  const totalCategorias = d.egresosPorCategoria.reduce((s, c) => s + c.monto, 0);
  const maxCategoria = Math.max(1, ...d.egresosPorCategoria.map((c) => c.monto));
  const minY = -escalaAgradable(-Math.min(0, ...d.puente.map((p) => p.rango[0])));
  const maxY = escalaAgradable(Math.max(1, ...d.puente.map((p) => p.rango[1])));
  const conVariacion = rango === 'MES';
  const conSaldo = d.antiguedad.reduce((s, a) => s + a.cantidad, 0);
  const icono = 'h-4 w-4';

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Resumen financiero"
        descripcion={`Ingresos, cobros y egresos del proyecto. Periodo: ${etiquetaRango}.`}
      >
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
      </EncabezadoPagina>

      <section
        aria-label="Indicadores"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-[0_1px_2px_rgba(14,26,43,0.05)] xl:grid-cols-5"
      >
        <Indicador
          titulo="Facturado"
          icono={<Receipt className={icono} strokeWidth={1.75} />}
          valor={fmtUSD(d.facturado)}
          detalle={
            conVariacion ? (
              <Variacion actual={d.facturado} previo={d.facturadoPrevio} />
            ) : d.notasBase > 0 ? (
              `Base sin IVA, menos ${fmtUSD(d.notasBase)} en notas de crédito`
            ) : (
              'Base sin IVA, facturas no anuladas'
            )
          }
        />
        <Indicador
          titulo="Cobrado"
          icono={<Banknote className={icono} strokeWidth={1.75} />}
          valor={fmtUSD(d.cobrado)}
          colorValor={colorTexto.ok}
          detalle={
            conVariacion ? (
              <Variacion actual={d.cobrado} previo={d.cobradoPrevio} />
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
          icono={<Clock className={icono} strokeWidth={1.75} />}
          valor={fmtUSD(d.porCobrar)}
          detalle={`${conSaldo} facturas con saldo, a hoy`}
        />
        <Indicador
          titulo="Vencido"
          icono={<AlertTriangle className={icono} strokeWidth={1.75} />}
          valor={fmtUSD(d.vencido)}
          colorValor={colorTexto.error}
          detalle={`${d.facturasVencidas} facturas fuera de plazo`}
          className="col-span-2 xl:col-span-1"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          titulo="Facturado y cobrado por mes"
          descripcion="Últimos 6 meses. Facturado en base sin IVA; cobrado según la fecha del pago."
        >
          <ChartContainer config={configMensual} className="h-64 w-full">
            <BarChart data={d.serieMensual} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={fmtUSDCompacto} />
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
                    {a.cantidad} {a.cantidad === 1 ? 'factura' : 'facturas'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section aria-label="Disponible CMEE">
        <Panel
          titulo="Disponible CMEE"
          descripcion={`Del ingreso neto al total disponible. ${CMEE_PCT}% para CMEE, ${ESPE_PCT}% para ESPE y ${PROVISION_PCT}% de provisión: reglas del Excel actual, por confirmar.`}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="min-w-0 overflow-x-auto lg:col-span-2">
              <ChartContainer config={configPuente} className="h-72 w-full min-w-[480px]">
                <BarChart data={d.puente} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="corta" tickLine={false} axisLine={false} interval={0} fontSize={12} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={fmtUSDCompacto}
                    domain={[minY, maxY]}
                  />
                  <ChartTooltip cursor={false} content={<TooltipPuente />} />
                  <Bar dataKey="rango" radius={3} maxBarSize={72}>
                    {d.puente.map((p) => (
                      <Cell key={p.clave} fill={colorPaso(p)} />
                    ))}
                    <LabelList
                      dataKey="valor"
                      position="top"
                      className="fill-foreground text-xs font-medium"
                      formatter={((v: unknown) => fmtUSDCompacto(Number(v))) as never}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <FilaPuente etiqueta="Ingreso neto" valor={d.ingresoNeto} />
              <FilaPuente etiqueta={`ESPE ${ESPE_PCT}%`} valor={d.espe} signo="-" />
              <FilaPuente etiqueta={`CMEE ${CMEE_PCT}%`} valor={d.cmee} fuerte />
              <FilaPuente etiqueta="Egresos (pagados y por pagar)" valor={d.totalEgresos} signo="-" />
              <FilaPuente etiqueta="Devolución de anticipo" valor={d.devolucion} signo="+" />
              <FilaPuente etiqueta="Disponible" valor={d.disponible} fuerte />
              <FilaPuente etiqueta={`Provisión ${PROVISION_PCT}%`} valor={d.provision} signo="-" />
              <div className="mt-4 rounded-lg border border-[var(--fin-oro)] bg-[var(--fin-oro-tinte)] px-4 py-3.5">
                <div className="text-[13px] font-semibold text-[var(--fin-oro-tinta)]">
                  Total disponible
                </div>
                <div className="fin-display fin-cifra mt-1 text-[2.8rem] font-bold leading-none text-foreground sm:text-[3.4rem]">
                  {fmtUSD(d.totalDisponible)}
                </div>
              </div>
            </div>
          </div>
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
              No hay facturas vencidas. La cartera está al día.
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
                      <div className="text-xs text-muted-foreground">
                        <span className="fin-codigo">{factura.numero}</span>, {textoDias(dias)}
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex">
                      <ChipEstadoFactura estado={estadoDe(factura)} />
                    </span>
                    <span className={cn('w-24 text-sm font-semibold text-foreground', cifraCls)}>
                      {fmtUSD(saldo)}
                    </span>
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
    </div>
  );
}
