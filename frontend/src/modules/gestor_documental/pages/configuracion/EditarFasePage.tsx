import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../../shared/utils/ids';

export const EditarFasePage = () => {
    const { circuitoId: rawCircuitoId, faseId: rawFaseId } = useParams();
    const circuitoId = rawCircuitoId ? decodeId(rawCircuitoId) : undefined;
    const faseId = rawFaseId ? decodeId(rawFaseId) : undefined;
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();

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

    const [personas, setPersonas] = useState<any[]>([]);
    const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
    const [loadingFase, setLoadingFase] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // 1. Cargamos la lista de personas para la tabla
                const resPersonas = await api.get('/personas');
                setPersonas(Array.isArray(resPersonas.data) ? resPersonas.data : []);

                // 2. Cargamos los datos de LA FASE específica
                const resFase = await api.get(`/circuitos/${circuitoId}/fases/${faseId}`);
                 const faseDB = resFase.data;

                if (faseDB) {
                    setFormData({
                        nombre: faseDB.nombre || '',
                        orden: faseDB.orden || 10,
                        etiqueta_singular: faseDB.etiqueta_singular || '',
                        etiqueta_plural: faseDB.etiqueta_plural || '',
                        individual_paralelo: faseDB.individual_paralelo || false,
                        mostrar_hora: faseDB.mostrar_hora !== false,
                        ocultar_enviar_correo: faseDB.ocultar_enviar_correo || false,
                        activo: faseDB.activo !== false,
                        en_vigor: faseDB.en_vigor || false,
                        obligatorio_todos: faseDB.obligatorio_todos || false,
                    });

                    // 3. Pre-marcamos los usuarios que ya estaban asignados a esta fase
                    if (faseDB.participantes && Array.isArray(faseDB.participantes)) {
                        const idsAsignados = faseDB.participantes.map((p: any) => p.persona_id);
                        setUsuariosSeleccionados(idsAsignados);
                    }
                }
            } catch (error) {
                console.error("Error al cargar detalles de la fase:", error);
                await alert({ message: "No se pudo cargar la información de la fase." });
            } finally {
                setLoadingFase(false);
            }
        };

        if (faseId) cargarDatos();
    }, [faseId]);

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
        if (!formData.nombre.trim()) return;

        const ok = await confirm({ title: 'Actualizar fase', message: '¿Está seguro de guardar los cambios en esta fase?' });
        if (!ok) return;

        try {
            setGuardando(true);
            const payload = {
                id: Number(faseId), // 👉 MUY IMPORTANTE: Enviamos el ID para que el backend sepa que es una actualización
                ...formData,
                nombre: formData.nombre.toUpperCase(),
                usuarios_asignados: usuariosSeleccionados
            };

            // Usamos el mismo endpoint de guardar, el backend actualizará porque enviamos el "id"
            await api.post(`/circuitos/${circuitoId}/fases`, payload);

            toast({ message: 'Fase actualizada correctamente' });
            navigate(-1);
        } catch (error) {
            console.error("Error al actualizar fase:", error);
            await alert({ message: "Ocurrió un error al guardar los cambios." });
        } finally {
            setGuardando(false);
        }
    };

    if (loadingFase) return <div className="p-8 text-gray-500">Cargando detalles de la fase...</div>;

    return (
        <div className="bg-white p-8 rounded-lg min-h-screen text-[13px] text-gray-800">
            <h2 className="text-[16px] font-bold text-gray-800 mb-8 border-b border-gray-200 pb-4">
                Editar Fase: <span className="text-blue-800">{formData.nombre}</span>
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

                {/* --- SECCIÓN DE CHECKS --- */}
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
                        <span className="leading-tight">Obligatorio todos los<br />participantes:</span>
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
                                            <td className="px-3 py-1.5 text-blue-800">{persona.apellidos}, {persona.nombre}</td>
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
                        disabled={guardando}
                        className="px-4 py-1.5 bg-[#0052cc] text-white text-[13px] font-bold rounded shadow hover:bg-blue-700 disabled:opacity-50"
                    >
                        Guardar Cambios
                    </button>
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