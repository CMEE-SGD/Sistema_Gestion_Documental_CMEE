import { useNavigate } from 'react-router-dom';
import { modules } from '../data/modulos';
import logoCentro from '../assets/LOGO_CENTRO.png';
import Navbar from '../components/Navbar';
import { useState } from 'react';

// 1. Mapeo de íconos para los módulos de tu nueva lista
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
    // AÑADIDO: Ícono para el Gestor Documental (Forma de Carpeta/Archivo)
    'Gestor Documental': (
      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
      </svg>
    )
  };

  // Ícono por defecto para los módulos que no tienen uno específico arriba
  const defaultIcon = (
    <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </svg>
  );

  return iconMap[name] ?? defaultIcon;
};

// 2. FAVORITOS: Deben llamarse EXACTAMENTE igual que el "name" en modulos.ts
const favorites = [
  //'Dashboard',
  'Gestion de Usuarios', 
  'Recursos Humanos',
  //'Gestor Documental'
];

// 3. Colores para cada módulo
const getBgColor = (name: string) => {
  if (name === 'Gestion de Usuarios') return '#2185d0'; // Azul
  if (name === 'Recursos Humanos') return '#C9A800'; // Dorado
  if (name === 'Dashboard') return '#9E9E9E'; // Gris
  if (name === 'Gestor Documental') return '#16a085'; // AÑADIDO: Verde azulado (Teal) para diferenciarlo
  return '#4a5568'; // Color genérico para los demás
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<'favoritos' | 'aplicaciones'>('favoritos');
  const navigate = useNavigate();

  // Filtra los módulos de la BD local basándose en el arreglo de favoritos
  const favModules = modules.filter((m) => favorites.includes(m.name));
  const allModules = modules;

  const displayModules = activeTab === 'favoritos' ? favModules : allModules;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-6xl">
          {/* Cabecera */}
          <div className="bg-white border border-gray-200 rounded shadow-sm flex items-center gap-6 px-8 py-8 mb-4">
            <div className="shrink-0 border border-gray-300 rounded p-1 bg-white">
              <img src={logoCentro} alt="Logo CMEE" className="h-36 w-36 object-contain" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-gray-800">
                Centro de Metrologia del Ejercito Ecuatoriano
              </h1>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                EL CENTRO DE METROLOGIA CONTRIBUYENDO A LA CULTURA DE CALIDAD DEL PAIS
              </p>
              <p className="text-sm text-gray-500 mt-1">
                "Si tienes mucho, da mucho; si tienes poco, da poco; pero da siempre."
              </p>
              <p className="text-sm italic text-gray-400">
                Biblia, Libro de Tobias
              </p>
            </div>
          </div>
          
          {/* Contenedor de Pestañas */}
          <div className="bg-white border border-gray-200 rounded shadow-sm">
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
              {/* <button
                onClick={() => setActiveTab('aplicaciones')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'aplicaciones'
                  ? 'border-gray-700 text-gray-800'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                Aplicaciones
              </button> */}
            </div>

            {/* Cuadrícula de Módulos */}
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
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-6">
                {/* <button
                  onClick={() => navigate('/configuracion')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded transition-colors"
                >
                  Configurar
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;