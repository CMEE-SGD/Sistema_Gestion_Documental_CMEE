import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../../../shared/components/organisms/Navbar';
import { LayoutUIContext } from '../../../shared/context/LayoutUIContext';
import SideBarRRHH from './SideBarRRHH'

export const RRHHLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = useCallback(() => setMobileOpen(prev => !prev), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <LayoutUIContext.Provider value={{ toggleSidebar }}>
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar Superior Global */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Barra Lateral Exclusiva de RRHH */}
        <div className="hidden lg:flex shrink-0">
          <SideBarRRHH />
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl overflow-y-auto">
              <SideBarRRHH mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Contenido Dinámico de las Páginas de RRHH */}
        <main className="flex-1 overflow-y-auto bg-gray-50 flex justify-center">
          <div className="w-full max-w-7xl p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </LayoutUIContext.Provider>
  );
};

export default RRHHLayout;