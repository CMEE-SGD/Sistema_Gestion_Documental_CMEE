import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../../core/api/axios';

export const DetalleNcPage = () => {
    const { auditoriaId, ncId } = useParams();
    const navigate = useNavigate();
    const [nc, setNc] = useState<any>(null);

    useEffect(() => {
        api.get(`/calidad/no-conformidades/${ncId}`)
            .then(res => setNc(res.data))
            .catch(() => navigate(`/calidad/auditorias/${auditoriaId}`));
    }, [ncId]);

    if (!nc) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button onClick={() => navigate(`/calidad/auditorias/${auditoriaId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver a la auditoría
            </button>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="w-[10%] p-4 text-center align-top border-r border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Categoría</div>
                                <div className="font-bold text-base">{nc.categoria || 'NC'}</div>
                            </td>
                            <td className="w-[8%] p-4 text-center align-top border-r border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">No.</div>
                                <div className="font-bold text-base">{nc.codigo}</div>
                            </td>
                            <td className="p-4 align-top">
                                <div className="text-xs text-gray-500 mb-1">Requisito</div>
                                <div>{nc.requisito || '-'}</div>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                            <td colSpan={3} className="p-4 align-top">
                                <div className="text-xs text-gray-500 mb-1">{nc.categoria === 'COM' ? 'Comentarios:' : 'No conformidades:'}</div>
                                <div className="whitespace-pre-wrap">{nc.hallazgo}</div>
                            </td>
                        </tr>
                        {nc.evidencia && (
                            <tr>
                                <td colSpan={3} className="p-4 align-top">
                                    <div className="text-xs text-gray-500 mb-1">Evidencias:</div>
                                    <div className="whitespace-pre-wrap">{nc.evidencia}</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {nc.plan_accion && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Plan de Acción</h2>

                    <div className="border border-gray-300 rounded mb-4">
                        <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300">
                            <div className="col-span-10 px-3 py-2 text-xs font-bold text-gray-700">Análisis de Extensión</div>
                            <div className="col-span-2 px-3 py-2 text-xs font-bold text-gray-700 text-center">Ob.</div>
                        </div>
                        <div className="grid grid-cols-12">
                            <div className="col-span-10 p-3 border-r border-gray-200" dangerouslySetInnerHTML={{ __html: nc.plan_accion.analisisExtension || '' }} />
                            <div className="col-span-2 p-3 border-l border-gray-200 text-sm whitespace-pre-wrap">{nc.plan_accion.obExtension || ''}</div>
                        </div>
                    </div>

                    <div className="border border-gray-300 rounded mb-4">
                        <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300">
                            <div className="col-span-10 px-3 py-2 text-xs font-bold text-gray-700">Análisis de Causa</div>
                            <div className="col-span-2 px-3 py-2 text-xs font-bold text-gray-700 text-center">Ob.</div>
                        </div>
                        <div className="grid grid-cols-12">
                            <div className="col-span-10 p-3 border-r border-gray-200" dangerouslySetInnerHTML={{ __html: nc.plan_accion.analisisCausa || '' }} />
                            <div className="col-span-2 p-3 border-l border-gray-200 text-sm whitespace-pre-wrap">{nc.plan_accion.obCausa || ''}</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="bg-gray-100 border border-gray-300 rounded-t px-3 py-2 text-xs font-bold text-gray-700">Causa Raíz:</div>
                        <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm" dangerouslySetInnerHTML={{ __html: nc.plan_accion.causaRaiz || '' }} />
                    </div>

                    {nc.plan_accion.correcciones && nc.plan_accion.correcciones.length > 0 && (
                        <div className="border border-gray-300 rounded mb-4 overflow-hidden">
                            <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-700">
                                <div className="col-span-3 px-3 py-2">Corrección</div>
                                <div className="col-span-3 px-3 py-2">Evidencia/s a presentar</div>
                                <div className="col-span-2 px-3 py-2">Fecha Implementación</div>
                                <div className="col-span-2 px-3 py-2">Observaciones SAE</div>
                                <div className="col-span-2 px-3 py-2 text-center">Ob.</div>
                            </div>
                            {nc.plan_accion.correcciones.map((c: any, i: number) => (
                                <div key={i} className="grid grid-cols-12 border-b border-gray-200 last:border-b-0">
                                    <div className="col-span-3 p-2 border-r border-gray-200 text-sm whitespace-pre-wrap">{c.correccion || '-'}</div>
                                    <div className="col-span-3 p-2 border-r border-gray-200 text-sm whitespace-pre-wrap">{c.evidencia || '-'}</div>
                                    <div className="col-span-2 p-2 border-r border-gray-200 text-sm">{c.fecha || '-'}</div>
                                    <div className="col-span-2 p-2 border-r border-gray-200 text-sm whitespace-pre-wrap">{c.observaciones || '-'}</div>
                                    <div className="col-span-2 p-2 border-l border-gray-200 text-sm whitespace-pre-wrap">{c.ob || '-'}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {nc.plan_accion.accionesCorrectivas && nc.plan_accion.accionesCorrectivas.length > 0 && (
                        <div className="border border-gray-300 rounded overflow-hidden">
                            <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300 text-xs font-bold text-gray-700">
                                <div className="col-span-3 px-3 py-2">Acción Correctiva</div>
                                <div className="col-span-3 px-3 py-2">Evidencia/s a presentar</div>
                                <div className="col-span-2 px-3 py-2">Fecha Implementación</div>
                                <div className="col-span-2 px-3 py-2">Observaciones SAE</div>
                                <div className="col-span-2 px-3 py-2 text-center">Ob.</div>
                            </div>
                            {nc.plan_accion.accionesCorrectivas.map((a: any, i: number) => (
                                <div key={i} className="grid grid-cols-12 border-b border-gray-200 last:border-b-0">
                                    <div className="col-span-3 p-2 border-r border-gray-200 text-sm whitespace-pre-wrap">{a.accion || '-'}</div>
                                    <div className="col-span-3 p-2 border-r border-gray-200 text-sm whitespace-pre-wrap">{a.evidencia || '-'}</div>
                                    <div className="col-span-2 p-2 border-r border-gray-200 text-sm">{a.fecha || '-'}</div>
                                    <div className="col-span-2 p-2 border-r border-gray-200 text-sm whitespace-pre-wrap">{a.observaciones || '-'}</div>
                                    <div className="col-span-2 p-2 border-l border-gray-200 text-sm whitespace-pre-wrap">{a.ob || '-'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!nc.plan_accion && (
                <div className="mt-6 flex justify-end">
                    <button onClick={() => navigate(`/calidad/auditorias/${auditoriaId}/nc/${ncId}/plan-accion`)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
                        Crear Plan de Acción
                    </button>
                </div>
            )}
        </div>
    );
};
