import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Inbox, Search, Upload } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroDemoContext';
import { diasParaVencer, estadoDe, totalesFactura, vencimientoDe } from '../calculos';
import { fmtFecha, fmtUSD, textoDias } from '../formato';
import type { EstadoFactura, Factura } from '../tipos';
import {
  Aviso,
  Boton,
  ChipEstadoFactura,
  EncabezadoPagina,
  Panel,
  PanelLateral,
  cifraCls,
  colorTexto,
  inputCls,
} from '../ui';
import DetalleFactura from '../componentes/DetalleFactura';
import SubirXmlModal from '../componentes/SubirXmlModal';

const FILTROS: Array<{ clave: 'TODAS' | EstadoFactura; etiqueta: string }> = [
  { clave: 'TODAS', etiqueta: 'Todas' },
  { clave: 'PENDIENTE', etiqueta: 'Pendientes' },
  { clave: 'PARCIAL', etiqueta: 'Pago parcial' },
  { clave: 'VENCIDA', etiqueta: 'Vencidas' },
  { clave: 'COBRADA', etiqueta: 'Cobradas' },
  { clave: 'ANULADA', etiqueta: 'Anuladas' },
];

const POR_PAGINA = 10;

function coincide(busqueda: string, f: Factura): boolean {
  const q = busqueda.trim().toLowerCase();
  if (!q) return true;
  return (
    f.numero.toLowerCase().includes(q) ||
    f.clienteNombre.toLowerCase().includes(q) ||
    f.clienteRuc.includes(q)
  );
}

const TH = 'px-5 py-3 text-left text-xs font-semibold text-muted-foreground';

export default function FacturasPage() {
  const location = useLocation();
  const { facturas, notasSueltas } = useFinanciero();
  const abrirInicial = (location.state as { abrir?: number } | null)?.abrir ?? null;

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'TODAS' | EstadoFactura>('TODAS');
  const [pagina, setPagina] = useState(1);
  const [seleccionId, setSeleccionId] = useState<number | null>(abrirInicial);
  const [subirAbierto, setSubirAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const filas = useMemo(
    () =>
      facturas.map((f) => ({
        f,
        estado: estadoDe(f),
        saldo: totalesFactura(f).saldo,
        dias: diasParaVencer(f),
      })),
    [facturas],
  );

  const conteos = useMemo(() => {
    const c: Record<string, number> = { TODAS: filas.length };
    for (const x of filas) c[x.estado] = (c[x.estado] ?? 0) + 1;
    return c;
  }, [filas]);

  const filtradas = useMemo(
    () =>
      filas
        .filter((x) => (filtro === 'TODAS' || x.estado === filtro) && coincide(busqueda, x.f))
        .sort(
          (a, b) =>
            b.f.fechaEmision.localeCompare(a.f.fechaEmision) ||
            b.f.numero.localeCompare(a.f.numero),
        ),
    [filas, filtro, busqueda],
  );

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  const seleccionada = seleccionId !== null ? facturas.find((f) => f.id === seleccionId) : undefined;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Facturas"
        descripcion="Facturas emitidas en Contífico, con su cobro y vencimiento."
      >
        <Boton onClick={() => setSubirAbierto(true)}>
          <Upload className="h-4 w-4" />
          Subir facturas
        </Boton>
      </EncabezadoPagina>

      {notasSueltas.length > 0 && (
        <Aviso tono="aviso" icono={<AlertTriangle className="h-4 w-4" />}>
          {notasSueltas.length === 1
            ? `La nota de crédito ${notasSueltas[0].numero} modifica la factura ${notasSueltas[0].facturaModificada}, que aún no está registrada.`
            : `Hay ${notasSueltas.length} notas de crédito cuya factura original aún no está registrada.`}{' '}
          Se aplicará sola cuando cargues esa factura.
        </Aviso>
      )}

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

      <Panel sinRelleno>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
            {FILTROS.map((fl) => (
              <button
                key={fl.clave}
                type="button"
                aria-pressed={filtro === fl.clave}
                onClick={() => {
                  setFiltro(fl.clave);
                  setPagina(1);
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filtro === fl.clave
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-card text-foreground hover:bg-muted',
                )}
              >
                {fl.etiqueta}
                <span
                  className={cn(
                    'fin-cifra text-xs',
                    filtro === fl.clave ? 'text-primary-foreground/75' : 'text-muted-foreground',
                  )}
                >
                  {conteos[fl.clave] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por número, cliente o RUC"
              aria-label="Buscar facturas"
              className={cn(inputCls, 'pl-9')}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className={TH}>Factura</th>
                <th className={TH}>Cliente</th>
                <th className={TH}>Emisión</th>
                <th className={TH}>Vencimiento</th>
                <th className={cn(TH, 'text-right')}>Total</th>
                <th className={cn(TH, 'text-right')}>Saldo</th>
                <th className={TH}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibles.map(({ f, estado, saldo, dias }) => (
                <tr
                  key={f.id}
                  tabIndex={0}
                  onClick={() => setSeleccionId(f.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSeleccionId(f.id);
                  }}
                  aria-label={`Ver la factura ${f.numero}`}
                  className="cursor-pointer transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="fin-codigo text-[13px] text-foreground">{f.numero}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {f.ordenTrabajo ? `Orden ${f.ordenTrabajo}` : 'Sin orden'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="max-w-64 truncate text-sm font-medium text-foreground">
                      {f.clienteNombre}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      RUC {f.clienteRuc}
                      {!f.clienteRegistrado && ', cliente no registrado'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm fin-cifra text-foreground">
                    {fmtFecha(f.fechaEmision)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm fin-cifra">
                    <div className="text-foreground">{fmtFecha(vencimientoDe(f))}</div>
                    {(estado === 'VENCIDA' || estado === 'PENDIENTE' || estado === 'PARCIAL') && (
                      <div
                        className={cn(
                          'mt-0.5 text-xs',
                          estado === 'VENCIDA' ? `font-semibold ${colorTexto.error}` : 'text-muted-foreground',
                        )}
                      >
                        {textoDias(dias)}
                      </div>
                    )}
                  </td>
                  <td className={cn('whitespace-nowrap px-5 py-3.5 text-sm text-foreground', cifraCls)}>
                    {fmtUSD(f.total)}
                  </td>
                  <td className={cn('whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-foreground', cifraCls)}>
                    {saldo > 0.005 ? fmtUSD(saldo) : <span className="font-normal text-muted-foreground">-</span>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <ChipEstadoFactura estado={estado} />
                    {estado === 'ANULADA' && f.creditos.length > 0 && (
                      <div className="mt-0.5 text-xs text-muted-foreground">Por nota de crédito</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <Inbox className="h-9 w-9 text-muted-foreground/60" />
            <div>
              <p className="text-sm font-semibold text-foreground">No hay facturas con estos filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cambia la búsqueda o el estado, o sube los XML de tus facturas.
              </p>
            </div>
            <Boton variant="outline" size="sm" onClick={() => setSubirAbierto(true)}>
              Subir facturas
            </Boton>
          </div>
        )}

        {filtradas.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border bg-muted px-5 py-3 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {(paginaActual - 1) * POR_PAGINA + 1} a{' '}
              {Math.min(paginaActual * POR_PAGINA, filtradas.length)} de {filtradas.length} facturas
            </span>
            <div className="flex items-center gap-1.5">
              <Boton
                variant="outline"
                size="sm"
                disabled={paginaActual === 1}
                onClick={() => setPagina(paginaActual - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Boton>
              <span className="px-2 fin-cifra">
                {paginaActual} de {totalPaginas}
              </span>
              <Boton
                variant="outline"
                size="sm"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPagina(paginaActual + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Boton>
            </div>
          </div>
        )}
      </Panel>

      <PanelLateral
        abierto={!!seleccionada}
        onCerrar={() => setSeleccionId(null)}
        titulo="Detalle de la factura"
      >
        {seleccionada && <DetalleFactura key={seleccionada.id} factura={seleccionada} />}
      </PanelLateral>

      {subirAbierto && (
        <SubirXmlModal
          onCerrar={() => setSubirAbierto(false)}
          onGuardado={(mensaje) => {
            setSubirAbierto(false);
            setFiltro('TODAS');
            setBusqueda('');
            setPagina(1);
            setAviso(mensaje);
          }}
        />
      )}
    </div>
  );
}
