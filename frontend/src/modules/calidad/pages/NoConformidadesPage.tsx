import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';

export const NoConformidadesPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [ncs, setNcs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<string>('todas');

    const puedeCrear = tienePermiso('Gestion de Calidad', 5);
    const puedeEditar = tienePermiso('Gestion de Calidad', 4);
    const puedeEliminar = tienePermiso('Gestion de Calidad', 5);

    const fetchNcs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/calidad/no-conformidades');
            setNcs(res.data);
        } catch (error) {
            console.error('Error cargando no conformidades', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNcs(); }, []);

    const filtradas = ncs.filter(nc => {
        if (filtroEstado !== 'todas' && nc.estado !== filtroEstado) return false;
        const q = busqueda.toLowerCase();
        return nc.codigo.toLowerCase().includes(q)
            || (nc.requisito || '').toLowerCase().includes(q)
            || (nc.hallazgo || '').toLowerCase().includes(q);
    });

    const handleEliminar = async (id: number) => {
        if (!await confirm({ title: 'Eliminar NC', message: '¿Está seguro de eliminar esta no conformidad?' })) return;
        try {
            await api.delete(`/calidad/no-conformidades/${id}`);
            toast({ message: 'No conformidad eliminada correctamente.' });
            fetchNcs();
        } catch (error) {
            await alert({ message: 'Error al eliminar la no conformidad.' });
        }
    };

    const estadoBadge = (estado: string) => {
        const styles: Record<string, string> = {
            ABIERTA: 'bg-red-100 text-red-700',
            EN_CURSO: 'bg-amber-100 text-amber-700',
            VERIFICADA: 'bg-sky-100 text-sky-700',
            CERRADA: 'bg-emerald-100 text-emerald-700',
        };
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${styles[estado] || 'bg-gray-100 text-gray-700'}`}>{estado || 'ABIERTA'}</span>;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">No Conformidades</h1>
                    <p className="text-sm text-gray-500">Registro general de no conformidades y comentarios</p>
                </div>
                {puedeCrear && (
                    <Button variant="default" onClick={() => navigate('/calidad/no-conformidades/nueva')}>
                        <Plus className="w-4 h-4 mr-1" /> Nueva NC
                    </Button>
                )}
            </div>

            <div className="mb-4 flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full max-w-lg">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Buscar por número, requisito o hallazgo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="flex-1 text-sm outline-none" />
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1 outline-none">
                    <option value="todas">Todos los estados</option>
                    <option value="ABIERTA">Abiertas</option>
                    <option value="EN_CURSO">En proceso</option>
                    <option value="VERIFICADA">Verificadas</option>
                    <option value="CERRADA">Cerradas</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">N°</th>
                            <th className="px-4 py-3 font-semibold">Tipo</th>
                            <th className="px-4 py-3 font-semibold">Requisito</th>
                            <th className="px-4 py-3 font-semibold">Hallazgo</th>
                            <th className="px-4 py-3 font-semibold">Fecha</th>
                            <th className="px-4 py-3 font-semibold">Estado</th>
                            <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400">Cargando...</td></tr>
                        ) : filtradas.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400">No se encontraron no conformidades</td></tr>
                        ) : filtradas.map(nc => (
                            <tr key={nc.id} onClick={() => navigate(`/calidad/no-conformidades/${nc.id}`)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="px-4 py-3 font-medium text-gray-800">{nc.codigo}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${nc.categoria === 'COM' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{nc.categoria || 'NC'}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{nc.requisito || '-'}</td>
                                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{nc.hallazgo}</td>
                                <td className="px-4 py-3 text-gray-600">{new Date(nc.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{estadoBadge(nc.estado)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/calidad/no-conformidades/${nc.id}`); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver NC"><Eye className="w-4 h-4" /></button>
                                        {puedeEditar && (
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/calidad/no-conformidades/editar/${nc.id}`); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Editar"><Edit3 className="w-4 h-4" /></button>
                                        )}
                                        {puedeEliminar && (
                                            <button onClick={(e) => { e.stopPropagation(); handleEliminar(nc.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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
