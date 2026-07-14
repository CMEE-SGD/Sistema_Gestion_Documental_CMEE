import { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

interface ServicioFormProps {
    servicioId?: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const ServicioForm = ({ servicioId, onClose, onSuccess }: ServicioFormProps) => {
    const { alert } = useAlert();
    const { toast } = useToast();
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        magnitud: '',
        descripcion: '',
        laboratorio_id: ''
    });

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const resLabs = await api.get('/laboratorios');
                setLaboratorios(resLabs.data);

                if (servicioId) {
                    const resSrv = await api.get(`/servicios/${servicioId}`);
                    const srv = resSrv.data;
                    setFormData({
                        nombre: srv.nombre || '',
                        magnitud: srv.magnitud || '',
                        descripcion: srv.descripcion || '',
                        laboratorio_id: srv.laboratorio_id?.toString() || ''
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos', error);
                await alert({ title: 'Error', message: 'No se pudo cargar la información.' });
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [servicioId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                magnitud: formData.magnitud,
                descripcion: formData.descripcion,
                laboratorio_id: parseInt(formData.laboratorio_id)
            };
            if (servicioId) {
                await api.patch(`/servicios/${servicioId}`, payload);
            } else {
                await api.post('/servicios', payload);
            }
            toast({ message: servicioId ? 'Servicio actualizado exitosamente.' : 'Servicio registrado exitosamente.' });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al guardar', error);
            await alert({ title: 'Error', message: 'Error al guardar el servicio.' });
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500">Cargando...</div>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Nombre del Servicio *</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Magnitud</label>
                    <input type="text" name="magnitud" value={formData.magnitud} onChange={handleChange} 
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Laboratorio *</label>
                    <select name="laboratorio_id" required value={formData.laboratorio_id} onChange={handleChange}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Seleccione --</option>
                        {laboratorios.map(lab => <option key={lab.id} value={lab.id}>{lab.nombre}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                <Button variant="default" type="submit">Guardar Servicio</Button>
            </div>
        </form>
    );
};