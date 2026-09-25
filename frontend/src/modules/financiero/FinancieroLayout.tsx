import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Check,
  Download,
  Info,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Trash2,
  Upload,
  Wallet,
} from 'lucide-react';
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource/ibm-plex-mono/500.css';
import './tema.css';
import Navbar from '../../shared/components/organisms/Navbar';
import { LayoutUIContext } from '../../shared/context/LayoutUIContext';
import { leerCopia } from './almacenamiento';
import { FinancieroProvider, useFinanciero } from './FinancieroContext';
import { HOY, fmtFecha } from './formato';
import { Aviso, Boton, Modal, type Tono } from './ui';

const MENU = [
  { nombre: 'Resumen', ruta: '/financiero/dashboard', icono: LayoutDashboard },
  { nombre: 'Facturas', ruta: '/financiero/facturas', icono: Receipt },
  { nombre: 'Egresos', ruta: '/financiero/egresos', icono: Wallet },
  { nombre: 'Reglas y supuestos', ruta: '/financiero/reglas', icono: ListChecks },
];

const CLAVE_AVISO_CERRADO = 'sgd-financiero-aviso-cerrado';

// Lo que hay que confirmar antes de perder los datos actuales.
type Confirmacion = { tipo: 'vaciar' } | { tipo: 'cargar'; contenido: string };

function Contenido() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vacio, errorGuardado, exportarCopia, importarCopia, vaciar } = useFinanciero();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mensaje, setMensaje] = useState<{ tono: Tono; texto: string } | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [avisoCerrado, setAvisoCerrado] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_AVISO_CERRADO) === '1';
    } catch {
      return false;
    }
  });
  const entradaCopia = useRef<HTMLInputElement>(null);

  const toggleSidebar = useCallback(() => setMobileOpen((prev) => !prev), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const cerrarAviso = () => {
    setAvisoCerrado(true);
    try {
      localStorage.setItem(CLAVE_AVISO_CERRADO, '1');
    } catch {
      // Sin almacenamiento: el aviso reaparecerá en la próxima visita.
    }
  };

  const guardarCopia = () => {
    const nombre = `financiero-cmee-${HOY}.json`;
    const url = URL.createObjectURL(new Blob([exportarCopia()], { type: 'application/json' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    setMensaje({ tono: 'ok', texto: `Copia guardada como ${nombre}.` });
  };

  const alElegirCopia = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    const contenido = await archivo.text();
    // Una copia dañada se rechaza de inmediato, sin preguntar antes por el reemplazo.
    const lectura = leerCopia(contenido);
    if (!lectura.ok) {
      setMensaje({ tono: 'error', texto: lectura.mensaje });
    } else if (vacio) {
      aplicarCopia(contenido);
    } else {
      setConfirmacion({ tipo: 'cargar', contenido });
    }
  };

  const aplicarCopia = (contenido: string) => {
    const error = importarCopia(contenido);
    setMensaje(
      error
        ? { tono: 'error', texto: error }
        : { tono: 'ok', texto: 'Copia cargada. Reemplazó los datos que había.' },
    );
  };

  const confirmar = () => {
    if (confirmacion?.tipo === 'cargar') {
      aplicarCopia(confirmacion.contenido);
    } else if (confirmacion?.tipo === 'vaciar') {
      vaciar();
      setMensaje({ tono: 'ok', texto: 'Se vació todo. Puedes empezar a cargar de nuevo.' });
    }
    setConfirmacion(null);
  };

  const accionMenu =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-[var(--fin-menu-texto)] transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-40';

  const Sidebar = ({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) => (
    <aside
      className={`flex w-64 flex-col bg-[var(--fin-navy-profundo)] text-[var(--fin-menu-texto)] ${mobile ? 'h-full' : ''}`}
    >
      <div className="px-6 pb-6 pt-7">
        <div className="fin-display text-[1.9rem] font-bold leading-[0.95] text-white">
          Gestión
          <br />
          Financiera
        </div>
        <p className="mt-2 text-xs text-[var(--fin-menu-tenue)]">Proyecto de Metrología</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Módulo financiero">
        {MENU.map((item) => {
          const activo = location.pathname.startsWith(item.ruta);
          const Icono = item.icono;
          return (
            <button
              key={item.nombre}
              type="button"
              aria-current={activo ? 'page' : undefined}
              onClick={() => {
                navigate(item.ruta);
                onNavigate?.();
              }}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                activo
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[var(--fin-menu-texto)] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              {activo && (
                <span
                  className="absolute -left-3 bottom-2 top-2 w-[3px] rounded-r bg-[var(--fin-oro)]"
                  aria-hidden
                />
              )}
              <Icono className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {item.nombre}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-3 py-4">
        <p className="px-3 pb-1.5 text-xs font-semibold text-[var(--fin-menu-tenue)]">
          Copia de seguridad
        </p>
        <button type="button" className={accionMenu} onClick={guardarCopia}>
          <Download className="h-4 w-4" strokeWidth={1.75} />
          Guardar copia
        </button>
        <button type="button" className={accionMenu} onClick={() => entradaCopia.current?.click()}>
          <Upload className="h-4 w-4" strokeWidth={1.75} />
          Cargar copia
        </button>
        <button
          type="button"
          className={accionMenu}
          disabled={vacio}
          onClick={() => setConfirmacion({ tipo: 'vaciar' })}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          Vaciar todo
        </button>
        <p className="mt-3 px-3 text-xs text-[var(--fin-menu-tenue)]">Hoy, {fmtFecha(HOY)}</p>
      </div>
    </aside>
  );

  return (
    <LayoutUIContext.Provider value={{ toggleSidebar }}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="tema-financiero flex flex-1 overflow-hidden bg-background">
          <div className="hidden shrink-0 lg:flex">
            <Sidebar />
          </div>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-[#0e1a2b]/55" onClick={() => setMobileOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto shadow-xl">
                <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1360px] space-y-6 px-5 py-6 md:px-8 md:py-8">
              {errorGuardado && (
                <Aviso
                  tono="error"
                  accion={
                    <Boton variant="outline" size="sm" className="shrink-0" onClick={guardarCopia}>
                      Guardar copia
                    </Boton>
                  }
                >
                  El navegador no dejó guardar los últimos cambios (almacenamiento lleno o bloqueado).
                  Guarda una copia ahora para no perderlos.
                </Aviso>
              )}
              {!avisoCerrado && (
                <Aviso
                  tono="info"
                  icono={<Info className="h-4 w-4" />}
                  accion={
                    <button
                      type="button"
                      onClick={cerrarAviso}
                      className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Entendido
                    </button>
                  }
                >
                  Maqueta sin conexión al servidor. Lo que cargues se guarda solo en este navegador:
                  guarda una copia de vez en cuando.
                </Aviso>
              )}
              {mensaje && (
                <Aviso
                  tono={mensaje.tono}
                  icono={mensaje.tono === 'ok' ? <Check className="h-4 w-4" /> : undefined}
                  accion={
                    <button
                      type="button"
                      onClick={() => setMensaje(null)}
                      className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Cerrar
                    </button>
                  }
                >
                  {mensaje.texto}
                </Aviso>
              )}
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Fuera de la barra lateral: esa se vuelve a montar en cada render y perdería la selección. */}
      <input
        ref={entradaCopia}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        tabIndex={-1}
        aria-label="Elegir una copia guardada"
        onChange={alElegirCopia}
      />

      {confirmacion && (
        <div className="tema-financiero">
          <Modal
            isOpen
            onClose={() => setConfirmacion(null)}
            title={confirmacion.tipo === 'vaciar' ? 'Vaciar todo' : 'Cargar esta copia'}
            ancho="max-w-lg"
          >
            <p className="text-sm leading-6 text-foreground">
              {confirmacion.tipo === 'vaciar'
                ? 'Se borran todas las facturas, notas de crédito, cobros, egresos, la devolución de anticipo y las marcas de Reglas. No se puede deshacer.'
                : 'La copia reemplaza todo lo que hay cargado ahora. No se puede deshacer.'}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Si dudas, cancela y usa «Guardar copia» antes.
            </p>
            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <Boton variant="outline" onClick={() => setConfirmacion(null)}>
                Cancelar
              </Boton>
              <Boton variant="destructive" onClick={confirmar}>
                {confirmacion.tipo === 'vaciar' ? 'Sí, vaciar todo' : 'Sí, reemplazar'}
              </Boton>
            </div>
          </Modal>
        </div>
      )}
    </LayoutUIContext.Provider>
  );
}

export const FinancieroLayout = () => (
  <FinancieroProvider>
    <Contenido />
  </FinancieroProvider>
);
