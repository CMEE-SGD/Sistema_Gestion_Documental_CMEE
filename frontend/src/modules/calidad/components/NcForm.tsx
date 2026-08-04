import { useState } from 'react';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import api from '../../../core/api/axios';

interface NcFormProps {
    auditoriaId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const NcForm = ({ auditoriaId, onClose, onSuccess }: NcFormProps) => {
    const { alert } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        codigo: '',
        categoria: 'NC',
        requisito: '',
        hallazgo: '',
        evidencia: '',
        aceptada_oec: false,
        reiterada: false,
    });

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.codigo.trim() || !formData.hallazgo.trim()) {
            await alert({ message: 'Complete los campos obligatorios: Número y Hallazgo.' });
            return;
        }
        setLoading(true);
        try {
            await api.post('/calidad/no-conformidades', {
                ...formData,
                auditoria_id: auditoriaId,
            });
            toast({ message: 'No conformidad creada correctamente.' });
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
            <div className="flex items-end gap-4">
                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-semibold text-gray-700">Número <span className="text-red-500">*</span></label>
                    <input type="text" name="codigo" required value={formData.codigo} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: NC-2026-001" />
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
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Requisito</label>
                <input type="text" name="requisito" value={formData.requisito} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: ISO 17025:2017, sección 7.2" />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Hallazgo (No Conformidad/Comentario) <span className="text-red-500">*</span></label>
                <textarea name="hallazgo" required value={formData.hallazgo} onChange={handleChange} rows={3} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describa el hallazgo detectado..." />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Evidencia</label>
                <textarea name="evidencia" value={formData.evidencia} onChange={handleChange} rows={2} className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Evidencia objetiva del hallazgo..." />
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

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50">
                    {loading ? 'Guardando...' : 'Crear NC'}
                </button>
            </div>
        </form>
    );
};
