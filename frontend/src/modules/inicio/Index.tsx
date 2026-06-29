import { useState, useEffect } from 'react';
import { modules } from '../../shared/data/modulos';
import Navbar from '../../shared/components/organisms/Navbar';
import WelcomeHeader from './components/WelcomeHeader';
import ModuleCard from './components/ModuleCard';
import api from '../../core/api/axios'; 

const favorites = [
  'Gestion de Usuarios', 
  'Gestor Documental',
  'Recursos Humanos',
  'Auditoria Global',
  'Laboratorios',
  'Administrativo'
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<'favoritos' | 'aplicaciones'>('favoritos');

  // Lógica de useEffect intacta (Refresco silencioso)
  useEffect(() => {
    const refrescarPermisos = async () => {
      try {
        const response = await api.get('/usuarios/perfil/actual');
        const resData = response.data;
        const personaRaw = resData.persona ?? {};
        let puestoExtraido = 'Puesto no asignado';
        
        if (Array.isArray(personaRaw.puestos) && personaRaw.puestos.length > 0) {
          const rel = personaRaw.puestos.find((r: any) => r.activo === true) ?? personaRaw.puestos[0];
          puestoExtraido = rel?.puesto?.nombre ?? puestoExtraido;
        }

        const userData = {
          id: resData.id,
          persona_id: resData.persona_id,
          nombre_usuario: resData.nombre_usuario,
          rol: resData.rol || 'usuario',
          grupos: resData.grupos ?? [], 
          persona: {
            nombre: personaRaw.nombre ?? '',
            apellidos: personaRaw.apellidos ?? '',
            foto_ruta: personaRaw.foto_ruta ?? '',
            puesto: puestoExtraido
          }
        };

        localStorage.setItem('usuario', JSON.stringify(userData));
      } catch (error) {
        console.error("Error al refrescar permisos", error);
      }
    };

    if (localStorage.getItem('token')) refrescarPermisos();
  }, []);

  const favModules = modules.filter((m) => favorites.includes(m.name));
  const displayModules = activeTab === 'favoritos' ? favModules : modules;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <WelcomeHeader />
          
          {/* Contenedor principal de Módulos */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mt-6">
            
            {/* Pestañas estilo Shadcn */}
            <div className="flex border-b border-border bg-muted/30 px-4 pt-2">
              <button
                onClick={() => setActiveTab('favoritos')}
                className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                  activeTab === 'favoritos'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Módulos Activos
                {/* Línea indicadora inferior */}
                {activeTab === 'favoritos' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                )}
              </button>
            </div>

            {/* Cuadrícula de Tarjetas */}
            <div className="p-8 bg-card/50">
              {displayModules.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm font-medium">No hay módulos disponibles para tu perfil.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                  {displayModules.map((mod) => (
                    <ModuleCard key={mod.id} mod={mod} />
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;