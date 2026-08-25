// src/modules/calidad/components/VerificarEficaciaModal.tsx
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import api from '../../../core/api/axios';
import { Modal } from '../../../shared/components/molecules/Modal';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

import { buildFileUrl } from '../../../shared/utils/backendUrl';

const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
};

interface VerificarEficaciaModalProps {
    nc: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
}

const resultadoBadge = (r: string) => {
    const styles: Record<string, string> = {
        EFICAZ: 'bg-emerald-100 text-emerald-700',
        PARCIAL: 'bg-amber-100 text-amber-700',
        NO_EFICAZ: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${styles[r] || 'bg-gray-100 text-gray-700'}`}>{r || '—'}</span>;
};

export const VerificarEficaciaModal = ({ nc, isOpen, onClose, onSuccess }: VerificarEficaciaModalProps) => {
    const { alert } = useAlert();
    const { toast } = useToast();
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [verificadorId, setVerificadorId] = useState('');
    const [fechaVerif, setFechaVerif] = useState('');
    const [resultadoVerif, setResultadoVerif] = useState('EFICAZ');
    const [observacionesVerif, setObservacionesVerif] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        api.get('/personas')
            .then(res => setPersonas(res.data))
            .catch(() => setPersonas([]));
        const v = nc?.verificacion_eficacia;
        setVerificadorId(v?.aprobado_por_id ? String(v.aprobado_por_id) : '');
        setFechaVerif(v?.fecha || '');
        setResultadoVerif(v?.resultado || 'EFICAZ');
        setObservacionesVerif(v?.observaciones || '');
    }, [isOpen, nc]);

    const plan = nc?.plan_accion || {};

    const jefesCalidad = personas.filter((p: any) => p.puestos?.some((pp: any) => pp.activo && pp.puesto?.codigo === 'JDC'));
    const listaJefes = jefesCalidad.length > 0 ? jefesCalidad : personas;

    const handleVerificar = async () => {
        if (!verificadorId) {
            await alert({ message: 'Seleccione el Jefe de Calidad que aprueba la verificación.' });
            return;
        }
        if (!fechaVerif) {
            await alert({ message: 'Ingrese la fecha de verificación.' });
            return;
        }
        setLoading(true);
        try {
            const persona = personas.find(p => p.id === Number(verificadorId));
            const verif = {
                aprobado_por: persona ? `${persona.nombre} ${persona.apellidos}` : '',
                aprobado_por_id: Number(verificadorId),
                fecha: fechaVerif,
                resultado: resultadoVerif,
                observaciones: observacionesVerif,
            };
            const fd = new FormData();
            fd.append('verificacion_eficacia', JSON.stringify(verif));
            await api.patch(`/calidad/no-conformidades/${nc.id}`, fd);
            const estadoActual = nc.estado || '';
            if (resultadoVerif === 'EFICAZ') {
                if (estadoActual !== 'EN_CURSO' && estadoActual !== 'VERIFICADA') {
                    await api.patch(`/calidad/no-conformidades/${nc.id}/estado`, { estado: 'EN_CURSO', observaciones: 'Inicio de acciones' });
                }
                if (estadoActual !== 'VERIFICADA') {
                    await api.patch(`/calidad/no-conformidades/${nc.id}/estado`, { estado: 'VERIFICADA', observaciones: observacionesVerif || 'Eficacia de las acciones verificada' });
                }
            } else {
                if (estadoActual !== 'EN_CURSO') {
                    await api.patch(`/calidad/no-conformidades/${nc.id}/estado`, { estado: 'EN_CURSO', observaciones: 'Verificación no eficaz: se mantienen/ajustan las acciones' });
                }
            }
            toast({ message: resultadoVerif === 'EFICAZ' ? 'Verificación registrada. La NC quedó como VERIFICADA.' : 'Verificación registrada. La NC continúa EN CURSO.' });
            await onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al registrar la verificación';
            await alert({ message: msg });
        } finally {
            setLoading(false);
        }
    };

    const Titulo = ({ children }: { children: React.ReactNode }) => (
        <div className="bg-gray-100 border border-gray-300 rounded-t px-3 py-2 text-xs font-bold text-gray-700">{children}</div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Verificación de eficacia de las acciones">
            <div className="flex flex-col gap-5">
                {/* Detalles del plan (solo lectura) */}
                <div>
                    <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">DETALLE DEL PLAN DE ACCIÓN</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-3 flex flex-col gap-4">
                        <div>
                            <Titulo>Análisis de Extensión</Titulo>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm" dangerouslySetInnerHTML={{ __html: plan.analisisExtension || '—' }} />
                            {plan.obExtension && <div className="text-xs text-gray-500 mt-1"><strong>Ob.:</strong> {plan.obExtension}</div>}
                        </div>
                        <div>
                            <Titulo>Análisis de Causa</Titulo>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm" dangerouslySetInnerHTML={{ __html: plan.analisisCausa || '—' }} />
                            {plan.obCausa && <div className="text-xs text-gray-500 mt-1"><strong>Ob.:</strong> {plan.obCausa}</div>}
                        </div>
                        <div>
                            <Titulo>Causa Raíz</Titulo>
                            <div className="border border-t-0 border-gray-300 rounded-b p-3 text-sm" dangerouslySetInnerHTML={{ __html: plan.causaRaiz || '—' }} />
                        </div>
                        {plan.correcciones && plan.correcciones.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Corrección</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Evidencia/s</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Fecha Impl.</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Obs. SAE</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Ob.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {plan.correcciones.map((c: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 whitespace-pre-wrap">{c.correccion || '-'}</td>
                                                <td className="px-3 py-2 whitespace-pre-wrap">{c.evidencia || '-'}</td>
                                                <td className="px-3 py-2">{c.fecha || '-'}</td>
                                                <td className="px-3 py-2 whitespace-pre-wrap">{c.observaciones || '-'}</td>
                                                <td className="px-3 py-2">{c.ob || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {plan.accionesCorrectivas && plan.accionesCorrectivas.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Acción Correctiva</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Evidencia/s</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Fecha Impl.</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Obs. SAE</th>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-gray-300">Ob.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {plan.accionesCorrectivas.map((a: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 whitespace-pre-wrap">{a.accion || '-'}</td>
                                                <td className="px-3 py-2 whitespace-pre-wrap">{a.evidencia || '-'}</td>
                                                <td className="px-3 py-2">{a.fecha || '-'}</td>
                                                <td className="px-3 py-2 whitespace-pre-wrap">{a.observaciones || '-'}</td>
                                                <td className="px-3 py-2">{a.ob || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {plan.archivo && (
                            <a href={buildFileUrl(plan.archivo) ?? undefined} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
                                {plan.archivo_nombre ? 'Ver/descargar: ' + plan.archivo_nombre : 'Ver/descargar archivo'}
                            </a>
                        )}
                    </div>
                </div>

                {/* Formulario de verificación */}
                <div>
                    <div className="bg-[#88bddf] text-white px-3 py-2 text-sm font-semibold rounded-t">VERIFICACIÓN DE EFICACIA — JEFE DE CALIDAD</div>
                    <div className="border border-t-0 border-gray-300 rounded-b p-3 flex flex-col gap-4">
                        {nc?.verificacion_eficacia && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                <div className="text-xs font-bold text-blue-800 mb-2">VERIFICACIÓN ACTUAL</div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-700">
                                    <span><strong>Aprobado por:</strong> {nc.verificacion_eficacia.aprobado_por || '—'}</span>
                                    <span><strong>Fecha:</strong> {nc.verificacion_eficacia.fecha || '—'}</span>
                                    <span><strong>Resultado:</strong> {resultadoBadge(nc.verificacion_eficacia.resultado)}</span>
                                </div>
                                {nc.verificacion_eficacia.observaciones && (
                                    <div className="text-gray-700 mt-1 whitespace-pre-wrap"><strong>Observaciones:</strong> {nc.verificacion_eficacia.observaciones}</div>
                                )}
                                <p className="text-xs text-blue-700 mt-2">Al registrar una nueva verificación se reemplaza la actual.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-700">Aprobado por (Jefe de Calidad) <span className="text-red-500">*</span></label>
                                <select value={verificadorId} onChange={e => setVerificadorId(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white">
                                    <option value="">Seleccione el Jefe de Calidad...</option>
                                    {listaJefes.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-700">Fecha de verificación <span className="text-red-500">*</span></label>
                                <input type="date" value={fechaVerif} onChange={e => setFechaVerif(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-700">Resultado</label>
                                <select value={resultadoVerif} onChange={e => setResultadoVerif(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white">
                                    <option value="EFICAZ">Eficaz — se cierra la NC</option>
                                    <option value="PARCIAL">Parcial — se requieren acciones adicionales</option>
                                    <option value="NO_EFICAZ">No eficaz — la NC continúa en proceso</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Observaciones</label>
                            <textarea value={observacionesVerif} onChange={e => setObservacionesVerif(e.target.value)} onInput={autoResize} rows={2} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" placeholder="Resultado de la verificación de las acciones implementadas..." />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={handleVerificar} disabled={loading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                                <CheckCircle2 className="w-4 h-4" /> {loading ? 'Guardando...' : 'Registrar verificación'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
