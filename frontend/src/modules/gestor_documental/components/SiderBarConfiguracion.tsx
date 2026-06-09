import { NavLink } from 'react-router-dom';
import { Layers, FolderKanban, SlidersHorizontal, GitBranch, ArrowLeft } from 'lucide-react';

const menuItems = [
    { name: 'Librerías', path: '/gestordocumental/configuracion', icon: Layers, end: true },
    { name: 'Áreas', path: '/gestordocumental/configuracion/areas', icon: FolderKanban },
    { name: 'Carpetas', path: '/gestordocumental/configuracion/carpetas', icon: SlidersHorizontal },
    { name: 'Circuitos', path: '/gestordocumental/configuracion/circuitos', icon: GitBranch },
];

const SiderBarConfiguracion = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
            {/* Cabecera para regresar al Gestor Principal */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <NavLink
                    to="/gestordocumental"
                    className="text-xs font-bold flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-wider"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Gestor
                </NavLink>
                <h3 className="text-sm font-bold text-gray-800 mt-3 uppercase tracking-wide">
                    Administración
                </h3>
            </div>
            
            <nav className="flex-1 py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                }
                            >
                                {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                                <span className="truncate">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default SiderBarConfiguracion;