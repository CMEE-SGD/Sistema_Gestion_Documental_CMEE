import { useNavigate } from 'react-router-dom';
import { modules } from '../data/modulos';
import logoCentro from '../assets/LOGO_CENTRO.png';
import Navbar from '../components/Navbar';
import { useState } from 'react';

const moduleIcons: Record<string, string> = {
  'Gestion de Riesgos': '#9E9E9E',
  'Recursos Humanos': '#F5A623',
  'Gestor Documental': '#F5A623',
  'Gestion Auditoria': '#F5A623',
};

// Iconos SVG por modulo
const ModuleIcon = ({ name }: { name: string }) => {
  const iconMap: Record<string, JSX.Element> = {
    'Recursos Humanos': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    'Gestor Documental': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
      </svg>
    ),
    'Gestion Auditoria': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ),
    'Gestion de Riesgos': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
  };

  const defaultIcon = (
    <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </svg>
  );

  return iconMap[name] ?? defaultIcon;
};

const favorites = [
  'Gestion de Riesgos',
  'Recursos Humanos',
  'Gestor Documental',
  'Gestion Auditoria',
];

const getBgColor = (name: string) => {
  if (name === 'Gestion de Riesgos') return '#9E9E9E';
  return '#C9A800';
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<'favoritos' | 'aplicaciones'>('favoritos');
  const navigate = useNavigate();

  const favModules = modules.filter((m) => favorites.includes(m.name));
  const allModules = modules;

  const displayModules = activeTab === 'favoritos' ? favModules : allModules;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-col items-center px-4 py-6">  <div className="w-full max-w-6xl">  {/* De max-w-3xl a max-w-6xl */}
        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded shadow-sm flex items-center gap-6 px-8 py-8 mb-4">
          {/* Logo */}
          <div className="shrink-0 border border-gray-300 rounded p-1 bg-white">
            <img src={logoCentro} alt="Logo CMEE" className="h-36 w-36 object-contain" />
          </div>
          {/* Info */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-gray-800">
              Centro de Metrologia del Ejercito Ecuatoriano        </h1>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              EL CENTRO DE METROLOGIA CONTRIBUYENDO A LA CULTURA DE CALIDAD DEL PAIS        </p>
            <p className="text-sm text-gray-500 mt-1">          "Si tienes mucho, da mucho; si tienes poco, da poco; pero da siempre."        </p>
            <p className="text-sm italic text-gray-400">          Biblia, Libro de Tobias        </p>
          </div>
        </div>
        {/* Tabs + content card — mismo max-w para que todo quede alineado */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('favoritos')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'favoritos'
                ? 'border-gray-700 text-gray-800'
                : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              Favoritos
            </button>
            <button
              onClick={() => setActiveTab('aplicaciones')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'aplicaciones'
                ? 'border-gray-700 text-gray-800'
                : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              Aplicaciones
            </button>
          </div>

          {/* Module grid */}
          <div className="p-6">
            {displayModules.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay modulos disponibles.</p>
            ) : (
              <div className="flex flex-wrap gap-6">
                {displayModules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => navigate(mod.path)}
                    className="flex flex-col items-center gap-2 group w-20"
                  >
                    {/* Icon box */}
                    <div
                      className="w-16 h-16 rounded flex items-center justify-center shadow-sm group-hover:brightness-90 transition-all"
                      style={{ backgroundColor: getBgColor(mod.name) }}
                    >
                      <ModuleIcon name={mod.name} />
                    </div>
                    {/* Label */}
                    <span className="text-xs text-center text-gray-600 leading-tight group-hover:text-gray-900 transition-colors">
                      {mod.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Configurar button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => navigate('/configuracion')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded transition-colors"
              >
                Configurar
              </button>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default Index;
