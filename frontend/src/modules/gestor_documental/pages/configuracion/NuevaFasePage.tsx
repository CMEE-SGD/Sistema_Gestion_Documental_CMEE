import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../../core/api/axios';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const NuevaFasePage = () => {
    const { circuitoId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { alert } = useAlert();
    const { toast } = useToast();
    
    // Recuperamos el nombre del circuito para el título (si venimos de la vista anterior)
    const nombreCircuito = location.state?.nombreCircuito || 'CIRCUITO';

    // Estados del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        orden: 10,
        etiqueta_singular: '',
        etiqueta_plural: '',
        individual_paralelo: false,
        mostrar_hora: true,
        ocultar_enviar_correo: false,
        activo: true,
        en_vigor: false,
        obligatorio_todos: false,
    });

    // Estado para la tabla de usuarios y selección
    const [personas, setPersonas] = useState<any[]>([]);
    const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Cargamos la lista de personas (usuarios) para la tabla de permisos
        const fetchPersonas = async () => {
            try {
                // Ajusta esta ruta según cómo tengas tu endpoint de personas o usuarios
                const res = await api.get('/personas'); 
                setPersonas(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error al cargar personas:", error);
            }
        };
        fetchPersonas();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCheckboxUsuario = (personaId: number) => {
        setUsuariosSeleccionados(prev => 
            prev.includes(personaId) 
                ? prev.filter(id => id !== personaId) 
                : [...prev, personaId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            await alert({ message: "El nombre de la fase es obligatorio" });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                nombre: formData.nombre.toUpperCase(),
                usuarios_asignados: usuariosSeleccionados // Enviamos el array de IDs
            };

            // Usamos el endpoint que creamos en el paso anterior
            await api.post(`/circuitos/${circuitoId}/fases`, payload);

            toast({ message: 'Fase creada correctamente' });
            navigate(-1);
        } catch (error) {
            console.error("Error al guardar fase:", error);
            await alert({ message: "Ocurrió un error al guardar la fase." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg min-h-screen text-[13px] text-gray-800">
            {/* Título de navegación */}
            <h2 className="text-[16px] font-bold text-gray-800 mb-8 border-b border-gray-200 pb-4 flex items-center gap-2">
                Circuitos &gt; <span className="uppercase">{nombreCircuito}</span> &gt; Fases
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col max-w-5xl">
                
                {/* --- SECCIÓN BÁSICA --- */}
                <div className="grid grid-cols-[150px_1fr] items-center gap-y-4 mb-8">
                    <label className="text-gray-700">Nombre:</label>
                    <input 
                        type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                        className="border-2 border-gray-800 rounded px-3 py-1 outline-none focus:border-blue-600 font-bold uppercase w-[300px]"
                    />

                    <label className="text-gray-700">Orden:</label>
                    <input 
                        type="number" name="orden" value={formData.orden} onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-1 outline-none focus:border-blue-500 w-20"
                    />
                </div>

                {/* --- SECCIÓN ETIQUETAS --- */}
                <h3 className="font-bold text-gray-800 mb-4">Etiquetas</h3>
                <div className="grid grid-cols-[150px_1fr] items-center gap-y-4 mb-8">
                    <label className="text-gray-700">Singular:</label>
                    <input 
                        type="text" name="etiqueta_singular" value={formData.etiqueta_singular} onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-1 outline-none focus:border-blue-500 w-[300px]"
                    />

                    <label className="text-gray-700">Plural:</label>
                    <input 
                        type="text" name="etiqueta_plural" value={formData.etiqueta_plural} onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-1 outline-none focus:border-blue-500 w-[300px]"
                    />
                </div>

                {/* --- SECCIÓN DE CHECKS (Acoplados a la izquierda) --- */}
                <div className="flex flex-col gap-2 mb-10 w-[300px]">
                    <label className="flex items-center justify-between cursor-pointer">
                        Individual (paralelo):
                        <input type="checkbox" name="individual_paralelo" checked={formData.individual_paralelo} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        Mostrar hora:
                        <input type="checkbox" name="mostrar_hora" checked={formData.mostrar_hora} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        Ocultar enviar correo:
                        <input type="checkbox" name="ocultar_enviar_correo" checked={formData.ocultar_enviar_correo} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        Estado (Activo):
                        <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        En vigor:
                        <input type="checkbox" name="en_vigor" checked={formData.en_vigor} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="leading-tight">Obligatorio todos los<br/>participantes:</span>
                        <input type="checkbox" name="obligatorio_todos" checked={formData.obligatorio_todos} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </label>
                </div>

                {/* --- SECCIÓN PERMISOS (TABLA VERDE) --- */}
                <div className="grid grid-cols-[150px_1fr] items-start gap-4 mb-10">
                    <label className="text-gray-700 underline underline-offset-2">Permisos:</label>
                    
                    <div className="border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#006400] text-white font-bold text-xs">
                                <tr>
                                    <th className="w-10 px-2 py-1 text-center border-r border-[#004d00]"></th>
                                    <th className="px-3 py-1 border-r border-[#004d00]">Usuario</th>
                                    <th className="px-3 py-1 border-r border-[#004d00]">Grupo</th>
                                    <th className="px-3 py-1">Cargo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personas.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-4 text-gray-500 italic">No hay usuarios registrados.</td></tr>
                                ) : (
                                    personas.map(persona => (
                                        <tr key={persona.id} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                                            <td className="px-2 py-1 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={usuariosSeleccionados.includes(persona.id)}
                                                    onChange={() => handleCheckboxUsuario(persona.id)}
                                                    className="w-3.5 h-3.5 border-gray-300 rounded text-blue-600"
                                                />
                                            </td>
                                            {/* Ajusta estos campos según lo que devuelva tu endpoint de personas */}
                                            <td className="px-3 py-1.5 text-blue-800">{persona.apellidos}, {persona.nombre} {persona.codigo ? `(${persona.codigo})` : ''}</td>
                                            <td className="px-3 py-1.5 text-gray-600">{persona.departamento?.nombre || '-'}</td>
                                            <td className="px-3 py-1.5 text-gray-600">{persona.puesto?.nombre || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- BOTONERA --- */}
                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-4 py-1.5 bg-[#0052cc] text-white text-[13px] font-bold rounded shadow hover:bg-blue-700 disabled:opacity-50"
                    >
                        Aceptar
                    </button>
                    {/* Botón cancelar opcional, aunque la imagen original solo mostraba Aceptar al fondo */}
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-[13px] font-bold rounded shadow-sm hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};