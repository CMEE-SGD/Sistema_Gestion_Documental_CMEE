import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import { Plus, Search, GraduationCap } from 'lucide-react';
import api from '../../../../core/api/axios';
import { encodeId } from '../../../../shared/utils/ids';

const estadoColors: Record<string, string> = {
  PROGRAMADA: 'bg-yellow-100 text-yellow-800',
  EN_CURSO: 'bg-blue-100 text-blue-800',
  FINALIZADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

export const CapacitacionesPage = () => {
  const navigate = useNavigate();
  const [capacitaciones, setCapacitaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    api.get('/capacitaciones')
      .then(res => setCapacitaciones(res.data))
      .catch(err => console.error('Error cargando capacitaciones', err))
      .finally(() => setLoading(false));
  }, []);

  const filtradas = capacitaciones.filter(c => {
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
    if (busqueda) {
      const b = busqueda.toLowerCase();
      const texto = `${c.nombre} ${c.proveedor || ''}`.toLowerCase();
      if (!texto.includes(b)) return false;
    }
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-800">Capacitaciones</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200 mb-4">
        <Button onClick={() => navigate('/rrhh')} variant="clasico">Atrás</Button>
        <Button onClick={() => navigate('/rrhh/capacitaciones/nueva')} variant="clasico">
          <Plus className="w-4 h-4 mr-1" /> Nueva
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="p-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="EN_CURSO">En curso</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded w-48 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs border-b border-gray-200">
              <th className="p-3">Nombre</th>
              <th className="p-3">Inicio</th>
              <th className="p-3">Fin</th>
              <th className="p-3">Horas</th>
              <th className="p-3">Proveedor</th>
              <th className="p-3">Participantes</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Cargando...</td></tr>
            ) : filtradas.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No se encontraron capacitaciones.</td></tr>
            ) : filtradas.map(c => (
              <tr
                key={c.id}
                onClick={() => navigate(`/rrhh/capacitaciones/${encodeId(c.id)}`)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3 font-semibold">{c.nombre}</td>
                <td className="p-3">{new Date(c.fecha_inicio).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
                <td className="p-3">{new Date(c.fecha_fin).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
                <td className="p-3">{c.horas}</td>
                <td className="p-3">{c.proveedor || '-'}</td>
                <td className="p-3">{c.participantes?.length || 0}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${estadoColors[c.estado] || 'bg-gray-100'}`}>
                    {c.estado?.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
