import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

export const NuevoLaboratorioPage = () => {
    const navigate = useNavigate();
    const [personas, setPersonas] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        responsable_id: ''
    });

    useEffect(() => {
        const fetchPersonas = async () => {
            try {
                const response = await api.get('/personas');
                setPersonas(response.data);
            } catch (error) {
                console.error('Error al cargar personas', error);
            }
        };
        fetchPersonas();
    }, []);

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
            await api.post('/laboratorios', payload);
            navigate('/laboratorios');
        } catch (error) {
            console.error('Error al crear laboratorio', error);
            alert('Ocurrió un error al guardar');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
            <div className="w-full max-w-3xl">
                
                {/* Botón Atrás */}
                <button 
                    onClick={() => navigate('/laboratorios')} 
                    className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al listado
                </button>

                {/* Tarjeta del Formulario */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#8eb8d5] px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-white">Registrar Nuevo Laboratorio</h2>
                        <p className="text-blue-50 text-sm mt-1">Complete la información técnica y asigne un responsable.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                        {/* Fila 1: Código y Nombre */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Código interno</label>
                                <input 
                                    type="text" name="codigo" value={formData.codigo} onChange={handleChange} 
                                    className="border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-[#8eb8d5] focus:border-[#8eb8d5] outline-none transition-all bg-gray-50 focus:bg-white" 
                                    placeholder="Ej: LAB-MASA-01" 
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Nombre del Laboratorio <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" name="nombre" required value={formData.nombre} onChange={handleChange} 
                                    className="border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-[#8eb8d5] focus:border-[#8eb8d5] outline-none transition-all bg-gray-50 focus:bg-white" 
                                    placeholder="Ej: Laboratorio de Masa" 
                                />
                            </div>
                        </div>

                        {/* Fila 2: Responsable */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Responsable Técnico</label>
                            <select 
                                name="responsable_id" value={formData.responsable_id} onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-[#8eb8d5] focus:border-[#8eb8d5] outline-none transition-all bg-gray-50 focus:bg-white"
                            >
                                <option value="">-- Sin asignar --</option>
                                {personas.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} {p.apellidos} {p.codigo ? `(${p.codigo})` : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400">El responsable técnico tendrá privilegios para aprobar certificados y registrar equipos.</p>
                        </div>

                        {/* Fila 3: Descripción */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Descripción General</label>
                            <textarea 
                                name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4}
                                className="border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-[#8eb8d5] focus:border-[#8eb8d5] outline-none transition-all bg-gray-50 focus:bg-white" 
                                placeholder="Describa brevemente las áreas de calibración y alcances del laboratorio..." 
                            />
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button 
                                type="button" 
                                onClick={() => navigate('/laboratorios')}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-5 py-2.5 text-sm font-bold text-white bg-[#006400] rounded-md hover:bg-green-800 transition-colors shadow-sm"
                            >
                                Guardar Laboratorio
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};