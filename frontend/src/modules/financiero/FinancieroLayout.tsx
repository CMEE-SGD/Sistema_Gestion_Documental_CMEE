import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { CalendarClock, ClipboardList, FileText, Receipt, Wallet } from 'lucide-react';
import Navbar from '../../shared/components/organisms/Navbar';
import { LayoutUIContext } from '../../shared/context/LayoutUIContext';

/**
 * Módulo financiero independiente (aplicación 'Gestion Financiera').
 * Ligado a la recepción de equipos solo por sus datos: proformas
 * vinculadas a órdenes de trabajo y fechas de calibración que alimentan
 * las alertas de próximas calibraciones.
 */
export const FinancieroLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleSidebar = useCallback(() => setMobileOpen(prev => !prev), []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const menuItems = [
        { name: 'Proformas', path: '/financiero/proformas', icon: <FileText className="w-4 h-4" /> },
        { name: 'Facturación', path: '/financiero/facturas', icon: <Receipt className="w-4 h-4" /> },
        { name: 'Órdenes de trabajo', path: '/financiero/ordenes', icon: <ClipboardList className="w-4 h-4" /> },
        { name: 'Cartera', path: '/financiero/cartera', icon: <Wallet className="w-4 h-4" /> },
        { name: 'Próx. calibraciones', path: '/financiero/proximas-calibraciones', icon: <CalendarClock className="w-4 h-4" /> },
    ];

    const Sidebar = ({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) => (
        <aside className={`w-64 bg-card border-r border-border flex flex-col shadow-sm z-10 ${mobile ? 'h-full' : ''}`}>
            <div className="px-6 py-5 border-b border-border flex items-center gap-2 text-foreground font-bold text-sm tracking-wide">
                <Wallet className="w-5 h-5 text-primary" />
                Gestión Financiera
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.name}
                            onClick={() => { navigate(item.path); onNavigate?.(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                                {item.icon}
                            </span>
                            {item.name}
                        </button>
                    );
                })}
            </nav>
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
                        <div className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl overflow-y-auto">
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