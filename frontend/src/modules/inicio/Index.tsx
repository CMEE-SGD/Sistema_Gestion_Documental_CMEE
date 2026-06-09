import { useState } from 'react';
import { modules } from '../../shared/data/modulos';
import Navbar from '../../shared/components/organisms/Navbar';
import WelcomeHeader from './components/WelcomeHeader';
import ModuleCard from './components/ModuleCard';

const favorites = [
  'Gestion de Usuarios', 
  'Gestor Documental',
  'Recursos Humanos',
  'Auditoria Global',
  'Laboratorios'
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<'favoritos' | 'aplicaciones'>('favoritos');

  // Filtramos directamente sobre el arreglo 'modules'
  const favModules = modules.filter((m) => favorites.includes(m.name));
  const displayModules = activeTab === 'favoritos' ? favModules : modules;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-6xl">
          {/* Cabecera (Molécula) */}
          <WelcomeHeader />
          
          {/* Contenedor de Pestañas */}
          <div className="bg-white border border-gray-200 rounded shadow-sm">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('favoritos')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === 'favoritos'
                    ? 'border-gray-700 text-gray-800'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Favoritos
              </button>
            </div>

            {/* Cuadrícula de Módulos (Usa las Tarjetas Modulares) */}
            <div className="p-6">
              {displayModules.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay modulos disponibles.</p>
              ) : (
                <div className="flex flex-wrap gap-6">
                  {displayModules.map((mod) => (
                    <ModuleCard key={mod.id} mod={mod} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;