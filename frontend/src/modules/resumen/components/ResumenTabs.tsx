import { NavLink } from 'react-router-dom';
import { Users, FlaskConical } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';

// Módulo Resumen: agrupa todos los dashboards del sistema, separados por
// cliente y por laboratorio. Visible para cualquier usuario autenticado.
export default function ResumenTabs() {
  const tabs = [
    {
      label: 'Clientes',
      path: '/resumen/clientes',
      icon: Users,
    },
    {
      label: 'Laboratorios',
      path: '/resumen/laboratorios',
      icon: FlaskConical,
    },
  ];

  return (
    <nav className="border-b border-dashed border-border bg-background px-6">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium tracking-wide transition-colors',
                  isActive
                    ? 'border-[#A67C3D] text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
