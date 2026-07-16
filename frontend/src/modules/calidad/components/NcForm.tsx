import { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface NcFormProps {
    ncId?: number | null;
    auditoriaId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const NcForm = ({ ncId, auditoriaId, onClose, onSuccess }: NcFormProps) => {
    const { alert } = useAlert();
    const { toast } = useToast();
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        requisito_incumplido: '',
        clasificacion: 'MENOR',
        causa_raiz: '',
        acciones_inmediatas: '',
        estado: 'ABIERTA',
        responsable_id: '',
        fecha_cierre: '',
    });

    useEffect(() => {
        const cargar = async () => {
            try {
                const resPersonas = await api.get('/personas');
                setPersonas(resPersonas.data);
                if (ncId) {
                    const res = await api.get(`/calidad/no-conformidades/${ncId}`);
                    const nc = res.data;
                    setFormData({
                        codigo: nc.codigo,
                        descripcion: nc.descripcion,
                        requisito_incumplido: nc.requisito_incumplido || '',
                        clasificacion: nc.clasificacion,
                        causa_raiz: nc.causa_raiz || '',
                        acciones_inmediatas: nc.acciones_inmediatas || '',
                        estado: nc.estado,
                        responsable_id: nc.responsable_id?.toString() || '',
                        fecha_cierre: nc.fecha_cierre ? nc.fecha_cierre.split('T')[0] : '',
                    });
                }
            } catch (error) {
                console.error('Error cargando datos', error);
                await alert({ message: 'Error al cargar datos del formulario.' });
            }
        };
        cargar();
    }, [ncId]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                codigo: formData.codigo,
                descripcion: formData.descripcion,
                requisito_incumplido: formData.requisito_incumplido || undefined,
                clasificacion: formData.clasificacion,
                causa_raiz: formData.causa_raiz || undefined,
                acciones_inmediatas: formData.acciones_inmediatas || undefined,
                estado: formData.estado,
                responsable_id: formData.responsable_id ? parseInt(formData.responsable_id) : undefined,
                fecha_cierre: formData.fecha_cierre || undefined,
            };

            if (ncId) {
                await api.patch(`/calidad/no-conformidades/${ncId}`, payload);
                toast({ message: 'No conformidad actualizada correctamente.' });
            } else {
                payload.auditoria_id = auditoriaId;
                await api.post('/calidad/no-conformidades', payload);
                toast({ message: 'No conformidad creada correctamente.' });
            }
            onSuccess();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar la no conformidad';
            await alert({ message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Código <span className="text-red-500">*</span></label>
                    <input type="text" name="codigo" required value={formData.codigo} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: NC-2026-001" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Clasificación</label>
                    <select name="clasificacion" value={formData.clasificacion} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="MENOR">Menor</option>
                        <option value="MAYOR">Mayor</option>
                        <option value="CRITICA">Crítica</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Descripción <span className="text-red-500">*</span></label>
                <textarea name="descripcion" required value={formData.descripcion} onChange={handleChange} rows={3} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describa la no conformidad detectada..." />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Requisito incumplido</label>
                <input type="text" name="requisito_incumplido" value={formData.requisito_incumplido} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: ISO 17025:2017, sección 7.2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Estado</label>
                    <select name="estado" value={formData.estado} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="ABIERTA">Abierta</option>
                        <option value="EN_CURSO">En curso</option>
                        <option value="CERRADA">Cerrada</option>
                        <option value="VERIFICADA">Verificada</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700">Responsable</label>
                    <select name="responsable_id" value={formData.responsable_id} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">-- Sin asignar --</option>
                        {personas.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Causa raíz</label>
                <textarea name="causa_raiz" value={formData.causa_raiz} onChange={handleChange} rows={2} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Acciones inmediatas</label>
                <textarea name="acciones_inmediatas" value={formData.acciones_inmediatas} onChange={handleChange} rows={2} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Fecha de cierre</label>
                <input type="date" name="fecha_cierre" value={formData.fecha_cierre} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50">
                    {loading ? 'Guardando...' : (ncId ? 'Actualizar' : 'Crear NC')}
                </button>
            </div>
        </form>
    );
};
