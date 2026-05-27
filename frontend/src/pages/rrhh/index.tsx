import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, UserCog, Library, Building2, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';

export const IndexRRHHPage = () => {
  const navigate = useNavigate();
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
        const [pRes, puRes, rRes, bRes, gRes] = await Promise.all([
          api.get('/personas'),
          api.get('/puestos'),
          api.get('/roles'),
          api.get('/carpetas'), // Ajusta esta ruta según tu endpoint de documentos
          api.get('/departamentos')
        ]);

        setStats({
          personas: Array.isArray(pRes.data) ? pRes.data.filter((i: any) => i.activo).length : 0,
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

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, path }: any) => (
    <div
      onClick={() => navigate(path)}
      className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
    >
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      {/* Solo el icono sin fondo */}
      <Icon className={`w-8 h-8 ${iconColor}`} />
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Recursos Humanos</h1>
        <p className="text-gray-600 mt-1">La aplicación es una herramienta que permite definir y gestionar la estructura organizativa de su empresa. Podrá definir y mantener los departamentos, grupos de trabajo, empleados, puestos y responsabilidades que determinan los recursos.</p>
      </div>

      {/* Dashboard Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="font-bold text-lg mb-6">Resumen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          <StatCard title="Personal Activo" value={stats.personas} icon={Users} bgColor="bg-blue-600" iconColor="text-blue-600" path="/rrhh/personas" />
          <StatCard title="Puestos" value={stats.puestos} icon={Briefcase} bgColor="bg-green-600" iconColor="text-green-600" path="/rrhh/puestos" />
          <StatCard title="Roles" value={stats.roles} icon={UserCog} bgColor="bg-orange-500" iconColor="text-orange-500" path="/rrhh/roles" />
          <StatCard title="Grupos/Depto" value={stats.grupos} icon={Building2} bgColor="bg-teal-600" iconColor="text-teal-600" path="/rrhh/grupos" />
        </div>
      </div>
    </div>
  );
};