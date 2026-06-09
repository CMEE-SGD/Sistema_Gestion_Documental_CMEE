import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';

export const NuevoEquipoPage = () => {
    const navigate = useNavigate();
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
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
        const fetchLaboratorios = async () => {
            try {
                const response = await api.get('/laboratorios');
                setLaboratorios(response.data);
            } catch (error) {
                console.error('Error al cargar laboratorios', error);
            }
        };
        fetchLaboratorios();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                laboratorio_id: parseInt(formData.laboratorio_id)
            };
            await api.post('/equipos', payload);
            navigate('/laboratorios/equipos');
        } catch (error) {
            console.error('Error al registrar equipo', error);
            alert('Error al guardar el equipo.');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
            <div className="w-full max-w-4xl">
                <button 
                    onClick={() => navigate('/laboratorios/equipos')} 
                    className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver al inventario
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#8eb8d5] px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-white">Registrar Nuevo Instrumento</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Laboratorio Asignado <span className="text-red-500">*</span></label>
                            <select 
                                name="laboratorio_id" required value={formData.laboratorio_id} onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white"
                            >
                                <option value="">-- Seleccione el laboratorio --</option>
                                {laboratorios.map(lab => (
                                    <option key={lab.id} value={lab.id}>{lab.nombre} ({lab.codigo})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Estado Físico</label>
                            <select 
                                name="estado" value={formData.estado} onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white"
                            >
                                <option value="OPERATIVO">Operativo</option>
                                <option value="EN_CALIBRACION">En Calibración</option>
                                <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Código de Inventario <span className="text-red-500">*</span></label>
                            <input 
                                type="text" name="codigo" required value={formData.codigo} onChange={handleChange} 
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white" 
                                placeholder="Ej: EQ-MASA-001" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Nombre del Instrumento <span className="text-red-500">*</span></label>
                            <input 
                                type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white" 
                                placeholder="Ej: Balanza Analítica" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Marca</label>
                            <input 
                                type="text" name="marca" value={formData.marca} onChange={handleChange} 
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Modelo</label>
                            <input 
                                type="text" name="modelo" value={formData.modelo} onChange={handleChange} 
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white" 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Número de Serie</label>
                            <input 
                                type="text" name="numero_serie" value={formData.numero_serie} onChange={handleChange} 
                                className="border border-gray-300 rounded-md p-2.5 text-sm outline-none bg-gray-50 focus:bg-white w-full md:w-1/2" 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 md:col-span-2">
                            <button type="button" onClick={() => navigate('/laboratorios/equipos')} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#006400] rounded-md hover:bg-green-800">Registrar Instrumento</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};