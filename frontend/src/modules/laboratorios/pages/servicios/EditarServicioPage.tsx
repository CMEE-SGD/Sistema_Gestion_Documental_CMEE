import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../core/api/axios';

export const EditarServicioPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
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
            try {
                const [resLabs, resServicio] = await Promise.all([
                    api.get('/laboratorios'),
                    api.get(`/servicios/${id}`)
                ]);
                
                setLaboratorios(resLabs.data);
                
                const srv = resServicio.data;
                setFormData({
                    nombre: srv.nombre || '',
                    magnitud: srv.magnitud || '',
                    descripcion: srv.descripcion || '',
                    laboratorio_id: srv.laboratorio_id?.toString() || ''
                });
            } catch (error) {
                console.error('Error al cargar la información', error);
                alert('No se pudo recuperar los datos del servicio.');
                navigate('/laboratorios/servicios');
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id, navigate]);

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
            await api.patch(`/servicios/${id}`, payload);
            navigate('/laboratorios/servicios');
        } catch (error) {
            console.error('Error al actualizar servicio', error);
            alert('Error al guardar las modificaciones.');
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Cargando información del servicio...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
            <div className="w-full max-w-3xl">
                <button 
                    type="button" onClick={() => navigate('/laboratorios/servicios')} 
                    className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver al catálogo
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#8eb8d5] px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-white">Modificar Servicio / Magnitud</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Nombre del Servicio *</label>
                            <input 
                                type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Magnitud</label>
                            <input 
                                type="text" name="magnitud" value={formData.magnitud} onChange={handleChange} 
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Laboratorio Ejecutor *</label>
                            <select 
                                name="laboratorio_id" required value={formData.laboratorio_id} onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white"
                            >
                                <option value="">-- Seleccione el laboratorio --</option>
                                {laboratorios.map(lab => (
                                    <option key={lab.id} value={lab.id}>{lab.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Descripción General</label>
                            <textarea 
                                name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3}
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white" 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 md:col-span-2">
                            <button type="button" onClick={() => navigate('/laboratorios/servicios')} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Actualizar Datos</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};