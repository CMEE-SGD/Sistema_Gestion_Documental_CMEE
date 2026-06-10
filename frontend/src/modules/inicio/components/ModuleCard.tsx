import { useNavigate } from 'react-router-dom';

// Componente interno (Átomo visual de apoyo)
const ModuleIcon = ({ name }: { name: string }) => {
  const iconMap: Record<string, JSX.Element> = {
    'Recursos Humanos': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    'Gestion de Usuarios': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49-.12-.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
      </svg>
    ),
    'Dashboard': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    ),
    'Gestor Documental': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
      </svg>
    ),
    'Auditoria Global': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    ),
    // 👇 Ícono de matraz añadido para Laboratorios
    'Laboratorios': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M21.3 19.88l-7.3-9.74V4h1V2H9v2h1v6.14l-7.3 9.74c-.53.71-.02 1.74.86 1.74h16.88c.88 0 1.39-1.03.86-1.74zM12 5.33l5 6.67h-10l5-6.67z" />
      </svg>
    )
  };

  return iconMap[name] ?? (
    <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </svg>
  );
};

const getBgColor = (name: string) => {
  if (name === 'Gestion de Usuarios') return '#2185d0';
  if (name === 'Recursos Humanos') return '#C9A800';
  if (name === 'Dashboard') return '#9E9E9E';
  if (name === 'Gestor Documental') return '#16a085';
  if (name === 'Auditoria Global') return '#b91c1c';
  if (name === 'Laboratorios') return '#6B21A8'; // 👇 Color morado añadido
  return '#4a5568';
};

interface ModuleCardProps {
  mod: {
    id: number | string;
    name: string;
    path: string;
  };
}

const ModuleCard = ({ mod }: ModuleCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(mod.path)}
      className="flex flex-col items-center gap-2 group w-20"
    >
      <div
        className="w-16 h-16 rounded flex items-center justify-center shadow-sm group-hover:brightness-90 transition-all"
        style={{ backgroundColor: getBgColor(mod.name) }}
      >
        <ModuleIcon name={mod.name} />
      </div>
      <span className="text-xs text-center text-gray-600 leading-tight group-hover:text-gray-900 transition-colors">
        {mod.name}
      </span>
    </button>
  );
};

export default ModuleCard;