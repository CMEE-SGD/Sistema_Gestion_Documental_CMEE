import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Target, ShieldAlert, Search, ClipboardList, CheckCircle } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { tienePermiso } from '../../../shared/utils/auth';

const condicionStyles: Record<string, string> = {
    ALTO: 'bg-red-100 text-red-700',
    MODERADO: 'bg-orange-100 text-orange-700',
    LEVE: 'bg-emerald-100 text-emerald-700',
};

const estadoStyles: Record<string, string> = {
    IDENTIFICADO: 'bg-blue-100 text-blue-700',
    EN_SEGUIMIENTO: 'bg-amber-100 text-amber-700',
    CERRADO: 'bg-emerald-100 text-emerald-700',
};

export const RiesgoDetallePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert } = useAlert();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const puedeEditar = tienePermiso('Gestion de Calidad', 4);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get(`/calidad/riesgos/${id}`);
                setItem(res.data);
            } catch {
                await alert({ message: 'No se pudo cargar el registro.' });
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    if (loading) return <div className="p-6 text-center text-gray-400">Cargando...</div>;
    if (!item) return <div className="p-6 text-center text-gray-400">Registro no encontrado</div>;

    const hasData = (v: any) => v !== null && v !== undefined && v !== '';

    return (
        <div className="p-6">
            <button onClick={() => navigate('/calidad/riesgos')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver a Riesgos y Oportunidades
            </button>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <h2 className="font-bold text-gray-800">{item.codigo}</h2>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${item.tipo === 'OPORTUNIDAD' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {item.tipo === 'OPORTUNIDAD' ? <Target className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {item.tipo === 'OPORTUNIDAD' ? 'OPORTUNIDAD' : 'RIESGO'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${condicionStyles[item.condicion] || 'bg-gray-100 text-gray-700'}`}>{item.condicion}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${estadoStyles[item.estado] || 'bg-gray-100 text-gray-700'}`}>{item.estado?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {item.estado === 'IDENTIFICADO' && (
                            <Button variant="default" onClick={() => navigate(`/calidad/riesgos/${item.id}/seguimiento?seccion=valoracion`)}>
                                <Search className="w-4 h-4 mr-1" /> Valoración
                            </Button>
                        )}
                        {(item.estado === 'IDENTIFICADO' || item.estado === 'EN_SEGUIMIENTO') && item.acciones && (
                            <Button variant="default" onClick={() => navigate(`/calidad/riesgos/${item.id}/seguimiento?seccion=seguimiento`)}>
                                <ClipboardList className="w-4 h-4 mr-1" /> Seguimiento
                            </Button>
                        )}
                        {item.estado === 'EN_SEGUIMIENTO' && (
                            <Button variant="default" onClick={() => navigate(`/calidad/riesgos/${item.id}/seguimiento?seccion=cierre`)}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Cierre
                            </Button>
                        )}
                        {puedeEditar && (
                            <Button variant="default" onClick={() => navigate(`/calidad/riesgos/editar/${item.id}`)}>
                                <Edit3 className="w-4 h-4 mr-1" /> Editar
                            </Button>
                        )}
                    </div>
                </div>

                {/* IDENTIFICACIÓN */}
                <div className="p-4">
                    <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">
                        IDENTIFICACIÓN
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 border border-t-0 border-gray-300 rounded-b p-4">
                        <div><strong>Proceso:</strong> {item.proceso}</div>
                        <div><strong>Fuente:</strong> {item.fuente || '—'}</div>
                        <div className="md:col-span-4"><strong>Evento:</strong> {item.evento}</div>
                        <div><strong>Causas:</strong> {item.causa || '—'}</div>
                        <div><strong>Consecuencias:</strong> {item.consecuencias || '—'}</div>
                    </div>
                </div>

                {/* RESPONSABLES IDENTIFICACIÓN */}
                {Array.isArray(item.responsables) && item.responsables.some((r: any) => r.fase === 'IDENTIFICACION') && (
                    <div className="px-4 pb-4">
                        <div className="bg-[#88bddf]/80 text-white px-3 py-2 text-sm font-semibold rounded-t">
                            RESPONSABLES - IDENTIFICACIÓN
                        </div>
                        <div className="border border-t-0 border-gray-300 rounded-b">
                            <table className="w-full text-sm text-gray-600">
                                <thead className="bg-blue-50">
                                    <tr><th className="text-left px-4 py-2">Nombre</th><th className="text-left px-4 py-2">Cargo</th><th className="text-left px-4 py-2">Fecha</th></tr>
                                </thead>
                                <tbody>
                                    {item.responsables.filter((r: any) => r.fase === 'IDENTIFICACION').map((r: any, i: number) => (
                                        <tr key={i} className="border-t border-gray-200">
                                            <td className="px-4 py-2">{r.nombre}</td>
                                            <td className="px-4 py-2">{r.cargo || '—'}</td>
                                            <td className="px-4 py-2">{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VALORACIÓN */}
                <div className="px-4 pb-4">
                    <div className={`text-white px-3 py-2 text-sm font-semibold rounded-t ${
                        item.condicion === 'ALTO' ? 'bg-red-500' :
                        item.condicion === 'MODERADO' ? 'bg-orange-500' :
                        'bg-emerald-500'
                    }`}>
                        VALORACIÓN DEL RIESGO
                    </div>
                    <div className={`grid grid-cols-2 md:grid-cols-5 gap-3 p-4 text-sm text-gray-700 border border-t-0 rounded-b ${
                        item.condicion === 'ALTO' ? 'bg-red-50 border-red-300' :
                        item.condicion === 'MODERADO' ? 'bg-orange-50 border-orange-300' :
                        'bg-emerald-50 border-emerald-300'
                    }`}>
                        <div className={`border rounded-md p-3 text-center ${
                            item.condicion === 'ALTO' ? 'border-red-200' :
                            item.condicion === 'MODERADO' ? 'border-orange-200' :
                            'border-emerald-200'
                        }`}>
                            <div className="text-[11px] text-gray-400">Probabilidad</div>
                            <div className="text-lg font-bold">{item.probabilidad}</div>
                        </div>
                        <div className={`border rounded-md p-3 text-center ${
                            item.condicion === 'ALTO' ? 'border-red-200' :
                            item.condicion === 'MODERADO' ? 'border-orange-200' :
                            'border-emerald-200'
                        }`}>
                            <div className="text-[11px] text-gray-400">Impacto</div>
                            <div className="text-lg font-bold">{item.impacto}</div>
                        </div>
                        <div className={`border rounded-md p-3 text-center ${
                            item.condicion === 'ALTO' ? 'border-red-200' :
                            item.condicion === 'MODERADO' ? 'border-orange-200' :
                            'border-emerald-200'
                        }`}>
                            <div className="text-[11px] text-gray-400">Detección</div>
                            <div className="text-lg font-bold">{item.deteccion}</div>
                        </div>
                        <div className={`border rounded-md p-3 text-center ${
                            item.condicion === 'ALTO' ? 'border-red-200' :
                            item.condicion === 'MODERADO' ? 'border-orange-200' :
                            'border-emerald-200'
                        }`}>
                            <div className="text-[11px] text-gray-400">Nivel</div>
                            <div className="text-lg font-bold">{item.nivel_riesgo}</div>
                        </div>
                        <div className={`border rounded-md p-3 text-center ${
                            item.condicion === 'ALTO' ? 'border-red-200' :
                            item.condicion === 'MODERADO' ? 'border-orange-200' :
                            'border-emerald-200'
                        }`}>
                            <div className="text-[11px] text-gray-400">Condición</div>
                            <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${condicionStyles[item.condicion] || 'bg-gray-100 text-gray-700'}`}>{item.condicion}</span>
                        </div>
                    </div>
                </div>

                {/* RESPONSABLES VALORACIÓN */}
                {Array.isArray(item.responsables) && item.responsables.some((r: any) => r.fase === 'VALORACION') && (
                    <div className="px-4 pb-4">
                        <div className="bg-amber-500/80 text-white px-3 py-2 text-sm font-semibold rounded-t">
                            RESPONSABLES - VALORACIÓN
                        </div>
                        <div className="border border-t-0 border-gray-300 rounded-b">
                            <table className="w-full text-sm text-gray-600">
                                <thead className="bg-amber-50">
                                    <tr><th className="text-left px-4 py-2">Nombre</th><th className="text-left px-4 py-2">Cargo</th><th className="text-left px-4 py-2">Fecha</th></tr>
                                </thead>
                                <tbody>
                                    {item.responsables.filter((r: any) => r.fase === 'VALORACION').map((r: any, i: number) => (
                                        <tr key={i} className="border-t border-gray-200">
                                            <td className="px-4 py-2">{r.nombre}</td>
                                            <td className="px-4 py-2">{r.cargo || '—'}</td>
                                            <td className="px-4 py-2">{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TRATAMIENTO */}
                {hasData(item.acciones) && (
                    <div className="px-4 pb-4">
                        <div className="bg-blue-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
                            TRATAMIENTO
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 border border-t-0 border-gray-300 rounded-b p-4">
                            <div><strong>Tratamiento:</strong> {item.tratamiento || '—'}</div>
                            <div><strong>Fecha límite:</strong> {item.fecha_limite ? new Date(item.fecha_limite).toLocaleDateString() : '—'}</div>
                            <div className="md:col-span-2"><strong>Acciones del plan:</strong> {item.acciones}</div>
                            {hasData(item.observaciones) && <div className="md:col-span-2"><strong>Observaciones:</strong> {item.observaciones}</div>}
                        </div>
                    </div>
                )}

                {/* RESPONSABLES TRATAMIENTO */}
                {Array.isArray(item.responsables) && item.responsables.some((r: any) => r.fase === 'TRATAMIENTO') && (
                    <div className="px-4 pb-4">
                        <div className="bg-blue-500/80 text-white px-3 py-2 text-sm font-semibold rounded-t">
                            RESPONSABLES - TRATAMIENTO
                        </div>
                        <div className="border border-t-0 border-gray-300 rounded-b">
                            <table className="w-full text-sm text-gray-600">
                                <thead className="bg-blue-50">
                                    <tr><th className="text-left px-4 py-2">Nombre</th><th className="text-left px-4 py-2">Cargo</th><th className="text-left px-4 py-2">Fecha</th></tr>
                                </thead>
                                <tbody>
                                    {item.responsables.filter((r: any) => r.fase === 'TRATAMIENTO').map((r: any, i: number) => (
                                        <tr key={i} className="border-t border-gray-200">
                                            <td className="px-4 py-2">{r.nombre}</td>
                                            <td className="px-4 py-2">{r.cargo || '—'}</td>
                                            <td className="px-4 py-2">{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CIERRE */}
                {hasData(item.verificacion_eficacia) && (
                    <div className="px-4 pb-4">
                        <div className="bg-emerald-500 text-white px-3 py-2 text-sm font-semibold rounded-t">
                            SEGUIMIENTO Y CIERRE
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 border border-t-0 border-gray-300 rounded-b p-4">
                            <div className="md:col-span-2"><strong>Verificación de eficacia:</strong> {item.verificacion_eficacia}</div>
                            <div><strong>Fecha de cierre:</strong> {item.cierre_fecha ? new Date(item.cierre_fecha).toLocaleDateString() : '—'}</div>
                            <div><strong>Cerrada por:</strong> {item.cerrada_por || '—'}</div>
                        </div>
                    </div>
                )}

                {/* RESPONSABLES SEGUIMIENTO */}
                {Array.isArray(item.responsables) && item.responsables.some((r: any) => r.fase === 'SEGUIMIENTO') && (
                    <div className="px-4 pb-4">
                        <div className="bg-emerald-500/80 text-white px-3 py-2 text-sm font-semibold rounded-t">
                            RESPONSABLES - SEGUIMIENTO
                        </div>
                        <div className="border border-t-0 border-gray-300 rounded-b">
                            <table className="w-full text-sm text-gray-600">
                                <thead className="bg-emerald-50">
                                    <tr><th className="text-left px-4 py-2">Nombre</th><th className="text-left px-4 py-2">Cargo</th><th className="text-left px-4 py-2">Fecha</th></tr>
                                </thead>
                                <tbody>
                                    {item.responsables.filter((r: any) => r.fase === 'SEGUIMIENTO').map((r: any, i: number) => (
                                        <tr key={i} className="border-t border-gray-200">
                                            <td className="px-4 py-2">{r.nombre}</td>
                                            <td className="px-4 py-2">{r.cargo || '—'}</td>
                                            <td className="px-4 py-2">{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
