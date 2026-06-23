import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, UsersRound } from 'lucide-react';
import Navbar from '../../shared/components/organisms/Navbar';

export const UsuariosLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Menú depurado: Solo lo que realmente usas
    const menuItems = [
        { name: 'Usuarios', path: '/usuarios', icon: <Users className="w-4 h-4" /> },
        { name: 'Grupos', path: '/usuarios/grupos', icon: <UsersRound className="w-4 h-4" /> },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Menú Lateral Modernizado */}
                <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm z-10">
                    <div className="px-6 py-5 border-b border-border flex items-center gap-2 text-foreground font-bold text-sm tracking-wide">
                        <Users className="w-5 h-5 text-primary" />
                        Gestión de Usuarios
                    </div>
                    
                    <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || 
                                           (item.path === '/usuarios' && location.pathname.startsWith('/usuarios/nuevo')) ||
                                           (item.path === '/usuarios' && location.pathname.startsWith('/usuarios/editar'));
                            
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
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

                {/* Contenido Principal */}
                <main className="flex-1 overflow-y-auto bg-muted/30">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};