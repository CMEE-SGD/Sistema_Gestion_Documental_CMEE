import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';
import { encodeId } from '../../../shared/utils/ids';
import {
    ESTADO_LABEL,
    ESTADO_STYLES,
    etiquetaCategoria,
    formatearFecha,
} from './trabajosNoConformes';

export const TrabajosNoConformesPage = () => {
    const navigate = useNavigate();
    const { alert, pedirMotivo } = useAlert();
    const { toast } = useToast();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');

    const puedeCrear = tienePermiso('Gestion de Calidad', 5);
    const puedeEditar = tienePermiso('Gestion de Calidad', 4);
    const puedeEliminar = tienePermiso('Gestion de Calidad', 5);

    const cargar = async () => {
        try {
            const res = await api.get('/calidad/trabajos-no-conformes');
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch {
            await alert({ message: 'No se pudieron cargar los trabajos no conformes.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const filtrados = items.filter((it) => {
        const texto = q.toLowerCase();
        return (it.codigo || '').toLowerCase().includes(texto)
            || etiquetaCategoria(it.categoria).toLowerCase().includes(texto)
            || (it.descripcion_problema || '').toLowerCase().includes(texto)
            || (it.elaborado_por || '').toLowerCase().includes(texto);
    });

    const eliminar = async (id: number) => {
        const motivo = await pedirMotivo({
            title: 'Eliminar registro',
            message: '¿Está seguro de eliminar este trabajo no conforme?',
            confirmLabel: 'Eliminar',
        });
        if (!motivo) return;
        try {
            await api.delete(`/calidad/trabajos-no-conformes/${id}`, { motivo });
            setItems((prev) => prev.filter((i) => i.id !== id));
            toast({ message: 'Registro eliminado.' });
        } catch {
            await alert({ message: 'Error al eliminar el registro.' });
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Trabajos No Conformes</h1>
                    <p className="text-sm text-gray-500">
                        Ensayos y/o calibraciones no conformes (GD4.1.F1-1)
                    </p>
                </div>
                {puedeCrear && (
                    <Button onClick={() => navigate('/calidad/trabajos-no-conformes/nueva')}>
                        <Plus className="w-4 h-4 mr-1" /> Nuevo Registro
                    </Button>
                )}
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por código, categoría, descripción o responsable..."
                    className="w-full md:w-96 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">Cargando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm min-w-[820px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Elaborado por</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-400">
                                        No se encontraron trabajos no conformes
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/calidad/trabajos-no-conformes/${encodeId(item.id)}`)}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{item.codigo}</td>
                                        <td className="px-4 py-3 text-gray-600">{etiquetaCategoria(item.categoria)}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-sm truncate">
                                            {item.descripcion_problema}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                                            {item.elaborado_por || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${ESTADO_STYLES[item.estado] || 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {ESTADO_LABEL[item.estado] || item.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{formatearFecha(item.fecha)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/calidad/trabajos-no-conformes/${encodeId(item.id)}`);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {puedeEditar && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/calidad/trabajos-no-conformes/editar/${encodeId(item.id)}`);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {puedeEliminar && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            eliminar(item.id);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
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
