import { useMemo, useState } from 'react';
import { Check, Inbox, Plus } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroDemoContext';
import { CATEGORIAS_EGRESO, redondear } from '../calculos';
import { HOY, MESES, fmtUSD, mesDeIso } from '../formato';
import type { CategoriaEgreso } from '../tipos';
import {
  Aviso,
  Boton,
  ChipEstadoEgreso,
  EncabezadoPagina,
  Panel,
  cifraCls,
  colorTexto,
  inputCls,
} from '../ui';
import EgresoModal from '../componentes/EgresoModal';

const TH = 'px-5 py-3 text-left text-xs font-semibold text-muted-foreground';

export default function EgresosPage() {
  const { egresos, agregarEgreso, cambiarEstadoEgreso } = useFinanciero();
  const [mes, setMes] = useState<number | 'TODOS'>('TODOS');
  const [categoria, setCategoria] = useState<CategoriaEgreso | 'TODAS'>('TODAS');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const delMes = useMemo(
    () => egresos.filter((e) => mes === 'TODOS' || e.mes === mes),
    [egresos, mes],
  );

  const filas = useMemo(
    () =>
      delMes
        .filter((e) => categoria === 'TODAS' || e.categoria === categoria)
        .sort((a, b) => b.mes - a.mes || b.id - a.id),
    [delMes, categoria],
  );

  const total = redondear(filas.reduce((s, e) => s + e.monto, 0));
  const pagado = redondear(filas.filter((e) => e.estado === 'PAGADO').reduce((s, e) => s + e.monto, 0));
  const pendiente = redondear(total - pagado);

  const porCategoria = (Object.keys(CATEGORIAS_EGRESO) as CategoriaEgreso[]).map((c) => ({
    clave: c,
    etiqueta: CATEGORIAS_EGRESO[c],
    monto: redondear(delMes.filter((e) => e.categoria === c).reduce((s, e) => s + e.monto, 0)),
  }));

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Egresos"
        descripcion="Gastos del proyecto, uno por uno, con su categoría y su estado de pago."
      >
        <Boton onClick={() => setModalAbierto(true)}>
          <Plus className="h-4 w-4" />
          Nuevo egreso
        </Boton>
      </EncabezadoPagina>

      {aviso && (
        <Aviso
          tono="ok"
          icono={<Check className="h-4 w-4" />}
          accion={
            <button
              type="button"
              onClick={() => setAviso(null)}
              className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline"
            >
              Cerrar
            </button>
          }
        >
          {aviso}
        </Aviso>
      )}

      <section
        aria-label="Totales"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-[0_1px_2px_rgba(14,26,43,0.05)] sm:grid-cols-3"
      >
        {[
          { titulo: 'Total de egresos', valor: total, color: 'text-foreground' },
          { titulo: 'Pagado', valor: pagado, color: colorTexto.ok },
          { titulo: 'Por pagar', valor: pendiente, color: colorTexto.aviso },
        ].map((k) => (
          <div key={k.titulo} className="bg-card px-5 py-5">
            <div className="text-[13px] font-medium text-muted-foreground">{k.titulo}</div>
            <div className={cn('fin-display fin-cifra mt-2 text-[2rem] font-bold leading-none sm:text-[2.4rem]', k.color)}>
              {fmtUSD(k.valor)}
            </div>
          </div>
        ))}
      </section>

      <Panel sinRelleno>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoría">
            <button
              type="button"
              aria-pressed={categoria === 'TODAS'}
              onClick={() => setCategoria('TODAS')}
              className={cn(
                'rounded-full border px-3 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                categoria === 'TODAS'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-card text-foreground hover:bg-muted',
              )}
            >
              Todas
            </button>
            {porCategoria.map((c) => (
              <button
                key={c.clave}
                type="button"
                aria-pressed={categoria === c.clave}
                onClick={() => setCategoria(c.clave)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  categoria === c.clave
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-card text-foreground hover:bg-muted',
                )}
              >
                {c.etiqueta}
                <span
                  className={cn(
                    'fin-cifra text-xs',
                    categoria === c.clave ? 'text-primary-foreground/75' : 'text-muted-foreground',
                  )}
                >
                  {fmtUSD(c.monto)}
                </span>
              </button>
            ))}
          </div>
          <div className="w-full lg:w-48">
            <label htmlFor="filtro-mes" className="sr-only">
              Mes
            </label>
            <select
              id="filtro-mes"
              value={mes}
              onChange={(e) => setMes(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))}
              className={inputCls}
            >
              <option value="TODOS">Todos los meses</option>
              {MESES.slice(3, mesDeIso(HOY)).map((nombre, i) => (
                <option key={nombre} value={i + 4}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className={TH}>Mes</th>
                <th className={TH}>Categoría</th>
                <th className={TH}>Detalle</th>
                <th className={TH}>Estado</th>
                <th className={cn(TH, 'text-right')}>Monto</th>
                <th className={TH}>Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filas.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-muted">
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-foreground">{MESES[e.mes - 1]}</td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="inline-flex rounded-full bg-[var(--fin-info-bg)] px-2.5 py-[3px] text-xs font-semibold text-[var(--fin-info-fg)]">
                      {CATEGORIAS_EGRESO[e.categoria]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{e.detalle}</td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <ChipEstadoEgreso estado={e.estado} />
                      {e.estado === 'PENDIENTE' && (
                        <button
                          type="button"
                          onClick={() => {
                            cambiarEstadoEgreso(e.id, 'PAGADO');
                            setAviso(`"${e.detalle}" marcado como pagado.`);
                          }}
                          className="text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Marcar pagado
                        </button>
                      )}
                    </div>
                  </td>
                  <td className={cn('whitespace-nowrap px-5 py-3 text-sm font-semibold text-foreground', cifraCls)}>
                    {fmtUSD(e.monto)}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {e.observacion ?? <span className="text-muted-foreground/50">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filas.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <Inbox className="h-9 w-9 text-muted-foreground/60" />
            <div>
              <p className="text-sm font-semibold text-foreground">No hay egresos con estos filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cambia la categoría o el mes, o registra un egreso nuevo.
              </p>
            </div>
          </div>
        )}
      </Panel>

      {modalAbierto && (
        <EgresoModal
          onCerrar={() => setModalAbierto(false)}
          onGuardar={(egreso) => {
            agregarEgreso(egreso);
            setModalAbierto(false);
            setMes('TODOS');
            setCategoria('TODAS');
            setAviso(`Egreso "${egreso.detalle}" guardado por ${fmtUSD(egreso.monto)}.`);
          }}
        />
      )}
    </div>
  );
}
