import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, UsersRound, ShieldBan, Clock, BarChart2, Smartphone, FileText } from 'lucide-react';
import Navbar from '../../shared/components/organisms/Navbar';

export const UsuariosLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Usuarios', path: '/usuarios', icon: <Users className="w-4 h-4" /> },
        { name: 'Grupos', path: '/usuarios/grupos', icon: <UsersRound className="w-4 h-4" /> },
        { name: 'Bloqueos de acceso', path: '/usuarios/bloqueos', icon: <ShieldBan className="w-4 h-4" /> },
        { name: 'Sesiones', path: '/usuarios/sesiones', icon: <Clock className="w-4 h-4" /> },
        { name: 'Estadísticas', path: '/usuarios/estadisticas', icon: <BarChart2 className="w-4 h-4" />, divider: true },
        { name: 'Estadísticas mobile', path: '/usuarios/estadisticas-mobile', icon: <Smartphone className="w-4 h-4" /> },
        { name: 'Log móvil', path: '/usuarios/log-movil', icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Menú Lateral */}
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2 text-gray-700 font-semibold text-sm">
                        <Users className="w-5 h-5 text-gray-500" />
                        Gestión de Usuarios
                    </div>
                    <nav className="flex-1 py-4 flex flex-col gap-1">
                        {menuItems.map((item, index) => {
                            // Para marcar como activo si la ruta coincide
                            const isActive = location.pathname === item.path || (item.path === '/usuarios' && location.pathname.startsWith('/usuarios/nuevo'));
                            
                            return (
                                <div key={item.name}>
                                    {item.divider && <div className="border-t border-gray-200 my-2"></div>}
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-3 px-6 py-2 text-sm transition-colors ${
                                            isActive 
                                                ? 'bg-[#f5f9fc] text-[#2185d0] border-r-2 border-[#2185d0] font-medium' 
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#2185d0]'
                                        }`}
                                    >
                                        <span className={isActive ? 'text-[#2185d0]' : 'text-[#2185d0]'}>{item.icon}</span>
                                        {item.name}
                                    </button>
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                {/* Contenido Principal (Aquí se inyectan las vistas hijas) */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};