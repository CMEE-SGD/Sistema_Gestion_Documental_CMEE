import { useEffect, useState } from 'react';
import { Users, Briefcase, UserCog, Building2 } from 'lucide-react';
import api from '../../../core/api/axios';
import RRHHHeader from '../components/RRHHHeader';
import StatCard from '../components/StatCard';

export const IndexRRHHPage = () => {
  const [stats, setStats] = useState({
    personas: 0,
    puestos: 0,
    roles: 0,
    grupos: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Hacemos todas las peticiones en paralelo para cargar rápido
        const [pRes, puRes, rRes, , gRes] = await Promise.all([
          api.get('/personas'),
          api.get('/puestos'),
          api.get('/roles'),
          api.get('/carpetas'), 
          api.get('/departamentos')
        ]);

        setStats({
          personas: Array.isArray(pRes.data) ? pRes.data.filter((i: any) => i.estado === 'ACTIVO').length : 0,
          puestos: Array.isArray(puRes.data) ? puRes.data.filter((i: any) => i.activo).length : 0,
          roles: Array.isArray(rRes.data) ? rRes.data.filter((i: any) => i.activo).length : 0,
          grupos: Array.isArray(gRes.data) ? gRes.data.filter((i: any) => i.activo).length : 0
        });
      } catch (error) {
        console.error('Error al cargar estadísticas', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Cabecera (Molécula) */}
      <RRHHHeader />

      {/* Dashboard Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="font-bold text-lg mb-6">Resumen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          <StatCard 
            title="Personal Activo" 
            value={stats.personas} 
            icon={Users} 
            iconColor="text-blue-600" 
            path="/rrhh/personas" 
          />
          <StatCard 
            title="Puestos" 
            value={stats.puestos} 
            icon={Briefcase} 
            iconColor="text-green-600" 
            path="/rrhh/puestos" 
          />
          <StatCard 
            title="Roles" 
            value={stats.roles} 
            icon={UserCog} 
            iconColor="text-orange-500" 
            path="/rrhh/roles" 
          />
          <StatCard 
            title="Grupos/Depto" 
            value={stats.grupos} 
            icon={Building2} 
            iconColor="text-teal-600" 
            path="/rrhh/grupos" 
          />
        </div>
      </div>
    </div>
  );
};