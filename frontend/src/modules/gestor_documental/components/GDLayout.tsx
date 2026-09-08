import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../../../shared/components/organisms/Navbar';
import { LayoutUIContext } from '../../../shared/context/LayoutUIContext';
import SidebarGestorDocumental  from './SidebarGestorDocumental';
export const GestorDocumentalLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = useCallback(() => setMobileOpen(prev => !prev), []);

    // Cierra el drawer al cambiar de ruta (navegación interna del sidebar).
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <LayoutUIContext.Provider value={{ toggleSidebar }}>
        <div className="flex flex-col min-h-screen bg-gray-50">

        {/* 1. Barra de navegación superior fija */}
        <Navbar />

        {/* 2. Contenedor inferior (Sidebar + Contenido) */}
        <div className="flex flex-1 overflow-hidden">

            {/* Menú lateral: escritorio (siempre visible) */}
            <div className="hidden lg:flex shrink-0">
                <SidebarGestorDocumental />
            </div>

            {/* Menú lateral: móvil (off-canvas) */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl overflow-y-auto">
                        <SidebarGestorDocumental mobile onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Contenedor principal donde se renderizan las vistas dinámicas */}
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>

        </div>
        </LayoutUIContext.Provider>
    );
};