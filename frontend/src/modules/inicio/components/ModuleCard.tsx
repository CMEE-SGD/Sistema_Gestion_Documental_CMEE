import { useNavigate } from 'react-router-dom';
// 👇 Usamos la librería élite de íconos que ya tienes instalada
import { Users, FileStack, ShieldCheck, FlaskConical, LayoutDashboard, BriefcaseBusiness, ClipboardList, ClipboardCheck } from 'lucide-react';

// Mapeo de íconos y colores suaves (usando opacidad para fondos)
const getModuleStyle = (name: string) => {
    switch (name) {
        case 'Gestion de Usuarios':
            return { icon: Users, colorClass: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100' };
        case 'Recursos Humanos':
            return { icon: BriefcaseBusiness, colorClass: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100' };
        case 'Gestor Documental':
            return { icon: FileStack, colorClass: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100' };
        case 'Auditoria Global':
            return { icon: ShieldCheck, colorClass: 'text-rose-600 bg-rose-50 group-hover:bg-rose-100' };
        case 'Laboratorios':
            return { icon: FlaskConical, colorClass: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100' };
        case 'Recepcion Equipos':
            return { icon: ClipboardList, colorClass: 'text-cyan-600 bg-cyan-50 group-hover:bg-cyan-100' };
        case 'Gestion de Calidad':
            return { icon: ClipboardCheck, colorClass: 'text-teal-600 bg-teal-50 group-hover:bg-teal-100' };
        case 'Resumen':
            return { icon: LayoutDashboard, colorClass: 'text-slate-600 bg-slate-50 group-hover:bg-slate-100' };
        default:
            return { icon: LayoutDashboard, colorClass: 'text-gray-600 bg-gray-50 group-hover:bg-gray-100' };
    }
};

interface ModuleCardProps {
    mod: { id: number | string; name: string; path: string; };
}

const ModuleCard = ({ mod }: ModuleCardProps) => {
    const navigate = useNavigate();
    const { icon: Icon, colorClass } = getModuleStyle(mod.name);

    return (
        <button
            onClick={() => navigate(mod.path)}
            className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 gap-4 w-40 group"
        >
            {/* Contenedor del ícono con fondo suave y efecto de escala */}
            <div className={`p-4 rounded-xl transition-all duration-300 group-hover:scale-110 ${colorClass}`}>
                <Icon strokeWidth={1.5} className="w-9 h-9" />
            </div>
            
            {/* Texto con color institucional */}
            <span className="text-sm font-semibold text-foreground text-center leading-tight group-hover:text-primary transition-colors">
                {mod.name}
            </span>
        </button>
    );
};

export default ModuleCard;