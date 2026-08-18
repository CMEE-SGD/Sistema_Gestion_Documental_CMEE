import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, Trash2, Target, ShieldAlert } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';

const condicionStyles: Record<string, string> = {
    ALTO: 'bg-red-100 text-red-700',
    MODERADO: 'bg-orange-100 text-orange-700',
    LEVE: 'bg-emerald-100 text-emerald-700',
};

const estadoStyles: Record<string, string> = {
    IDENTIFICADO: 'bg-blue-100 text-blue-700',
    EN_SEGUIMIENTO: 'bg-amber-100 text-amber-700',
    VALORADO: 'bg-blue-100 text-blue-700',
    CERRADO: 'bg-emerald-100 text-emerald-700',
};

export const RiesgosOportunidadesPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');

    const puedeCrear = tienePermiso('Gestion de Calidad', 5);
    const puedeEditar = tienePermiso('Gestion de Calidad', 4);
    const puedeEliminar = tienePermiso('Gestion de Calidad', 5);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/calidad/riesgos');
            setItems(res.data);
        } catch (error) {
            console.error('Error cargando riesgos y oportunidades', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const filtradas = items.filter(item => {
        if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
        const q = busqueda.toLowerCase();
        return (item.codigo || '').toLowerCase().includes(q)
            || (item.proceso || '').toLowerCase().includes(q)
            || (item.evento || '').toLowerCase().includes(q);
    });

    const handleEliminar = async (id: number) => {
        if (!await confirm({ title: 'Eliminar registro', message: '¿Está seguro de eliminar este riesgo/oportunidad?' })) return;
        try {
            await api.delete(`/calidad/riesgos/${id}`);
            toast({ message: 'Registro eliminado correctamente.' });
            fetchItems();
        } catch (error) {
            await alert({ message: 'Error al eliminar el registro.' });
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Riesgos y Oportunidades</h1>
                    <p className="text-sm text-gray-500">Identificación, valoración y control de riesgos y oportunidades (MC19.1.P1)</p>
                </div>
                {puedeCrear && (
                    <Button variant="default" onClick={() => navigate('/calidad/riesgos/nueva')}>
                        <Plus className="w-4 h-4 mr-1" /> Nuevo Registro
                    </Button>
                )}
            </div>

            <div className="mb-4 flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full max-w-lg">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Buscar por código, proceso o evento..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="flex-1 text-sm outline-none" />
                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1 outline-none">
                    <option value="todos">Todos</option>
                    <option value="RIESGO">Riesgos</option>
                    <option value="OPORTUNIDAD">Oportunidades</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Código</th>
                            <th className="px-4 py-3 font-semibold">Tipo</th>
                            <th className="px-4 py-3 font-semibold">Proceso</th>
                            <th className="px-4 py-3 font-semibold">Evento</th>
                            <th className="px-4 py-3 font-semibold">Nivel (P·I·D)</th>
                            <th className="px-4 py-3 font-semibold">Condición</th>
                            <th className="px-4 py-3 font-semibold">Estado</th>
                            <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-400">Cargando...</td></tr>
                        ) : filtradas.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-400">No se encontraron registros</td></tr>
                        ) : filtradas.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/calidad/riesgos/${item.id}`)}>
                                <td className="px-4 py-3 font-medium text-gray-800">{item.codigo}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${item.tipo === 'OPORTUNIDAD' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.tipo === 'OPORTUNIDAD' ? <Target className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                        {item.tipo === 'OPORTUNIDAD' ? 'OPORTUNIDAD' : 'RIESGO'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{item.proceso}</td>
                                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.evento}</td>
                                <td className="px-4 py-3 text-gray-600 font-medium">{item.nivel_riesgo} <span className="text-[10px] text-gray-400">({item.probabilidad}·{item.impacto}·{item.deteccion})</span></td>
                                <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${condicionStyles[item.condicion] || 'bg-gray-100 text-gray-700'}`}>{item.condicion}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${estadoStyles[item.estado] || 'bg-gray-100 text-gray-700'}`}>{item.estado.replace(/_/g, ' ')}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-1">
                                        <button onClick={() => navigate(`/calidad/riesgos/${item.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver detalle"><Eye className="w-4 h-4" /></button>
                                        {puedeEditar && (
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/calidad/riesgos/editar/${item.id}`); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Editar"><Edit3 className="w-4 h-4" /></button>
                                        )}
                                        {puedeEliminar && (
                                            <button onClick={(e) => { e.stopPropagation(); handleEliminar(item.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
