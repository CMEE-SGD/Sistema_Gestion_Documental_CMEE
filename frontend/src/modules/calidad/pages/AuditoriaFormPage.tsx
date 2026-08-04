import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

export const AuditoriaFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [personas, setPersonas] = useState<any[]>([]);
    const [archivo, setArchivo] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        codigo: '',
        tipo: 'INTERNA',
        alcance: '',
        fecha_inicio: '',
        fecha_fin: '',
        responsable_id: '',
        observaciones: '',
    });

    useEffect(() => {
        const cargar = async () => {
            try {
                const resPersonas = await api.get('/personas');
                setPersonas(resPersonas.data);
                if (id) {
                    const res = await api.get(`/calidad/auditorias/${id}`);
                    const a = res.data;
                    setFormData({
                        codigo: a.codigo,
                        tipo: a.tipo,
                        alcance: a.alcance,
                        fecha_inicio: a.fecha_inicio ? a.fecha_inicio.split('T')[0] : '',
                        fecha_fin: a.fecha_fin ? a.fecha_fin.split('T')[0] : '',
                        responsable_id: a.responsable_id?.toString() || '',
                        observaciones: a.observaciones || '',
                    });
                }
            } catch (error) {
                console.error('Error cargando datos', error);
            }
        };
        cargar();
    }, [id]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('codigo', formData.codigo);
            fd.append('tipo', formData.tipo);
            fd.append('alcance', formData.alcance);
            fd.append('fecha_inicio', formData.fecha_inicio);
            if (formData.fecha_fin) fd.append('fecha_fin', formData.fecha_fin);
            fd.append('responsable_id', parseInt(formData.responsable_id).toString());
            if (formData.observaciones) fd.append('observaciones', formData.observaciones);
            if (archivo) fd.append('archivo_planificacion', archivo);

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (id) {
                await api.patch(`/calidad/auditorias/${id}`, fd, config);
                toast({ message: 'Auditoría actualizada correctamente.' });
            } else {
                await api.post('/calidad/auditorias', fd, config);
                toast({ message: 'Auditoría creada correctamente.' });
            }
            navigate('/calidad/auditorias');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar la auditoría';
            await alert({ message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{id ? 'Editar Auditoría' : 'Nueva Auditoría Interna'}</h1>
                <p className="text-sm text-gray-500">{id ? 'Modifique los datos de la auditoría' : 'Registre una nueva auditoría de calidad'}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Código <span className="text-red-500">*</span></label>
                        <input type="text" name="codigo" required value={formData.codigo} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: AI-2026-001" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Tipo</label>
                        <select name="tipo" value={formData.tipo} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="INTERNA">Interna</option>
                            <option value="EXTERNA">Externa</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Alcance <span className="text-red-500">*</span></label>
                    <textarea name="alcance" required value={formData.alcance} onChange={handleChange} rows={3} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describa el alcance de la auditoría..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Fecha de inicio <span className="text-red-500">*</span></label>
                        <input type="date" name="fecha_inicio" required value={formData.fecha_inicio} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Fecha de fin</label>
                        <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Responsable <span className="text-red-500">*</span></label>
                    <select name="responsable_id" required value={formData.responsable_id} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Seleccione un responsable...</option>
                        {personas.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Planificación</label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            {archivo ? archivo.name : 'Seleccionar archivo'}
                            <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls" className="hidden" onChange={e => setArchivo(e.target.files?.[0] || null)} />
                        </label>
                        {archivo && (
                            <button type="button" onClick={() => setArchivo(null)} className="text-xs text-red-600 hover:text-red-800">Quitar</button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Observaciones</label>
                    <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => navigate('/calidad/auditorias')} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                        <Save className="w-4 h-4" /> {loading ? 'Guardando...' : (id ? 'Actualizar' : 'Crear Auditoría')}
                    </button>
                </div>
            </form>
        </div>
    );
};
