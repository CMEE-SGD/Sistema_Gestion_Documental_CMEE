import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Package, TriangleAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../shared/components/organisms/Navbar';
import { LayoutUIContext } from '../../shared/context/LayoutUIContext';
import api from '../../core/api/axios';
import { esUsuarioAdministrador, tienePermiso } from '../../shared/utils/auth';

/**
 * Módulo de inventario de insumos y materiales (aplicación 'Inventario').
 * Independiente de los demás módulos: hoy se registran entradas, salidas y
 * ajustes a mano; la integración con Egresos y órdenes de trabajo queda
 * prevista a nivel de datos para una futura ampliación.
 */
export const InventarioLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => setMobileOpen((prev) => !prev), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Badge de productos bajo stock. Solo se consulta si el usuario tiene
  // permiso de lectura: el interceptor de axios redirige a /403 en caso
  // contrario, y un simple badge no debe provocar esa salida.
  const puedeVer = esUsuarioAdministrador() || tienePermiso('Inventario', 1);
  const { data: alertas } = useQuery({
    queryKey: ['inventario-alertas'],
    queryFn: async () => {
      const res = await api.get('/inventario/alertas');
      return res.data as { total: number; productos: unknown[] };
    },
    enabled: puedeVer,
  });
  const totalAlertas = alertas?.total ?? 0;

  const menuItems = [
    {
      name: 'Productos',
      path: '/inventario/productos',
      icon: <Package className="w-4 h-4" />,
      badge: totalAlertas,
    },
    {
      name: 'Movimientos',
      path: '/inventario/movimientos',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      badge: 0,
    },
  ];

  const Sidebar = ({
    mobile = false,
    onNavigate,
  }: {
    mobile?: boolean;
    onNavigate?: () => void;
  }) => (
    <aside
      className={`w-64 bg-card border-r border-border flex flex-col shadow-sm z-10 ${mobile ? 'h-full' : ''}`}
    >
      <div className="px-6 py-5 border-b border-border flex items-center gap-2 text-foreground font-bold text-sm tracking-wide">
        <Package className="w-5 h-5 text-primary" />
        Insumos y Materiales
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                onNavigate?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                  <TriangleAlert className="w-3 h-3" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
        Stock con kardex: cada entrada, salida y ajuste queda registrado.
      </div>
    </aside>
  );

  return (
    <LayoutUIContext.Provider value={{ toggleSidebar }}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:flex shrink-0">
            <Sidebar />
          </div>

          {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
              <div className="absolute left-0 top-0 w-64 bg-card shadow-xl h-full overflow-y-auto">
                <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 md:p-6 min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </LayoutUIContext.Provider>
  );
};
