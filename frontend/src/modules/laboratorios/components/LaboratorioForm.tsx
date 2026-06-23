// src/modules/laboratorios/components/LaboratorioForm.tsx
import { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';

interface LaboratorioFormProps {
    laboratorioId?: number | null; // Si viene ID, es edición. Si es null, es creación.
    onClose: () => void;
    onSuccess: () => void;
}

export const LaboratorioForm = ({ laboratorioId, onClose, onSuccess }: LaboratorioFormProps) => {
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        responsable_id: ''
    });

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const resPersonas = await api.get('/personas');
                setPersonas(resPersonas.data);

                // Si hay ID, cargamos los datos para editar
                if (laboratorioId) {
                    const resLab = await api.get(`/laboratorios/${laboratorioId}`);
                    const lab = resLab.data;
                    setFormData({
                        codigo: lab.codigo || '',
                        nombre: lab.nombre || '',
                        descripcion: lab.descripcion || '',
                        responsable_id: lab.responsable_id?.toString() || ''
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos', error);
                alert('No se pudo cargar la información requerida.');
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [laboratorioId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                responsable_id: formData.responsable_id ? parseInt(formData.responsable_id) : null
            };

            if (laboratorioId) {
                await api.patch(`/laboratorios/${laboratorioId}`, payload);
            } else {
                await api.post('/laboratorios', payload);
            }
            
            onSuccess(); // Actualizar tabla
            onClose(); // Cerrar modal
        } catch (error) {
            console.error('Error al guardar laboratorio', error);
            alert('Ocurrió un error al guardar los cambios.');
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500">Cargando formulario...</div>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Código interno</label>
                    <input 
                        type="text" name="codigo" value={formData.codigo} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Ej: LAB-MASA-01" 
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Nombre del Laboratorio <span className="text-red-500">*</span></label>
                    <input 
                        type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Ej: Laboratorio de Masa" 
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Responsable Técnico</label>
                <select 
                    name="responsable_id" value={formData.responsable_id} onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                    <option value="">-- Sin asignar --</option>
                    {personas.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellidos} {p.codigo ? `(${p.codigo})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Descripción General</label>
                <textarea 
                    name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" 
                    placeholder="Describa áreas de calibración o alcance..." 
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                <Button variant="default" type="submit">Guardar Laboratorio</Button>
            </div>
        </form>
    );
};