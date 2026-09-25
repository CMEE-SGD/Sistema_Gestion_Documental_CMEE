import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  Upload,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';
import { useFinanciero } from '../FinancieroContext';
import { diasParaVencer, estadoDe, totalesFactura, vencimientoDe } from '../calculos';
import { fmtFecha, fmtUSD, textoDias } from '../formato';
import type { EstadoFactura, Factura } from '../tipos';
import {
  Aviso,
  Boton,
  ChipEstadoFactura,
  ETIQUETA_COBRO,
  EncabezadoPagina,
  Panel,
  PanelLateral,
  cifraCls,
  colorTexto,
  inputCls,
} from '../ui';
import DetalleFactura from '../componentes/DetalleFactura';
import RegistrarCobroModal from '../componentes/RegistrarCobroModal';
import SubirXmlModal from '../componentes/SubirXmlModal';

const FILTROS: Array<{ clave: 'TODAS' | EstadoFactura; etiqueta: string }> = [
  { clave: 'TODAS', etiqueta: 'Todas' },
  { clave: 'PENDIENTE', etiqueta: 'Pendientes' },
  { clave: 'PARCIAL', etiqueta: 'Pago parcial' },
  { clave: 'VENCIDA', etiqueta: 'Vencidas' },
  { clave: 'COBRADA', etiqueta: 'Cobradas' },
  { clave: 'ANULADA', etiqueta: 'Anuladas' },
];

const POR_PAGINA = 25;

type Fila = { f: Factura; estado: EstadoFactura; saldo: number; dias: number };
type ClaveOrden = 'factura' | 'cliente' | 'emision' | 'vencimiento' | 'total' | 'saldo';
type Orden = { clave: ClaveOrden; dir: 'asc' | 'desc' };

// Al elegir una columna por primera vez se ordena como lo pediría quien la usa:
// lo más atrasado primero en Vencimiento, lo más grande primero en importes.
const DIR_INICIAL: Record<ClaveOrden, Orden['dir']> = {
  factura: 'desc',
  cliente: 'asc',
  emision: 'desc',
  vencimiento: 'asc',
  total: 'desc',
  saldo: 'desc',
};

function valorDeOrden(x: Fila, clave: ClaveOrden): string | number {
  switch (clave) {
    case 'factura':
      return x.f.numero;
    case 'cliente':
      return x.f.clienteNombre;
    case 'emision':
      return x.f.fechaEmision;
    case 'vencimiento':
      return vencimientoDe(x.f);
    case 'total':
      return x.f.total;
    case 'saldo':
      return x.saldo;
  }
}

function coincide(busqueda: string, f: Factura): boolean {
  const q = busqueda.trim().toLowerCase();
  if (!q) return true;
  return (
    f.numero.toLowerCase().includes(q) ||
    f.clienteNombre.toLowerCase().includes(q) ||
    f.clienteRuc.includes(q)
  );
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-muted-foreground';

// Encabezado que ordena la tabla. El botón lleva el nombre de la columna y
// `aria-sort` avisa a los lectores de pantalla cuál columna manda.
function EncabezadoOrdenable({
  clave,
  orden,
  onOrdenar,
  derecha,
  className,
  children,
}: {
  clave: ClaveOrden;
  orden: Orden;
  onOrdenar: (clave: ClaveOrden) => void;
  derecha?: boolean;
  className?: string;
  children: string;
}) {
  const activa = orden.clave === clave;
  const Icono = !activa ? ArrowUpDown : orden.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={activa ? (orden.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn(TH, derecha && 'text-right', className)}
    >
      <button
        type="button"
        onClick={() => onOrdenar(clave)}
        className={cn(
          '-mx-1.5 -my-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-semibold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          activa ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {children}
        <Icono className={cn('h-3.5 w-3.5', activa ? 'opacity-100' : 'opacity-60')} aria-hidden />
      </button>
    </th>
  );
}

export default function FacturasPage() {
  const location = useLocation();
  const { facturas, notasSueltas, registrarCobro } = useFinanciero();
  const estadoDeRuta = location.state as { abrir?: number; subir?: boolean } | null;
  const abrirInicial = estadoDeRuta?.abrir ?? null;

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'TODAS' | EstadoFactura>('TODAS');
  const [pagina, setPagina] = useState(1);
  const [orden, setOrden] = useState<Orden>({ clave: 'emision', dir: 'desc' });
  const [seleccionId, setSeleccionId] = useState<number | null>(abrirInicial);
  const [cobrarId, setCobrarId] = useState<number | null>(null);
  // Se abre sola cuando se llega desde el botón "Subir facturas" del Resumen.
  const [subirAbierto, setSubirAbierto] = useState(estadoDeRuta?.subir === true);
  const [aviso, setAviso] = useState<string | null>(null);

  const ordenarPor = (clave: ClaveOrden) => {
    setOrden((o) =>
      o.clave === clave
        ? { clave, dir: o.dir === 'asc' ? 'desc' : 'asc' }
        : { clave, dir: DIR_INICIAL[clave] },
    );
    setPagina(1);
  };

  const filas = useMemo<Fila[]>(
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
        .sort((a, b) => {
          const va = valorDeOrden(a, orden.clave);
          const vb = valorDeOrden(b, orden.clave);
          const cmp =
            typeof va === 'number' && typeof vb === 'number'
              ? va - vb
              : String(va).localeCompare(String(vb), 'es');
          // Ante empates, lo más reciente primero.
          return (
            (orden.dir === 'asc' ? cmp : -cmp) ||
            b.f.fechaEmision.localeCompare(a.f.fechaEmision) ||
            b.f.numero.localeCompare(a.f.numero)
          );
        }),
    [filas, filtro, busqueda, orden],
  );

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  const seleccionada = seleccionId !== null ? facturas.find((f) => f.id === seleccionId) : undefined;
  const aCobrar = cobrarId !== null ? filas.find((x) => x.f.id === cobrarId) : undefined;
  const sinFacturas = facturas.length === 0;

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

      {sinFacturas && (
        <Panel>
          <div className="flex flex-col items-center gap-4 px-2 py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/60" />
            <div className="max-w-md">
              <p className="text-base font-semibold text-foreground">Todavía no hay facturas</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Sube los XML autorizados del SRI, los de facturas y los de notas de crédito. Cada
                factura aparece aquí con su cobro y su vencimiento.
              </p>
            </div>
            <Boton onClick={() => setSubirAbierto(true)}>
              <Upload className="h-4 w-4" />
              Subir facturas
            </Boton>
          </div>
        </Panel>
      )}

      {!sinFacturas && (
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

        {/* `relative`: el texto oculto (sr-only) de la tabla queda recortado aquí y no ensancha la página. */}
        <div className="relative overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <EncabezadoOrdenable clave="factura" orden={orden} onOrdenar={ordenarPor}>
                  Factura
                </EncabezadoOrdenable>
                <EncabezadoOrdenable clave="cliente" orden={orden} onOrdenar={ordenarPor}>
                  Cliente
                </EncabezadoOrdenable>
                <EncabezadoOrdenable
                  clave="emision"
                  orden={orden}
                  onOrdenar={ordenarPor}
                  className="hidden min-[1400px]:table-cell"
                >
                  Emisión
                </EncabezadoOrdenable>
                <EncabezadoOrdenable clave="vencimiento" orden={orden} onOrdenar={ordenarPor}>
                  Vencimiento
                </EncabezadoOrdenable>
                <EncabezadoOrdenable clave="total" orden={orden} onOrdenar={ordenarPor} derecha>
                  Total
                </EncabezadoOrdenable>
                <EncabezadoOrdenable clave="saldo" orden={orden} onOrdenar={ordenarPor} derecha>
                  Saldo
                </EncabezadoOrdenable>
                <th scope="col" className={TH}>
                  Estado
                </th>
                <th scope="col" className={cn(TH, 'sticky right-0 bg-muted')}>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibles.map(({ f, estado, saldo, dias }) => (
                <tr
                  key={f.id}
                  tabIndex={0}
                  onClick={() => setSeleccionId(f.id)}
                  onKeyDown={(e) => {
                    // Enter sobre el botón "Cobrar" no debe abrir además el detalle.
                    if (e.key === 'Enter' && e.target === e.currentTarget) setSeleccionId(f.id);
                  }}
                  aria-label={`Ver la factura ${f.numero}`}
                  className="group cursor-pointer transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="fin-codigo text-[13px] text-foreground">{f.numero}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {f.ordenTrabajo ? `Orden ${f.ordenTrabajo}` : 'Sin orden'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div
                      title={f.clienteNombre}
                      className="line-clamp-2 min-w-52 max-w-80 text-sm font-medium leading-5 text-foreground"
                    >
                      {f.clienteNombre}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      RUC {f.clienteRuc}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm fin-cifra text-foreground min-[1400px]:table-cell">
                    {fmtFecha(f.fechaEmision)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-sm fin-cifra">
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
                  <td className={cn('whitespace-nowrap px-4 py-3.5 text-sm text-foreground', cifraCls)}>
                    {fmtUSD(f.total)}
                  </td>
                  <td className={cn('whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-foreground', cifraCls)}>
                    {saldo > 0.005 ? fmtUSD(saldo) : <span className="font-normal text-muted-foreground">-</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <ChipEstadoFactura estado={estado} />
                    {estado === 'ANULADA' && f.creditos.length > 0 && (
                      <div className="mt-0.5 text-xs text-muted-foreground">Por nota de crédito</div>
                    )}
                  </td>
                  {/* Fija al borde derecho: "Cobrar" queda a la vista aunque la tabla se desplace. */}
                  <td className="sticky right-0 whitespace-nowrap bg-card px-4 py-3.5 text-right transition-colors group-hover:bg-muted group-focus-visible:bg-muted">
                    {saldo > 0.005 && !f.anulada && (
                      <Boton
                        variant="outline"
                        size="sm"
                        aria-label={`Registrar un cobro de la factura ${f.numero}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCobrarId(f.id);
                        }}
                      >
                        <Banknote className="h-3.5 w-3.5" />
                        Cobrar
                      </Boton>
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
      )}

      <PanelLateral
        abierto={!!seleccionada}
        onCerrar={() => setSeleccionId(null)}
        titulo="Detalle de la factura"
      >
        {seleccionada && <DetalleFactura key={seleccionada.id} factura={seleccionada} />}
      </PanelLateral>

      {aCobrar && (
        <RegistrarCobroModal
          factura={aCobrar.f}
          saldo={aCobrar.saldo}
          onCerrar={() => setCobrarId(null)}
          onGuardar={(cobro) => {
            registrarCobro(aCobrar.f.id, cobro);
            setCobrarId(null);
            setAviso(
              `${ETIQUETA_COBRO[cobro.tipo]} de ${fmtUSD(cobro.monto)} registrado en la factura ${aCobrar.f.numero}.`,
            );
          }}
        />
      )}

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
