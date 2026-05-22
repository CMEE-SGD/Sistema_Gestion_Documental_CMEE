import { NavLink } from 'react-router-dom';
import { Building2, Briefcase, Shield, Users, Settings } from 'lucide-react';

const menuItems = [
    { name: 'Grupos de organización', path: '/rrhh/grupos', icon: Building2 },
    { name: 'Puestos', path: '/rrhh/puestos', icon: Briefcase },
    { name: 'Roles', path: '/rrhh/roles', icon: Shield },
    { name: 'Personas', path: '/rrhh/personas', icon: Users },
    { name: 'Personalización', path: '/rrhh/personalizacion', icon: Settings },
    ];

    export const SidebarRRHH = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
        <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Recursos Humanos
            </h2>
        </div>
        
        <nav className="flex-1 py-4">
            <ul className="space-y-1">
            {menuItems.map((item) => (
                <li key={item.path}>
                <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                    }
                >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                </NavLink>
                </li>
            ))}
            </ul>
        </nav>
        </aside>
    );
};