import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FlaskConical,
  LayoutDashboard,
  ListChecks,
  Receipt,
  RotateCcw,
  Wallet,
} from 'lucide-react';
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource/ibm-plex-mono/500.css';
import './tema.css';
import Navbar from '../../shared/components/organisms/Navbar';
import { LayoutUIContext } from '../../shared/context/LayoutUIContext';
import { FinancieroDemoProvider, useFinanciero } from './FinancieroDemoContext';
import { HOY, fmtFecha } from './formato';
import { Aviso, Boton } from './ui';

const MENU = [
  { nombre: 'Resumen', ruta: '/financiero/dashboard', icono: LayoutDashboard },
  { nombre: 'Facturas', ruta: '/financiero/facturas', icono: Receipt },
  { nombre: 'Egresos', ruta: '/financiero/egresos', icono: Wallet },
  { nombre: 'Reglas y supuestos', ruta: '/financiero/reglas', icono: ListChecks },
];

function Contenido() {
  const navigate = useNavigate();
  const location = useLocation();
  const { restablecer } = useFinanciero();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => setMobileOpen((prev) => !prev), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
      <div className="border-t border-white/10 px-6 py-4 text-xs text-[var(--fin-menu-tenue)]">
        Corte de la maqueta: {fmtFecha(HOY)}
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
              <Aviso
                tono="aviso"
                icono={<FlaskConical className="h-4 w-4" />}
                accion={
                  <Boton variant="outline" size="sm" className="shrink-0" onClick={restablecer}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restablecer datos
                  </Boton>
                }
              >
                Maqueta con datos de demostración. Son reales solo las facturas 262 a 265 y la nota
                de crédito 010, que se agregan desde Subir facturas.
              </Aviso>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </LayoutUIContext.Provider>
  );
}

export const FinancieroLayout = () => (
  <FinancieroDemoProvider>
    <Contenido />
  </FinancieroDemoProvider>
);
