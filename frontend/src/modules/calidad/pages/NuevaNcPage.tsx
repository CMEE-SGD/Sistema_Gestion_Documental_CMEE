import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

export const NuevaNcPage = () => {
    const { auditoriaId, ncId } = useParams();
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!ncId);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [archivoActual, setArchivoActual] = useState<string | null>(null);
    const [codigoActual, setCodigoActual] = useState<string | null>(null);
    const [siguienteNumero, setSiguienteNumero] = useState<number | null>(null);
    const hallazgoRef = useRef<HTMLTextAreaElement>(null);
    const evidenciaRef = useRef<HTMLTextAreaElement>(null);

    const autoResize = (el: HTMLTextAreaElement) => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    const [formData, setFormData] = useState({
        categoria: 'NC',
        requisito: '',
        hallazgo: '',
        evidencia: '',
        aceptada_oec: false,
        reiterada: false,
    });

    useEffect(() => {
        if (ncId) return;
        api.get('/calidad/no-conformidades/siguiente-numero', {
            params: auditoriaId ? { auditoria_id: auditoriaId } : {},
        })
            .then(res => setSiguienteNumero(res.data))
            .catch(() => setSiguienteNumero(null));
    }, [ncId, auditoriaId]);

    useEffect(() => {
        if (!ncId) return;
        api.get(`/calidad/no-conformidades/${ncId}`)
            .then(res => {
                const nc = res.data;
                setFormData({
                    categoria: nc.categoria || 'NC',
                    requisito: nc.requisito || '',
                    hallazgo: nc.hallazgo,
                    evidencia: nc.evidencia || '',
                    aceptada_oec: nc.aceptada_oec,
                    reiterada: nc.reiterada,
                });
                setCodigoActual(nc.codigo);
                if (nc.archivo) setArchivoActual(nc.archivo);
                setLoadingData(false);
                setTimeout(() => {
                    if (hallazgoRef.current) autoResize(hallazgoRef.current);
                    if (evidenciaRef.current) autoResize(evidenciaRef.current);
                }, 0);
            })
            .catch(() => {
                alert({ message: 'Error al cargar la no conformidad' });
                navigate(auditoriaId ? `/calidad/auditorias/${auditoriaId}` : '/calidad/no-conformidades');
            });
    }, [ncId]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.hallazgo.trim()) {
            await alert({ message: 'Complete el campo obligatorio: Hallazgo.' });
            return;
        }
        setLoading(true);
        try {
            const fd = new FormData();
            (Object.keys(formData) as (keyof typeof formData)[]).forEach(key => fd.append(key, String(formData[key])));
            if (auditoriaId) fd.append('auditoria_id', String(auditoriaId));
            if (archivo) fd.append('archivo', archivo);
            if (ncId) {
                await api.patch(`/calidad/no-conformidades/${ncId}`, fd);
                toast({ message: 'No conformidad actualizada correctamente.' });
            } else {
                await api.post('/calidad/no-conformidades', fd);
                toast({ message: 'No conformidad creada correctamente.' });
            }
            navigate(auditoriaId ? `/calidad/auditorias/${auditoriaId}` : '/calidad/no-conformidades');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar la no conformidad';
            await alert({ message: msg });
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{ncId ? 'Editar No Conformidad' : 'Nueva No Conformidad'}</h1>
                <p className="text-sm text-gray-500">{ncId ? 'Modifique los datos de la no conformidad' : 'Registre una no conformidad o comentario'}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
                <div className="flex items-end gap-4">
                    <div className="flex flex-col gap-1 w-28">
                        <label className="text-xs font-semibold text-gray-700">Número</label>
                        <div className="border border-gray-300 rounded px-2 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 text-center">
                            {ncId ? (codigoActual || '—') : (siguienteNumero ?? '—')}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Categoría</label>
                        <div className="flex items-center gap-4 border border-gray-300 rounded px-3 py-1.5 h-[34px]">
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <input type="radio" name="categoria" value="NC" checked={formData.categoria === 'NC'} onChange={handleChange} className="w-3.5 h-3.5 text-blue-600" /> NC
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <input type="radio" name="categoria" value="COM" checked={formData.categoria === 'COM'} onChange={handleChange} className="w-3.5 h-3.5 text-blue-600" /> COM
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs font-semibold text-gray-700">Requisito</label>
                        <input type="text" name="requisito" value={formData.requisito} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: ISO 17025:2017, sección 7.2" />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Hallazgo (No Conformidad/Comentario) <span className="text-red-500">*</span></label>
                    <textarea ref={hallazgoRef} name="hallazgo" required value={formData.hallazgo} onChange={e => { handleChange(e); autoResize(e.target); }} rows={3} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" placeholder="Describa el hallazgo detectado..." />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Evidencia</label>
                    <textarea ref={evidenciaRef} name="evidencia" value={formData.evidencia} onChange={e => { handleChange(e); autoResize(e.target); }} rows={2} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" placeholder="Evidencia objetiva del hallazgo..." />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Adjuntar archivo</label>
                    <input type="file" onChange={e => setArchivo(e.target.files?.[0] || null)} className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {archivo ? (
                        <p className="text-xs text-gray-500">Seleccionado: {archivo.name}</p>
                    ) : archivoActual ? (
                        <a href={`${BACKEND_URL}${archivoActual}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline">Ver archivo actual</a>
                    ) : null}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" name="aceptada_oec" checked={formData.aceptada_oec} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">Aceptada por OEC</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" name="reiterada" checked={formData.reiterada} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">Reiterada tras la última evaluación</span>
                    </label>
                </div>

                <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
                    <span className="mr-auto text-xs font-medium text-gray-500">GD4.1.F1-1</span>
                    <button type="button" onClick={() => navigate(auditoriaId ? `/calidad/auditorias/${auditoriaId}` : '/calidad/no-conformidades')} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                        {loading ? 'Guardando...' : (ncId ? 'Actualizar NC' : 'Crear NC')}
                    </button>
                </div>
            </form>
        </div>
    );
};
