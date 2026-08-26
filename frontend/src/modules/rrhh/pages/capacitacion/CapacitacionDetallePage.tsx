import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import { GraduationCap, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import api from '../../../../core/api/axios';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { decodeId, encodeId } from '../../../../shared/utils/ids';

const estadoColors: Record<string, string> = {
  PROGRAMADA: 'bg-yellow-100 text-yellow-800',
  EN_CURSO: 'bg-blue-100 text-blue-800',
  FINALIZADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

export const CapacitacionDetallePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? decodeId(id) : null;
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const [cap, setCap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedId) return;
    api.get(`/capacitaciones/${decodedId}`)
      .then(res => setCap(res.data))
      .catch(() => toast({ message: 'Error al cargar capacitación' }))
      .finally(() => setLoading(false));
  }, [decodedId]);

  const handleEliminar = async () => {
    const ok = await confirm({ message: '¿Eliminar esta capacitación?' });
    if (!ok || !decodedId) return;
    try {
      await api.delete(`/capacitaciones/${decodedId}`);
      toast({ message: 'Eliminada correctamente' });
      navigate('/rrhh/capacitaciones');
    } catch {
      await alert({ message: 'Error al eliminar' });
    }
  };

  if (loading) return <div className="p-10 text-gray-500">Cargando...</div>;
  if (!cap) return <div className="p-10 text-red-500">No encontrada</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/rrhh/capacitaciones')} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <GraduationCap className="w-5 h-5 text-blue-600" />
        <h1 className="text-lg font-bold text-gray-800">{cap.nombre}</h1>
        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${estadoColors[cap.estado] || 'bg-gray-100'}`}>
          {cap.estado?.replace('_', ' ')}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200 p-2">
          Datos de la capacitación
        </div>
        <div className="grid grid-cols-2 gap-0 text-sm">
          <div className="p-3 border-r border-b border-gray-200 font-medium text-gray-500">Fecha inicio</div>
          <div className="p-3 border-b border-gray-200">{new Date(cap.fecha_inicio).toLocaleDateString('es-ES')}</div>
          <div className="p-3 border-r border-b border-gray-200 font-medium text-gray-500">Fecha fin</div>
          <div className="p-3 border-b border-gray-200">{new Date(cap.fecha_fin).toLocaleDateString('es-ES')}</div>
          <div className="p-3 border-r border-b border-gray-200 font-medium text-gray-500">Horas</div>
          <div className="p-3 border-b border-gray-200">{cap.horas}</div>
          <div className="p-3 border-r border-b border-gray-200 font-medium text-gray-500">Lugar</div>
          <div className="p-3 border-b border-gray-200">{cap.lugar || '-'}</div>
          <div className="p-3 border-r border-b border-gray-200 font-medium text-gray-500">Proveedor</div>
          <div className="p-3 border-b border-gray-200">{cap.proveedor || '-'}</div>
          <div className="p-3 border-r border-gray-200 font-medium text-gray-500">Observaciones</div>
          <div className="p-3">{cap.observaciones || '-'}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-4">
        <div className="bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200 p-2">
          Participantes ({cap.participantes?.length || 0})
        </div>
        {cap.participantes?.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-600">
                <th className="p-3">#</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Cédula</th>
              </tr>
            </thead>
            <tbody>
              {cap.participantes.map((p: any, i: number) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="p-3 text-gray-400">{i + 1}</td>
                  <td className="p-3 font-semibold">{p.persona.nombre} {p.persona.apellidos}</td>
                  <td className="p-3">{p.persona.cedula_identidad || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-3 text-sm text-gray-500">Sin participantes registrados</div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={() => navigate(`/rrhh/capacitaciones/editar/${id}`)} variant="clasico">
          <Edit className="w-4 h-4 mr-1" /> Editar
        </Button>
        <Button onClick={handleEliminar} variant="clasico">
          <Trash2 className="w-4 h-4 mr-1" /> Eliminar
        </Button>
      </div>
    </div>
  );
};
