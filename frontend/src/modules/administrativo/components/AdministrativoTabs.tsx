import { NavLink } from 'react-router-dom';
import {
  Award,
  BarChart3,
  ClipboardList,
  FileText,
  Inbox,
  Users,
} from 'lucide-react';
import { tienePermiso } from '../../../shared/utils/auth';
import { cn } from '../../../shared/utils/utils';

// Pestañas del módulo administrativo (recepción de equipos, certificados y
// reportes) que comparten el permiso de lectura ('Recepcion Equipos',
// nivel 1). El tema financiero es un módulo independiente ('Gestion
// Financiera') con sus propias rutas en /financiero/*. Clientes no tiene
// AccessGuard en el backend (solo JwtAuthGuard), por eso siempre es visible
// para cualquier usuario autenticado.
export default function AdministrativoTabs() {
  const puedeVerModulo = tienePermiso('Recepcion Equipos', 1);

  const tabs = [
    {
      label: 'Recepción de equipos',
      path: '/administrativo/recepciones',
      icon: Inbox,
      visible: puedeVerModulo,
    },
    {
      label: 'Órdenes',
      path: '/administrativo/ordenes',
      icon: ClipboardList,
      visible: puedeVerModulo,
    },
    {
      label: 'Proformas',
      path: '/administrativo/proformas',
      icon: FileText,
      visible: puedeVerModulo,
    },
    {
      label: 'Clientes',
      path: '/administrativo/clientes',
      icon: Users,
      visible: true,
    },
    {
      label: 'Certificados',
      path: '/administrativo/certificados',
      icon: Award,
      visible: puedeVerModulo,
    },
    {
      label: 'Reportes',
      path: '/administrativo/reportes',
      icon: BarChart3,
      visible: puedeVerModulo,
    },
  ].filter((tab) => tab.visible);

  if (tabs.length === 0) return null;

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
