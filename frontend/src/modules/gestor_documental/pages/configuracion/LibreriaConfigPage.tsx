import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Pencil } from 'lucide-react';
import api from '../../../../core/api/axios';
import { EditCarpetaModal } from '../../components/EditCarpetaModal';

export const LibreriasConfigPage = () => {
  const navigate = useNavigate();
  const [librerias, setLibrerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchDatos = async () => {
    try {
      const res = await api.get('/carpetas');
      const todas = Array.isArray(res.data) ? res.data : [];
      const filtradas = todas.filter(c => c.tipo === 'LIBRERIA').sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setLibrerias(filtradas);
    } catch (error) {
      console.error("Error al cargar librerías:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  return (
    <div className="bg-white">
      <h2 className="text-[18px] font-bold text-gray-800 mb-6">Administración de librerías</h2>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/gestordocumental/nueva-carpeta', { state: { forzarTipo: 'LIBRERIA' } })} className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
          Nueva librería
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 p-4">Cargando librerías...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-800 border-collapse">
            <thead className="bg-[#006400] text-white font-bold">
              <tr>
                <th className="px-3 py-2 border-r border-[#004d00]">Nombre ▼</th>
                <th className="px-3 py-2 border-r border-[#004d00] text-center w-40">Código</th>
                <th className="px-3 py-2 border-r border-[#004d00] text-center w-24">Orden</th>
                <th className="px-3 py-2 border-r border-[#004d00] text-center w-24">Estado</th>
                <th className="px-3 py-2 text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {librerias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500 italic border-b-[4px] border-[#006400]">
                    No hay librerías.
                  </td>
                </tr>
              ) : (
                librerias.map((lib, idx) => (
                  <tr key={lib.id} className={`border-b border-gray-200 transition-colors ${idx === librerias.length - 1 ? 'border-b-[4px] border-b-[#006400]' : ''} even:bg-gray-100 odd:bg-white hover:bg-gray-200`}>
                    <td className="px-3 py-1.5 flex items-center gap-2">
                      <Book className="w-3.5 h-3.5 text-gray-800 fill-current" />
                      {lib.nombre}
                    </td>
                    <td className="px-3 py-1.5 text-center">{lib.codigo || '-'}</td>
                    <td className="px-3 py-1.5 text-center">{lib.orden || 10}</td>
                    <td className="px-3 py-1.5 text-center">{lib.activo ? 'Activo' : 'Inactivo'}</td>
                    <td className="px-3 py-1.5 text-center">
                      <button onClick={() => setEditId(lib.id)} className="px-2 py-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1 mx-auto">
                        <Pencil className="w-3 h-3" /> Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editId && <EditCarpetaModal carpetaId={editId} onClose={() => setEditId(null)} onSaved={() => { setEditId(null); fetchDatos(); }} />}
    </div>
  );
};
