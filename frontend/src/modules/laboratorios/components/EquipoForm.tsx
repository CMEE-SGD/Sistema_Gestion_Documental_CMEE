import { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface EquipoFormProps {
    equipoId?: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const EquipoForm = ({ equipoId, onClose, onSuccess }: EquipoFormProps) => {
    const { alert } = useAlert();
    const { toast } = useToast();
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        estado: 'OPERATIVO',
        laboratorio_id: ''
    });

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                // Siempre cargamos la lista de laboratorios
                const resLabs = await api.get('/laboratorios');
                setLaboratorios(resLabs.data);

                // Si hay ID, cargamos los datos del equipo para editar
                if (equipoId) {
                    const resEquipo = await api.get(`/equipos/${equipoId}`);
                    const eq = resEquipo.data;
                    setFormData({
                        codigo: eq.codigo || '',
                        nombre: eq.nombre || '',
                        marca: eq.marca || '',
                        modelo: eq.modelo || '',
                        numero_serie: eq.numero_serie || '',
                        estado: eq.estado || 'OPERATIVO',
                        laboratorio_id: eq.laboratorio_id?.toString() || ''
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos', error);
                await alert({ title: 'Error', message: 'No se pudo cargar la información requerida.' });
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [equipoId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                codigo: formData.codigo,
                nombre: formData.nombre,
                marca: formData.marca,
                modelo: formData.modelo,
                numero_serie: formData.numero_serie,
                estado: formData.estado,
                laboratorio_id: parseInt(formData.laboratorio_id)
            };

            if (equipoId) {
                await api.patch(`/equipos/${equipoId}`, payload);
            } else {
                await api.post('/equipos', payload);
            }
            
            toast({ message: equipoId ? 'Equipo actualizado exitosamente.' : 'Equipo registrado exitosamente.' });
            onSuccess(); // Actualizamos la tabla
            onClose(); // Cerramos el modal
        } catch (error) {
            console.error('Error al guardar el equipo', error);
            await alert({ title: 'Error', message: 'Error al guardar las modificaciones.' });
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500">Cargando formulario...</div>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Laboratorio Asignado <span className="text-red-500">*</span></label>
                    <select 
                        name="laboratorio_id" required value={formData.laboratorio_id} onChange={handleChange}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="">-- Seleccione el laboratorio --</option>
                        {laboratorios.map(lab => (
                            <option key={lab.id} value={lab.id}>{lab.nombre} ({lab.codigo})</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Estado Físico</label>
                    <select 
                        name="estado" value={formData.estado} onChange={handleChange}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="OPERATIVO">Operativo</option>
                        <option value="EN_CALIBRACION">En Calibración</option>
                        <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Código de Inventario <span className="text-red-500">*</span></label>
                    <input 
                        type="text" name="codigo" required value={formData.codigo} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Ej: EQ-MASA-001" 
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Nombre del Instrumento <span className="text-red-500">*</span></label>
                    <input 
                        type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="Ej: Balanza Analítica" 
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Marca</label>
                    <input 
                        type="text" name="marca" value={formData.marca} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Modelo</label>
                    <input 
                        type="text" name="modelo" value={formData.modelo} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Número de Serie</label>
                    <input 
                        type="text" name="numero_serie" value={formData.numero_serie} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full md:w-1/2" 
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                <Button variant="default" type="submit">Guardar Instrumento</Button>
            </div>
        </form>
    );
};