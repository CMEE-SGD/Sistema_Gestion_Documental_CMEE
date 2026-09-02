import { useEffect } from 'react';
import Navbar from '../../shared/components/organisms/Navbar';
import WelcomeHeader from './components/WelcomeHeader';
import ModuleCard from './components/ModuleCard';
import api from '../../core/api/axios';
import { tienePermiso } from '../../shared/utils/auth';

const MODULES = [
  { id: 1, name: 'Gestion de Usuarios', path: '/usuarios' },
  { id: 2, name: 'Recursos Humanos', path: '/rrhh' },
  { id: 3, name: 'Gestor Documental', path: '/gestordocumental' },
  { id: 4, name: 'Laboratorios', path: '/laboratorios' },
  { id: 5, name: 'Auditoria Global', path: '/auditoria' },
  { id: 6, name: 'Recepcion Equipos', path: '/administrativo/recepciones' },
  { id: 7, name: 'Gestion de Calidad', path: '/calidad/auditorias' },
  { id: 8, name: 'Resumen', path: '/resumen' },
];

const Index = () => {
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

        const laboratorioId = resData.laboratorio_id ?? null;

        const userData = {
          id: resData.id,
          persona_id: personaRaw.id ?? resData.persona_id,
          nombre_usuario: resData.nombre_usuario,
          rol: resData.rol || 'usuario',
          grupos: resData.grupos ?? [],
          laboratorio_id: laboratorioId,
          persona: {
            nombre: personaRaw.nombre ?? '',
            apellidos: personaRaw.apellidos ?? '',
            foto_ruta: personaRaw.foto_ruta ?? '',
            puesto: puestoExtraido,
          },
        };

        localStorage.setItem('usuario', JSON.stringify(userData));
      } catch (error) {
        console.error("Error al refrescar permisos", error);
      }
    };

    if (localStorage.getItem('token')) refrescarPermisos();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <WelcomeHeader />
          
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="flex border-b border-border bg-muted/30 px-4 pt-2">
              <div className="px-6 py-3 text-sm font-semibold text-primary relative">
                Módulos del Sistema
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              </div>
            </div>

            <div className="p-8 bg-card/50">
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                {MODULES.filter(
                  (mod) => mod.name !== 'Resumen' || tienePermiso('Resumen', 1),
                ).map((mod) => (
                  <ModuleCard key={mod.id} mod={mod} />
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;