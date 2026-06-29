import { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import RecepcionFormModal from '../components/RecepcionFormModal';

export default function RecepcionEquiposPage() {
  const [recepciones, setRecepciones] = useState<any[]>([]);
  // El estado inicial del modal DEBE ser false para que no aparezca de golpe
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecepciones = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/recepcion-equipos');
      setRecepciones(response.data);
    } catch (error) {
      console.error('Error al cargar recepciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecepciones();
  }, []);

  return (
    <div className="p-4">
      {/* CABECERA CON EL TÍTULO Y EL BOTÓN */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Recepción de Equipos</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 font-semibold"
          >
            + Nuevo registro
          </button>
        </div>
      </div>

      {/* LA TABLA DE REGISTROS */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-blue-200 border-b-2 border-blue-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Orden Física</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Equipo</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Laboratorio</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-4">Cargando...</td></tr>
            ) : recepciones.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">No hay registros de recepción.</td></tr>
            ) : (
              recepciones.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium"><span className="text-red-600 font-bold">#{req.orden_trabajo_fisica}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.fecha_ingreso).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.cliente?.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.equipo_descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.laboratorio?.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {req.estado.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RENDERIZADO CONDICIONAL DEL MODAL (Solo aparece si isModalOpen es true) */}
      {isModalOpen && (
        <RecepcionFormModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRecepciones();
          }} 
        />
      )}
    </div>
  );
}