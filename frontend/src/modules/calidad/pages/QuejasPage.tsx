import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { encodeId } from '../../../shared/utils/ids';

const estadoStyles: Record<string, string> = {
  RECIBIDA: 'bg-gray-100 text-gray-700',
  EN_ANALISIS: 'bg-amber-100 text-amber-700',
  PROCEDENTE: 'bg-emerald-100 text-emerald-700',
  NO_PROCEDENTE: 'bg-red-100 text-red-700',
  EN_SEGUIMIENTO: 'bg-blue-100 text-blue-700',
  CERRADA: 'bg-emerald-100 text-emerald-700',
};

export const QuejasPage = () => {
  const navigate = useNavigate();
  const { alert, confirm } = useAlert();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const cargar = async () => {
    try {
      const res = await api.get('/calidad/quejas');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      await alert({ message: 'No se pudieron cargar las quejas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = items.filter(
    (it) =>
      (it.codigo || '').toLowerCase().includes(q.toLowerCase()) ||
      (it.cliente || '').toLowerCase().includes(q.toLowerCase()) ||
      (it.descripcion_queja || '').toLowerCase().includes(q.toLowerCase())
  );

  const eliminar = async (id: number) => {
    if (!await confirm({ title: 'Eliminar queja', message: '¿Está seguro de eliminar esta queja?' })) return;
    try {
      await api.delete(`/calidad/quejas/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ message: 'Queja eliminada.' });
    } catch {
      await alert({ message: 'Error al eliminar la queja.' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quejas</h1>
          <p className="text-sm text-gray-500">Recepción, análisis y cierre de quejas (AC1.3.F1-3)</p>
        </div>
        <Button onClick={() => navigate('/calidad/quejas/nueva')}>
          <Plus className="w-4 h-4 mr-1" /> Nueva Queja
        </Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por código, cliente o descripción..."
          className="w-full md:w-96 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No se encontraron quejas</td></tr>
              ) : (
                filtrados.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/calidad/quejas/${encodeId(item.id)}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{item.codigo}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.cliente || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-sm truncate">{item.descripcion_queja}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${estadoStyles[item.estado] || 'bg-gray-100 text-gray-500'}`}>
                        {item.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.recibida_fecha ? new Date(item.recibida_fecha).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/calidad/quejas/${encodeId(item.id)}`); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/calidad/quejas/editar/${encodeId(item.id)}`); }}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); eliminar(item.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
