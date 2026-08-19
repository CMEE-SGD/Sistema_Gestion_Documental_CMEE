import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Lock, History, CheckCircle2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { VerificarEficaciaModal } from '../components/VerificarEficaciaModal';
import { encodeId, decodeId } from '../../../shared/utils/ids';

const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

const ESTADO_STYLES: Record<string, string> = {
    ABIERTA: 'bg-red-100 text-red-700',
    EN_CURSO: 'bg-amber-100 text-amber-700',
    VERIFICADA: 'bg-sky-100 text-sky-700',
    CERRADA: 'bg-emerald-100 text-emerald-700',
};

export const DetalleNcPage = () => {
    const { auditoriaId: rawAid, ncId: rawNcId } = useParams<{auditoriaId: string; ncId: string}>();
    const auditoriaId = rawAid ? decodeId(rawAid) : undefined;
    const ncId = rawNcId ? decodeId(rawNcId) : undefined;
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [nc, setNc] = useState<any>(null);
    const [verifOpen, setVerifOpen] = useState(false);

    const volverA = auditoriaId ? `/calidad/auditorias/${encodeId(auditoriaId)}` : '/calidad/no-conformidades';

    const fetchNc = async () => {
        try {
            const res = await api.get(`/calidad/no-conformidades/${ncId}`);
            setNc(res.data);
        } catch (error) {
            console.error('Error recargando NC', error);
        }
    };

    useEffect(() => {
        api.get(`/calidad/no-conformidades/${ncId}`)
            .then(res => setNc(res.data))
            .catch(() => navigate(volverA));
    }, [ncId]);

    const estadoBadge = (estado: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ESTADO_STYLES[estado] || 'bg-gray-100 text-gray-700'}`}>
            {estado || 'ABIERTA'}
        </span>
    );

    const rutaPlan = (editar?: boolean) =>
        auditoriaId
            ? `/calidad/auditorias/${encodeId(auditoriaId)}/nc/${encodeId(ncId!)}/plan-accion${editar ? '?editar=1' : ''}`
            : `/calidad/no-conformidades/${encodeId(ncId!)}/plan-accion${editar ? '?editar=1' : ''}`;

    const handleCerrar = async () => {
        if (!await confirm({ title: 'Cerrar NC', message: '¿Confirma el cierre formal de esta no conformidad? El cierre es definitivo.' })) return;
        try {
            await api.patch(`/calidad/no-conformidades/${ncId}/estado`, { estado: 'CERRADA', observaciones: 'Cierre formal de la no conformidad' });
            toast({ message: 'No conformidad cerrada correctamente.' });
            const res = await api.get(`/calidad/no-conformidades/${ncId}`);
            setNc(res.data);
        } catch (error: any) {
            await alert({ message: error.response?.data?.message || 'Error al cerrar la no conformidad.' });
        }
    };

    const handleReabrir = async () => {
        if (!await confirm({ title: 'Reabrir NC', message: '¿Confirma reabrir esta no conformidad para continuar las acciones?' })) return;
        try {
            await api.patch(`/calidad/no-conformidades/${ncId}/estado`, { estado: 'EN_CURSO', observaciones: 'Reapertura de la no conformidad' });
            toast({ message: 'No conformidad reabierta.' });
            const res = await api.get(`/calidad/no-conformidades/${ncId}`);
            setNc(res.data);
        } catch (error: any) {
            await alert({ message: error.response?.data?.message || 'Error al reabrir la no conformidad.' });
        }
    };

    if (!nc) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button onClick={() => navigate(volverA)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> {auditoriaId ? 'Volver a la auditoría' : 'Volver a no conformidades'}
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
                                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Estado</div>
                                        {estadoBadge(nc.estado)}
                                    </div>
                                    {nc.responsable && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Responsable</div>
                                            <div className="text-sm font-medium">{nc.responsable.nombre} {nc.responsable.apellidos}</div>
                                        </div>
                                    )}
                                    {nc.fecha_cierre && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Fecha de cierre</div>
                                            <div className="text-sm font-medium">{new Date(nc.fecha_cierre).toLocaleDateString()}</div>
                                        </div>
                                    )}
                                </div>
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
                        {nc.archivo && (
                            <tr>
                                <td colSpan={3} className="p-4 align-top">
                                    <div className="text-xs text-gray-500 mb-1">Archivo adjunto:</div>
                                    <a href={`${BACKEND_URL}${nc.archivo}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">Ver/descargar archivo</a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {nc.plan_accion && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Plan de Acción</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setVerifOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
                                <CheckCircle2 className="w-3 h-3" /> Verificar Eficacia
                            </button>
                            <button onClick={() => navigate(rutaPlan(true))} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
                                <Pencil className="w-3 h-3" /> Editar Plan de Acción
                            </button>
                        </div>
                    </div>

                    {nc.verificacion_eficacia && (
                        <div className="mb-4 border border-gray-300 rounded overflow-hidden">
                            <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 text-xs font-bold text-gray-700">Verificación de eficacia — aprobación del Jefe de Calidad</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Aprobado por</div>
                                    <div className="text-sm font-medium">{nc.verificacion_eficacia.aprobado_por || '—'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Fecha</div>
                                    <div className="text-sm font-medium">{nc.verificacion_eficacia.fecha || '—'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Resultado</div>
                                    <div className="text-sm font-medium">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${nc.verificacion_eficacia.resultado === 'EFICAZ' ? 'bg-emerald-100 text-emerald-700' : nc.verificacion_eficacia.resultado === 'PARCIAL' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                            {nc.verificacion_eficacia.resultado || '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {nc.verificacion_eficacia.observaciones && (
                                <div className="px-3 pb-3">
                                    <div className="text-xs text-gray-500 mb-1">Observaciones</div>
                                    <div className="text-sm whitespace-pre-wrap">{nc.verificacion_eficacia.observaciones}</div>
                                </div>
                            )}
                        </div>
                    )}

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

                    {nc.plan_accion.archivo && (
                        <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded">
                            <div className="text-xs font-semibold text-gray-700 mb-1">Archivo adjunto (Plan de Acción):</div>
                            <a href={`${BACKEND_URL}${nc.plan_accion.archivo}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
                                {nc.plan_accion.archivo_nombre ? 'Ver/descargar: ' + nc.plan_accion.archivo_nombre : 'Ver/descargar archivo'}
                            </a>
                        </div>
                    )}

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

            {(nc.estado === 'EN_CURSO' || nc.estado === 'VERIFICADA') && (
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => navigate(volverA)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Regresar
                    </button>
                    <button onClick={handleCerrar} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
                        <Lock className="w-4 h-4" /> Cerrar NC
                    </button>
                </div>
            )}
            {nc.estado === 'VERIFICADA' && (
                <div className="mt-2 flex justify-end">
                    <button onClick={handleReabrir} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors">
                        Reabrir NC
                    </button>
                </div>
            )}

            {nc.historial && nc.historial.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <History className="w-4 h-4 text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-800">Trazabilidad del estado</h2>
                    </div>
                    <ol className="relative border-l border-gray-200 ml-2 space-y-5">
                        {nc.historial.map((h: any, i: number) => (
                            <li key={i} className="ml-6">
                                <span className={`absolute -left-[7px] mt-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${h.estado_nuevo === 'CERRADA' ? 'bg-emerald-500' : h.estado_nuevo === 'VERIFICADA' ? 'bg-sky-500' : h.estado_nuevo === 'EN_CURSO' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {h.estado_anterior ? `${h.estado_anterior} → ${h.estado_nuevo}` : `Inicio → ${h.estado_nuevo}`}
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {h.accion === 'CREACION' ? 'Registro de la no conformidad' : 'Cambio de estado'}
                                    {h.realizado_por ? ` — ${h.realizado_por.nombre} ${h.realizado_por.apellidos}` : ''}
                                </div>
                                {h.observaciones && <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{h.observaciones}</div>}
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {!nc.plan_accion && (
                <div className="mt-6 flex justify-end">
                    <button onClick={() => navigate(rutaPlan())} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
                        Crear Plan de Acción
                    </button>
                </div>
            )}

            <VerificarEficaciaModal
                nc={nc}
                isOpen={verifOpen}
                onClose={() => setVerifOpen(false)}
                onSuccess={fetchNc}
            />
        </div>
    );
};
