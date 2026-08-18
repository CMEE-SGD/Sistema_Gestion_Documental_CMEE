import { useEffect, useState, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit3, Eye, CircleCheck, CircleX } from 'lucide-react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';

const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

const GRUPOS_EQUIPO = [
    { label: null, secciones: ['EVALUADOR_LIDER', 'EVALUADOR_CALIDAD'] },
    { label: 'Evaluadores Técnicos', secciones: ['EVALUADOR_TECNICO'] },
    { label: 'Evaluadores en entrenamiento', secciones: ['EVALUADOR_ENTRENAMIENTO'] },
    { label: 'Observadores', secciones: ['OBSERVADOR'] },
];

const normalizarCronograma = (lista: any[]) => {
    if (!Array.isArray(lista) || lista.length === 0) return [];
    if (lista[0] && Array.isArray(lista[0].actividades)) return lista;
    const grupos: any[] = [];
    for (const row of lista) {
        const actividad = { hora: row.hora || '', actividad: row.actividad || '', evaluador: row.evaluador || '', referencia: row.referencia || '' };
        const ultimo = grupos[grupos.length - 1];
        if (ultimo && ultimo.fecha === (row.fecha || '')) {
            ultimo.actividades.push(actividad);
        } else {
            grupos.push({ fecha: row.fecha || '', actividades: [actividad] });
        }
    }
    return grupos;
};

export const AuditoriaDetallePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [auditoria, setAuditoria] = useState<any>(null);
    const [ncs, setNcs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const esExterna = auditoria?.tipo === 'EXTERNA';
    const puedeCrearNC = tienePermiso('Gestion de Calidad', 5);
    const puedeEditarNC = tienePermiso('Gestion de Calidad', 4);

    const fetchData = async () => {
        try {
            const res = await api.get(`/calidad/auditorias/${id}`);
            setAuditoria(res.data);
            setNcs(res.data.no_conformidades || []);
        } catch (error) {
            console.error('Error cargando auditoría', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleEliminarNc = async (ncId: number) => {
        if (!await confirm({ title: 'Eliminar NC', message: '¿Está seguro de eliminar esta no conformidad?' })) return;
        try {
            await api.delete(`/calidad/no-conformidades/${ncId}`);
            toast({ message: 'No conformidad eliminada correctamente.' });
            fetchData();
        } catch (error) {
            await alert({ message: 'Error al eliminar la no conformidad.' });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;
    if (!auditoria) return <div className="p-8 text-center text-gray-400">Auditoría no encontrada</div>;

    return (
        <div className="p-6">
            <button onClick={() => navigate('/calidad/auditorias')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver a auditorías
            </button>

            {/* Cabecera */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-800">{auditoria.codigo}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                auditoria.estado === 'PLANIFICADA' ? 'bg-blue-100 text-blue-700' :
                                auditoria.estado === 'EN_CURSO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>{auditoria.estado}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${esExterna ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'}`}>{esExterna ? 'EXTERNA' : 'INTERNA'}</span>
                        </div>
                        {esExterna ? (
                            <p className="text-gray-600 text-sm mb-3">{auditoria.nombre_oec || 'Evaluación externa de OEC'}</p>
                        ) : (
                            <p className="text-gray-600 text-sm mb-3">{auditoria.alcance}</p>
                        )}
                        <div className="flex gap-6 text-sm text-gray-500">
                            {auditoria.responsable ? (
                                <span><strong>Responsable:</strong> {[auditoria.responsable?.nombre, auditoria.responsable?.apellidos].filter(Boolean).join(' ')}{auditoria.responsable_auditoria ? ` (${auditoria.responsable_auditoria})` : ''}</span>
                            ) : esExterna ? (
                                <span><strong>Persona de contacto:</strong> {auditoria.persona_contacto || '-'}</span>
                            ) : null}
                            <span><strong>Inicio:</strong> {new Date(auditoria.fecha_inicio).toLocaleDateString()}</span>
                            {auditoria.fecha_fin && <span><strong>Fin:</strong> {new Date(auditoria.fecha_fin).toLocaleDateString()}</span>}
                            <span><strong>Tipo:</strong> {auditoria.tipo}</span>
                        </div>
                        {auditoria.observaciones && (
                            <p className="text-sm text-gray-500 mt-3"><strong>Observaciones:</strong> {auditoria.observaciones}</p>
                        )}
                        {auditoria.archivo_planificacion && (
                            <div className="mt-3">
                                <a href={`${BACKEND_URL}${auditoria.archivo_planificacion}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">Ver/descargar planificación</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Programa de Auditoría */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-bold text-gray-800">{esExterna ? 'Plan de Evaluación' : 'Programa de Auditoría'}</h2>
                    {tienePermiso('Gestion de Calidad', 4) && (
                        <Button variant="default" onClick={() => navigate(`/calidad/auditorias/editar/${id}`)}>
                            <Edit3 className="w-4 h-4 mr-1" /> {esExterna ? 'Editar plan' : 'Editar programa'}
                        </Button>
                    )}
                </div>
                <div className="p-4 flex flex-col gap-5">
                    {esExterna && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">1. RESUMEN GENERAL</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-t-0 border-gray-300 rounded-b p-3 text-sm text-gray-700">
                                <div><strong>Nombre del OEC:</strong> {auditoria.nombre_oec || '-'}</div>
                                <div><strong>Expediente N°:</strong> {auditoria.expediente_nro || '-'}</div>
                                <div><strong>Tipo de OEC:</strong> {auditoria.tipo_oec || '-'}</div>
                                <div><strong>E-mail:</strong> {auditoria.email_oec || '-'}</div>
                                <div><strong>Ciudad, País:</strong> {auditoria.ciudad_pais || '-'}</div>
                                <div><strong>Teléfono:</strong> {auditoria.telefono_oec || '-'}</div>
                                <div><strong>Persona de contacto:</strong> {auditoria.persona_contacto || '-'}</div>
                                <div className="md:col-span-2"><strong>Dirección Oficina Principal:</strong> {auditoria.direccion_oficina || '-'}</div>
                                {auditoria.localizaciones_criticas && <div className="md:col-span-2"><strong>Localizaciones críticas / Unidades técnicas / Sucursales:</strong> {auditoria.localizaciones_criticas}</div>}
                            </div>
                        </div>
                    )}
                    {esExterna && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">ALCANCE DE EVALUACIÓN</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-t-0 border-gray-300 rounded-b p-3 text-sm text-gray-700">
                                {auditoria.alcance && <div className="md:col-span-2"><strong>Alcance de Evaluación:</strong> {auditoria.alcance}</div>}
                                {auditoria.norma_acreditacion && <div className="md:col-span-2"><strong>Norma de Acreditación:</strong> {auditoria.norma_acreditacion}</div>}
                                {auditoria.actividades_evaluacion && <div><strong>Actividades de Evaluación:</strong> {auditoria.actividades_evaluacion}</div>}
                                {auditoria.idioma_evaluacion && <div><strong>Idioma de Evaluación:</strong> {auditoria.idioma_evaluacion}</div>}
                                {Array.isArray(auditoria.tipo_evaluacion) && auditoria.tipo_evaluacion.length > 0 && (
                                    <div><strong>Tipo de Evaluación:</strong> {auditoria.tipo_evaluacion.join(', ')}</div>
                                )}
                                {auditoria.fecha_evaluacion_anterior && <div><strong>Fecha evaluación anterior:</strong> {auditoria.fecha_evaluacion_anterior}</div>}
                                {auditoria.fecha_testificacion && <div><strong>Fecha testificación:</strong> {auditoria.fecha_testificacion}</div>}
                                {auditoria.localizaciones_evaluacion && <div className="md:col-span-2"><strong>Localizaciones, unidades técnicas o sucursales:</strong> {auditoria.localizaciones_evaluacion}</div>}
                            </div>
                        </div>
                    )}
                    {!esExterna && auditoria.descripcion && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">DESCRIPCIÓN</div>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm text-gray-700 whitespace-pre-wrap">{auditoria.descripcion}</div>
                        </div>
                    )}
                    {!esExterna && auditoria.objeto && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">OBJETO</div>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm text-gray-700 whitespace-pre-wrap">{auditoria.objeto}</div>
                        </div>
                    )}
                    {!esExterna && auditoria.alcance && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">ALCANCE</div>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm text-gray-700 whitespace-pre-wrap">{auditoria.alcance}</div>
                        </div>
                    )}
                    {auditoria.documentos_referencia && auditoria.documentos_referencia.length > 0 && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">{esExterna ? '2. DOCUMENTOS DE REFERENCIA' : 'DOCUMENTOS DE REFERENCIA'}</div>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3">
                                <ul className="list-disc pl-5 text-sm text-gray-700 flex flex-col gap-1">
                                    {auditoria.documentos_referencia.map((d: string, i: number) => <li key={i}>{d}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                    {!esExterna && (auditoria.responsable || auditoria.responsable_auditoria) && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">RESPONSABLE DE AUDITORÍA</div>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm text-gray-700">
                                {[auditoria.responsable?.nombre, auditoria.responsable?.apellidos].filter(Boolean).join(' ')}
                                {auditoria.responsable_auditoria ? ` (${auditoria.responsable_auditoria})` : ''}
                            </div>
                        </div>
                    )}
                    {auditoria.equipo_auditor && auditoria.equipo_auditor.length > 0 && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">{esExterna ? '3. EQUIPO EVALUADOR' : 'EQUIPO AUDITOR'}</div>
                            {esExterna ? (
                                <div className="border border-t-0 border-gray-300 rounded-b overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold">Función / Rol</th>
                                                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                                                <th className="px-3 py-2 text-left font-semibold">Teléfono</th>
                                                <th className="px-3 py-2 text-left font-semibold">E-mail</th>
                                                <th className="px-3 py-2 text-left font-semibold">Entidad</th>
                                                <th className="px-3 py-2 text-left font-semibold">Alcance / Campo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(['IN_SITU', 'REMOTO'] as const).map(g => {
                                                const miembros = (auditoria.equipo_auditor as any[]).filter(m => (m.modalidad || 'IN_SITU') === g);
                                                if (miembros.length === 0) return null;
                                                return [
                                                    <tr key={`h-${g}`}>
                                                        <td colSpan={6} className="px-3 py-2 bg-gray-50 font-bold text-gray-700">
                                                            {g === 'IN_SITU' ? 'IN SITU' : 'REMOTO'}
                                                        </td>
                                                    </tr>,
                                                    ...miembros.map((m, i) => (
                                                        <tr key={`${g}-${i}`}>
                                                            <td className="px-3 py-2">{m.rol || m.funcion || '-'}</td>
                                                            <td className="px-3 py-2">{m.nombre || '-'}</td>
                                                            <td className="px-3 py-2">{m.telefono || '-'}</td>
                                                            <td className="px-3 py-2">{m.email || '-'}</td>
                                                            <td className="px-3 py-2">{m.entidad || '-'}</td>
                                                            <td className="px-3 py-2 whitespace-pre-wrap">{m.alcance || '-'}</td>
                                                        </tr>
                                                    )),
                                                ];
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="border border-t-0 border-gray-300 rounded-b overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold">Función</th>
                                                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                                                <th className="px-3 py-2 text-left font-semibold">Designación</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {GRUPOS_EQUIPO.map(grupo => {
                                                const filas = auditoria.equipo_auditor.filter((m: any) => grupo.secciones.includes(m.seccion));
                                                if (filas.length === 0) return null;
                                                return [
                                                    grupo.label && (
                                                        <tr key={`h-${grupo.label}`}>
                                                            <td colSpan={3} className="px-3 py-2 bg-gray-50 font-bold text-gray-700">{grupo.label}</td>
                                                        </tr>
                                                    ),
                                                    ...filas.map((m: any, i: number) => (
                                                        <tr key={`${grupo.label}-${i}`}>
                                                            <td className="px-3 py-2">{m.funcion || '-'}</td>
                                                            <td className="px-3 py-2">{m.nombre || '-'}</td>
                                                            <td className="px-3 py-2 font-medium">{m.designacion || '-'}</td>
                                                        </tr>
                                                    )),
                                                ];
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                    {auditoria.testificaciones && auditoria.testificaciones.length > 0 && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">{esExterna ? '4. TESTIFICACIONES A REALIZARSE' : 'TESTIFICACIONES A REALIZARSE'}</div>
                            <div className="border border-t-0 border-gray-300 rounded-b overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold">No.</th>
                                            <th className="px-3 py-2 text-left font-semibold">Método de ensayo / medida</th>
                                            <th className="px-3 py-2 text-left font-semibold">Técnica / Magnitud</th>
                                            <th className="px-3 py-2 text-left font-semibold">Matriz / Instrumento de medida</th>
                                            <th className="px-3 py-2 text-left font-semibold">Evaluador / Experto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {auditoria.testificaciones.map((t: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2">{t.test || '-'}</td>
                                                <td className="px-3 py-2">{t.metodo_ensayo || '-'}</td>
                                                <td className="px-3 py-2 whitespace-pre-wrap">{t.metodo_magnitud || '-'}</td>
                                                <td className="px-3 py-2">{t.muestra || '-'}</td>
                                                <td className="px-3 py-2">{t.evaluador || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {auditoria.cronograma && auditoria.cronograma.length > 0 && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">{esExterna ? '5. HORARIO DE EVALUACIÓN (CRONOGRAMA)' : 'CRONOGRAMA DE AUDITORÍA'}</div>
                            <div className="border border-t-0 border-gray-300 rounded-b overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold">Fecha/Hora</th>
                                            <th className="px-3 py-2 text-left font-semibold">Función o actividad</th>
                                            <th className="px-3 py-2 text-left font-semibold">Evaluador</th>
                                            <th className="px-3 py-2 text-left font-semibold">Ref. normativa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {normalizarCronograma(auditoria.cronograma).map((g: any, gi: number) => (
                                            <Fragment key={gi}>
                                                <tr className="bg-gray-50">
                                                    <td className="px-3 py-2 font-semibold text-gray-700 text-center">{g.fecha || '-'}</td>
                                                    <td colSpan={3}></td>
                                                </tr>
                                                {g.actividades.map((a: any, ai: number) => (
                                                    <tr key={ai}>
                                                        <td className="px-3 py-2 text-center">{a.hora || '-'}</td>
                                                        <td className="px-3 py-2 whitespace-pre-wrap">{a.actividad || '-'}</td>
                                                        <td className="px-3 py-2">{a.evaluador || '-'}</td>
                                                        <td className="px-3 py-2">{a.referencia || '-'}</td>
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {esExterna && (auditoria.fecha_elaboracion || auditoria.elaborado_por) && (
                        <div>
                            <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">ELABORACIÓN DEL PLAN</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-t-0 border-gray-300 rounded-b p-3 text-sm text-gray-700">
                                <div><strong>Fecha de elaboración:</strong> {auditoria.fecha_elaboracion ? new Date(auditoria.fecha_elaboracion).toLocaleDateString() : '-'}</div>
                                <div><strong>Elaborado por:</strong> {auditoria.elaborado_por || '-'}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* No Conformidades */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-bold text-gray-800">No Conformidades ({ncs.length})</h2>
                    {puedeCrearNC && (
                        <Button variant="default" onClick={() => navigate(`/calidad/auditorias/${id}/nc/nueva`)}>
                            <Plus className="w-4 h-4 mr-1" /> Nueva NC
                        </Button>
                    )}
                </div>

                {ncs.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-sm">No se registraron no conformidades en esta auditoría</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold">N°</th>
                                <th className="px-4 py-3 font-semibold">Tipo</th>
                                <th className="px-4 py-3 font-semibold">Requisito</th>
                                <th className="px-4 py-3 font-semibold">Hallazgo</th>
                                <th className="px-4 py-3 font-semibold">Evidencia</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="px-4 py-3 font-semibold text-center">OEC</th>
                                <th className="px-4 py-3 font-semibold text-center">Reiterada</th>
                                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ncs.map(nc => (
                                <tr key={nc.id} onClick={() => navigate(`/calidad/auditorias/${id}/nc/${nc.id}`)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-800">{nc.codigo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${nc.categoria === 'COM' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{nc.categoria || 'NC'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{nc.requisito || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{nc.hallazgo}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{nc.evidencia || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${nc.estado === 'ABIERTA' ? 'bg-red-100 text-red-700' : nc.estado === 'EN_CURSO' ? 'bg-amber-100 text-amber-700' : nc.estado === 'VERIFICADA' ? 'bg-sky-100 text-sky-700' : nc.estado === 'CERRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>{nc.estado || 'ABIERTA'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">{nc.aceptada_oec ? <CircleCheck className="w-4 h-4 text-emerald-600 inline" /> : <CircleX className="w-4 h-4 text-red-400 inline" />}</td>
                                    <td className="px-4 py-3 text-center">{nc.reiterada ? <CircleCheck className="w-4 h-4 text-emerald-600 inline" /> : <CircleX className="w-4 h-4 text-red-400 inline" />}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/calidad/auditorias/${id}/nc/${nc.id}`); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver NC"><Eye className="w-4 h-4" /></button>
                                            {puedeEditarNC && (
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/calidad/auditorias/${id}/nc/editar/${nc.id}`); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Editar NC"><Edit3 className="w-4 h-4" /></button>
                                            )}
                                            {puedeCrearNC && (
                                                <button onClick={(e) => { e.stopPropagation(); handleEliminarNc(nc.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar NC"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
