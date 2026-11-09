import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { encodeId } from '../../../shared/utils/ids';
import {
    ESTADO_ACCION_LABEL,
    ESTADO_ACCION_STYLES,
    ORIGEN_LABEL,
    TIPO_LABEL,
    TIPO_STYLES,
    rutaOrigen,
} from './acciones';
import { formatearFecha } from './trabajosNoConformes';

const selectCls = 'border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white';

export const AccionesPage = () => {
    const navigate = useNavigate();
    const { alert } = useAlert();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [tipo, setTipo] = useState('');
    const [origen, setOrigen] = useState('');
    const [estado, setEstado] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/calidad/acciones');
                setItems(Array.isArray(res.data) ? res.data : []);
            } catch {
                await alert({ message: 'No se pudieron cargar las acciones.' });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const filtrados = items.filter((it) => {
        const texto = q.toLowerCase();
        return (!tipo || it.tipo === tipo)
            && (!origen || it.origen_tipo === origen)
            && (!estado || it.estado === estado)
            && ((it.codigo || '').toLowerCase().includes(texto)
                || (it.descripcion || '').toLowerCase().includes(texto)
                || (it.responsable || '').toLowerCase().includes(texto)
                || (it.origen?.codigo || '').toLowerCase().includes(texto));
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Acciones Correctivas / Preventivas</h1>
                <p className="text-sm text-gray-500">
                    Registro central de las acciones originadas en auditorías, quejas, riesgos y trabajos no conformes
                </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por código, descripción, responsable u origen..."
                    className="w-full md:w-96 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectCls}>
                    <option value="">Todos los tipos</option>
                    {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select value={origen} onChange={(e) => setOrigen(e.target.value)} className={selectCls}>
                    <option value="">Todos los orígenes</option>
                    {Object.entries(ORIGEN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select value={estado} onChange={(e) => setEstado(e.target.value)} className={selectCls}>
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADO_ACCION_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">Cargando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Origen</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Responsable</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha límite</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-400">
                                        No se encontraron acciones. Se registran desde el detalle de una auditoría, queja, riesgo o trabajo no conforme.
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map((item) => {
                                    const ruta = rutaOrigen(item.origen);
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/calidad/acciones/${encodeId(item.id)}`)}
                                        >
                                            <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{item.codigo}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${TIPO_STYLES[item.tipo]}`}>{TIPO_LABEL[item.tipo]}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="text-xs text-gray-400">{ORIGEN_LABEL[item.origen_tipo]}</div>
                                                {ruta ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(ruta); }}
                                                        className="font-mono text-xs font-bold text-blue-600 hover:underline"
                                                    >
                                                        {item.origen.codigo}
                                                    </button>
                                                ) : (
                                                    <span className="font-mono text-xs text-gray-400">{item.origen?.codigo || 'No disponible'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-sm truncate">{item.descripcion}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{item.responsable || '—'}</td>
                                            <td className="px-4 py-3 text-gray-500">{formatearFecha(item.fecha_limite)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${ESTADO_ACCION_STYLES[item.estado]}`}>{ESTADO_ACCION_LABEL[item.estado]}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/calidad/acciones/${encodeId(item.id)}`); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
