import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';
import { encodeId } from '../../../shared/utils/ids';
import { nombreProceso, PROCESOS } from './procesos';

const condicionStyles: Record<string, string> = {
    ALTO: 'bg-red-100 text-red-700',
    MODERADO: 'bg-orange-100 text-orange-700',
    LEVE: 'bg-emerald-100 text-emerald-700',
};

export const RiesgosOportunidadesPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [filtroProceso, setFiltroProceso] = useState<string>('');

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
        if (filtroProceso && item.proceso !== filtroProceso) return false;
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex-1 min-w-[240px] max-w-lg">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Buscar por código, proceso o evento..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="flex-1 text-sm outline-none" />
                </div>
                <select value={filtroProceso} onChange={e => setFiltroProceso(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 min-w-[240px] shadow-sm">
                    <option value="">Todos los procesos</option>
                    {PROCESOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <button onClick={() => setFiltroTipo('todos')} className={`px-4 py-2.5 text-sm font-semibold transition-colors ${filtroTipo === 'todos' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Todos <span className="ml-1 opacity-70">({items.length})</span>
                    </button>
                    <button onClick={() => setFiltroTipo('RIESGO')} className={`px-4 py-2.5 text-sm font-semibold transition-colors border-l border-gray-200 ${filtroTipo === 'RIESGO' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Riesgos <span className="ml-1 opacity-70">({items.filter(i => i.tipo === 'RIESGO').length})</span>
                    </button>
                    <button onClick={() => setFiltroTipo('OPORTUNIDAD')} className={`px-4 py-2.5 text-sm font-semibold transition-colors border-l border-gray-200 ${filtroTipo === 'OPORTUNIDAD' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Oportunidades <span className="ml-1 opacity-70">({items.filter(i => i.tipo === 'OPORTUNIDAD').length})</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[1500px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Num.</th>
                            <th className="px-4 py-3 font-semibold">Código</th>
                            <th className="px-4 py-3 font-semibold">Proceso</th>
                            <th className="px-4 py-3 font-semibold">Riesgo / Oportunidad</th>
                            <th className="px-4 py-3 font-semibold">Efecto</th>
                            <th className="px-4 py-3 font-semibold">Causas</th>
                            <th className="px-4 py-3 font-semibold text-center">1. Prob.</th>
                            <th className="px-4 py-3 font-semibold text-center">2. Imp.</th>
                            <th className="px-4 py-3 font-semibold text-center">3. Det.</th>
                            <th className="px-4 py-3 font-semibold text-center">Valor Real</th>
                            <th className="px-4 py-3 font-semibold">Significante</th>
                            <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={12} className="text-center py-10 text-gray-400">Cargando...</td></tr>
                        ) : filtradas.length === 0 ? (
                            <tr><td colSpan={12} className="text-center py-10 text-gray-400">No se encontraron registros</td></tr>
                        ) : filtradas.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/calidad/riesgos/${encodeId(item.id)}`)}>
                                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-800">{item.codigo}</td>
                                <td className="px-4 py-3 text-gray-600 min-w-[170px] whitespace-normal" title={nombreProceso(item.proceso)}>{nombreProceso(item.proceso)}</td>
                                <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate" title={item.evento}>{item.evento}</td>
                                <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate" title={item.consecuencias || '—'}>{item.consecuencias || '—'}</td>
                                <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate" title={item.causa || '—'}>{item.causa || '—'}</td>
                                <td className="px-4 py-3 text-center text-gray-700">{item.probabilidad}</td>
                                <td className="px-4 py-3 text-center text-gray-700">{item.impacto}</td>
                                <td className="px-4 py-3 text-center text-gray-700">{item.deteccion}</td>
                                <td className="px-4 py-3 text-center font-bold text-gray-800">{item.nivel_riesgo}</td>
                                <td className={`px-4 py-3 text-center font-bold ${condicionStyles[item.condicion] || 'bg-gray-100 text-gray-700'}`}>{item.condicion}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-1">
                                        <button onClick={() => navigate(`/calidad/riesgos/${encodeId(item.id)}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver detalle"><Eye className="w-4 h-4" /></button>
                                        {puedeEditar && (
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/calidad/riesgos/editar/${encodeId(item.id)}`); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Editar"><Edit3 className="w-4 h-4" /></button>
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
