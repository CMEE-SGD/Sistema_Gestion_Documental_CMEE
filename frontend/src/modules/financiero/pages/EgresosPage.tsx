import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, Inbox, Plus } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroContext';
import { CATEGORIAS_EGRESO, redondear } from '../calculos';
import { MESES, fmtUSD } from '../formato';
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
  const location = useLocation();
  const { egresos, agregarEgreso, cambiarEstadoEgreso } = useFinanciero();
  const [mes, setMes] = useState<number | 'TODOS'>('TODOS');
  const [categoria, setCategoria] = useState<CategoriaEgreso | 'TODAS'>('TODAS');
  // Se abre sola cuando se llega desde el botón "Registrar un egreso" del Resumen.
  const [modalAbierto, setModalAbierto] = useState(
    (location.state as { nuevo?: boolean } | null)?.nuevo === true,
  );
  const [aviso, setAviso] = useState<string | null>(null);

  const sinEgresos = egresos.length === 0;

  // Solo los meses en los que hay algo registrado.
  const mesesConDatos = useMemo(
    () => [...new Set(egresos.map((e) => e.mes))].sort((a, b) => a - b),
    [egresos],
  );

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

      {sinEgresos ? (
        <Panel>
          <div className="flex flex-col items-center gap-4 px-2 py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/60" />
            <div className="max-w-md">
              <p className="text-base font-semibold text-foreground">Todavía no hay egresos</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Registra los gastos del proyecto uno por uno, con su categoría, su monto y si ya
                están pagados. Restan del disponible del Resumen.
              </p>
            </div>
            <Boton onClick={() => setModalAbierto(true)}>
              <Plus className="h-4 w-4" />
              Registrar el primer egreso
            </Boton>
          </div>
        </Panel>
      ) : (
        <>
          <section
            aria-label="Totales"
            className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-[0_1px_2px_rgba(14,26,43,0.05)] sm:grid-cols-3"
          >
            {[
              { titulo: 'Total de egresos', valor: total, color: 'text-foreground', punto: undefined },
              { titulo: 'Pagado', valor: pagado, color: colorTexto.ok, punto: 'bg-[var(--fin-ok-punto)]' },
              // El aviso habla en tinta: el punto amarillo lleva el matiz, igual que en los chips.
              { titulo: 'Por pagar', valor: pendiente, color: 'text-foreground', punto: 'bg-[var(--fin-aviso-punto)]' },
            ].map((k) => (
              <div key={k.titulo} className="bg-card px-5 py-5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                  {k.punto && <span className={cn('h-1.5 w-1.5 rounded-full', k.punto)} aria-hidden />}
                  {k.titulo}
                </div>
                <div className={cn('fin-display fin-cifra mt-2 text-[2rem] font-bold leading-none sm:text-[2.4rem]', k.color)}>
                  {fmtUSD(k.valor)}
                </div>
              </div>
            ))}
          </section>

          <Panel sinRelleno>
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-60">
                <label htmlFor="filtro-categoria" className="sr-only">
                  Categoría
                </label>
                <select
                  id="filtro-categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaEgreso | 'TODAS')}
                  className={inputCls}
                >
                  <option value="TODAS">Todas las categorías</option>
                  {(Object.keys(CATEGORIAS_EGRESO) as CategoriaEgreso[]).map((c) => (
                    <option key={c} value={c}>
                      {CATEGORIAS_EGRESO[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-48">
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
                  {mesesConDatos.map((m) => (
                    <option key={m} value={m}>
                      {MESES[m - 1]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative overflow-x-auto">
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
                  {filas.map((e, i) => (
                    <tr key={e.id} className="transition-colors hover:bg-muted">
                      {/* Como en un libro mayor: el mes se escribe una vez por grupo. */}
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-foreground">
                        {i === 0 || filas[i - 1].mes !== e.mes ? (
                          MESES[e.mes - 1]
                        ) : (
                          <span className="sr-only">{MESES[e.mes - 1]}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-sm text-muted-foreground">
                        {CATEGORIAS_EGRESO[e.categoria]}
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">{e.detalle}</td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <ChipEstadoEgreso estado={e.estado} />
                          {e.estado === 'PENDIENTE' && (
                            <Boton
                              size="sm"
                              variant="outline"
                              aria-label={`Marcar como pagado: ${e.detalle}`}
                              onClick={() => {
                                cambiarEstadoEgreso(e.id, 'PAGADO');
                                setAviso(`"${e.detalle}" marcado como pagado.`);
                              }}
                            >
                              Marcar pagado
                            </Boton>
                          )}
                        </div>
                      </td>
                      <td className={cn('whitespace-nowrap px-5 py-3 text-sm font-semibold text-foreground', cifraCls)}>
                        {fmtUSD(e.monto)}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{e.observacion}</td>
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
        </>
      )}

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
