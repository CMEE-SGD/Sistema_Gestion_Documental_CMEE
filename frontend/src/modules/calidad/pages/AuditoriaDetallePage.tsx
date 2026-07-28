import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CircleCheck, CircleX } from 'lucide-react';
import api from '../../../core/api/axios';
import { Modal } from '../../../shared/components/molecules/Modal';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { tienePermiso } from '../../../shared/utils/auth';
import { NcForm } from '../components/NcForm';

export const AuditoriaDetallePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [auditoria, setAuditoria] = useState<any>(null);
    const [ncs, setNcs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [ncModalOpen, setNcModalOpen] = useState(false);

    const puedeCrearNC = tienePermiso('Gestion de Calidad', 5);

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
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{auditoria.alcance}</p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <span><strong>Responsable:</strong> {auditoria.responsable?.nombre} {auditoria.responsable?.apellidos}</span>
                            <span><strong>Inicio:</strong> {new Date(auditoria.fecha_inicio).toLocaleDateString()}</span>
                            {auditoria.fecha_fin && <span><strong>Fin:</strong> {new Date(auditoria.fecha_fin).toLocaleDateString()}</span>}
                            <span><strong>Tipo:</strong> {auditoria.tipo}</span>
                        </div>
                        {auditoria.observaciones && (
                            <p className="text-sm text-gray-500 mt-3"><strong>Observaciones:</strong> {auditoria.observaciones}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* No Conformidades */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-bold text-gray-800">No Conformidades ({ncs.length})</h2>
                    {puedeCrearNC && (
                        <Button variant="default" onClick={() => setNcModalOpen(true)}>
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
                                <th className="px-4 py-3 font-semibold text-center">OEC</th>
                                <th className="px-4 py-3 font-semibold text-center">Reiterada</th>
                                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ncs.map(nc => (
                                <tr key={nc.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-800">{nc.codigo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${nc.categoria === 'COM' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{nc.categoria || 'NC'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{nc.requisito || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{nc.hallazgo}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{nc.evidencia || '-'}</td>
                                    <td className="px-4 py-3 text-center">{nc.aceptada_oec ? <CircleCheck className="w-4 h-4 text-emerald-600 inline" /> : <CircleX className="w-4 h-4 text-red-400 inline" />}</td>
                                    <td className="px-4 py-3 text-center">{nc.reiterada ? <CircleCheck className="w-4 h-4 text-emerald-600 inline" /> : <CircleX className="w-4 h-4 text-red-400 inline" />}</td>
                                    <td className="px-4 py-3 text-center">
                                        {puedeCrearNC && (
                                            <button onClick={() => handleEliminarNc(nc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar NC"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={ncModalOpen} onClose={() => setNcModalOpen(false)} title="Nueva No Conformidad">
                <NcForm
                    auditoriaId={Number(id)}
                    onClose={() => setNcModalOpen(false)}
                    onSuccess={() => { setNcModalOpen(false); fetchData(); }}
                />
            </Modal>
        </div>
    );
};
