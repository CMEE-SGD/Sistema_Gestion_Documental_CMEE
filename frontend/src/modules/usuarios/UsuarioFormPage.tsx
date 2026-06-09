import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Lock, Calendar, X } from 'lucide-react';
import api from '../../core/api/axios';

// Componente auxiliar para los Toggles (Interruptores)
const Toggle = ({ label, checked, onChange, icon }: any) => (
    <label className="flex items-center cursor-pointer w-max my-3">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#2185d0]' : 'bg-gray-300'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
        <div className="ml-3 text-sm text-gray-700 flex items-center gap-2">
            {icon} {label}
        </div>
    </label>
);

export const UsuarioFormPage = () => {
    const { id } = useParams(); // Si hay ID es edición, si no, es nuevo
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'general' | 'clave' | 'config'>('general');
    const [loading, setLoading] = useState(false);
    
    // Catálogos
    const [personas, setPersonas] = useState<any[]>([]);
    const [grupos, setGrupos] = useState<any[]>([]); // Para el select de grupos

    const [formData, setFormData] = useState({
        nombre_usuario: '',
        persona_id: '',
        grupoIds: [] as number[],
        fecha_caducidad: '',
        estado_cuenta: true,
        bloqueado: false,
        clave: '', // Nueva clave
        cambiar_clave_proxima_sesion: false,
        idioma: 'Español (Ecuador)',
        acceso_preferencias: false,
        acceso_chat: false
    });

    useEffect(() => {
        const fetchDatos = async () => {
            // 1. Cargar Personas (Recursos)
            try {
                const resPersonas = await api.get('/personas'); 
                setPersonas(resPersonas.data);
            } catch (error) {
                console.error("Error al cargar personas", error);
            }

            // 2. Cargar Grupos (Si falla, no bloquea lo anterior)
            try {
                const resGrupos = await api.get('/grupos');
                setGrupos(resGrupos.data);
            } catch (error) {
                console.warn("Error al cargar grupos", error);
            }

            // 3. Si es edición, precargar datos del usuario
            if (id) {
                try {
                    const resUsuario = await api.get(`/usuarios/${id}`);
                    const usuario = resUsuario.data;
                    setFormData({
                        nombre_usuario: usuario.nombre_usuario,
                        persona_id: usuario.persona?.id || '',
                        grupoIds: usuario.grupos?.map((g: any) => g.id) || [],
                        fecha_caducidad: usuario.fecha_caducidad ? usuario.fecha_caducidad.split('T')[0] : '',
                        estado_cuenta: usuario.estado_cuenta ?? true,
                        bloqueado: usuario.bloqueado ?? false,
                        clave: '',
                        cambiar_clave_proxima_sesion: usuario.cambiar_clave_proxima_sesion ?? false,
                        idioma: usuario.idioma || 'Español (Ecuador)',
                        acceso_preferencias: usuario.acceso_preferencias ?? false,
                        acceso_chat: usuario.acceso_chat ?? false
                    });
                } catch (error) {
                    console.error("Error al cargar usuario", error);
                }
            }
        };
        fetchDatos();
    }, [id]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleToggle = (field: string) => {
        setFormData(prev => ({ ...prev, [field]: !(prev as any)[field] }));
    };

    const handleAddGrupo = (grupoId: number) => {
        if (!grupoId || formData.grupoIds.includes(grupoId)) return;
        setFormData(prev => ({
            ...prev,
            grupoIds: [...prev.grupoIds, grupoId]
        }));
    };

    const handleRemoveGrupo = (grupoId: number) => {
        setFormData(prev => ({
            ...prev,
            grupoIds: prev.grupoIds.filter(id => id !== grupoId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validar campos requeridos
            if (!formData.nombre_usuario.trim()) {
                alert("El nombre de usuario es requerido");
                setLoading(false);
                return;
            }
            if (!formData.persona_id) {
                alert("Debes seleccionar un recurso (Persona)");
                setLoading(false);
                return;
            }
            if (!id && !formData.clave.trim()) {
                alert("La contraseña es requerida para crear un usuario");
                setLoading(false);
                return;
            }

            const payload: any = {
                nombre_usuario: formData.nombre_usuario.trim(),
                persona_id: Number(formData.persona_id),
                estado_cuenta: formData.estado_cuenta,
                bloqueado: formData.bloqueado,
                cambiar_clave_proxima_sesion: formData.cambiar_clave_proxima_sesion,
                idioma: formData.idioma,
                acceso_preferencias: formData.acceso_preferencias,
                acceso_chat: formData.acceso_chat
            };

            // Solo agregar si tienen valores
            if (formData.grupoIds.length > 0) {
                payload.grupoIds = formData.grupoIds;
            }
            if (formData.fecha_caducidad) {
                payload.fecha_caducidad = formData.fecha_caducidad;
            }

            // Solo incluir clave si es nuevo usuario o si se proporciona una nueva
            if (!id) {
                // Crear usuario: clave es obligatoria
                if (!formData.clave.trim()) {
                    alert("La contraseña es requerida");
                    setLoading(false);
                    return;
                }
                payload.clave = formData.clave.trim();
            } else if (formData.clave.trim()) {
                // Editar usuario: clave solo si se proporciona
                payload.clave = formData.clave.trim();
            }

            if (id) {
                await api.patch(`/usuarios/${id}`, payload);
                alert("Usuario actualizado correctamente");
            } else {
                await api.post('/usuarios', payload);
                alert("Usuario creado correctamente");
            }
            navigate('/usuarios');
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || error.message || "Error al guardar el usuario";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans p-6">
            <div className="max-w-4xl mx-auto">
                
                {/* TABS */}
                <div className="flex border-b border-gray-300 mb-8">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('general')} 
                        className={`px-6 py-2.5 text-sm transition-colors ${activeTab === 'general' ? 'border-b-2 border-gray-800 text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {id ? 'Editar usuario' : 'Nuevo usuario'}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('clave')} 
                        className={`px-6 py-2.5 text-sm transition-colors ${activeTab === 'clave' ? 'border-b-2 border-gray-800 text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Clave
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('config')} 
                        className={`px-6 py-2.5 text-sm transition-colors ${activeTab === 'config' ? 'border-b-2 border-gray-800 text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Configuración
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* CONTENIDO TAB 1: GENERAL */}
                    <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                        <div className="max-w-2xl mx-auto flex flex-col gap-5">
                            
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-700">Usuario*</label>
                                <input type="text" name="nombre_usuario" required value={formData.nombre_usuario} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-700">Grupo de aplicaciones*</label>
                                {/* Selector de grupos */}
                                <div className="flex flex-col gap-2">
                                    <select 
                                        onChange={(e) => handleAddGrupo(Number(e.target.value))}
                                        className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 bg-white text-sm"
                                    >
                                        <option value="">Selecciona un grupo</option>
                                        {grupos
                                            .filter(g => !formData.grupoIds.includes(g.id))
                                            .map(g => (
                                                <option key={g.id} value={g.id}>{g.nombre}</option>
                                            ))
                                        }
                                    </select>

                                    {/* Mostrar grupos seleccionados como tags */}
                                    <div className="border border-gray-300 rounded p-1.5 flex flex-wrap gap-2 items-center min-h-[40px] bg-white">
                                        {formData.grupoIds.length === 0 ? (
                                            <span className="text-gray-400 text-xs">Sin grupos asignados</span>
                                        ) : (
                                            formData.grupoIds.map(grupoId => {
                                                const grupo = grupos.find(g => g.id === grupoId);
                                                return (
                                                    <span 
                                                        key={grupoId}
                                                        className="bg-[#e0f0ff] text-[#2185d0] text-xs px-2 py-1 rounded flex items-center gap-1"
                                                    >
                                                        {grupo?.nombre}
                                                        <X 
                                                            className="w-3 h-3 cursor-pointer hover:text-blue-700" 
                                                            onClick={() => handleRemoveGrupo(grupoId)}
                                                        />
                                                    </span>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-700">Recurso*</label>
                                <select name="persona_id" required value={formData.persona_id} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 bg-white">
                                    <option value="">Seleccione un recurso (Persona)</option>
                                    {personas.map(p => (
                                        <option key={p.id} value={p.id}>{p.apellidos}, {p.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-700">Fecha de caducidad</label>
                                <div className="flex border border-gray-300 rounded overflow-hidden w-full max-w-sm">
                                    <div className="bg-gray-100 px-3 flex items-center border-r border-gray-300"><X className="w-4 h-4 text-gray-500" /></div>
                                    <input type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} className="flex-1 px-3 py-1.5 outline-none text-sm" />
                                    <div className="bg-gray-100 px-3 flex items-center border-l border-gray-300"><Calendar className="w-4 h-4 text-gray-500" /></div>
                                </div>
                            </div>

                            <div className="mt-2">
                                <Toggle label="Estado" checked={formData.estado_cuenta} onChange={() => handleToggle('estado_cuenta')} />
                                <Toggle label="Bloquear" checked={formData.bloqueado} onChange={() => handleToggle('bloqueado')} />
                            </div>
                        </div>
                    </div>

                    {/* CONTENIDO TAB 2: CLAVE */}
                    <div className={activeTab === 'clave' ? 'block' : 'hidden'}>
                        <div className="max-w-2xl mx-auto flex flex-col gap-5 items-start">
                            
                            {!id ? (
                                <div className="flex flex-col gap-1 w-full max-w-sm">
                                    <label className="text-sm text-gray-700">Contraseña*</label>
                                    <input type="password" name="clave" required minLength={6} value={formData.clave} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" />
                                </div>
                            ) : (
                                <button type="button" className="bg-[#2185d0] text-white px-4 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors">
                                    Cambiar contraseña
                                </button>
                            )}

                            <div className="mt-4">
                                <Toggle label="El usuario cambiará su clave en su próxima sesión" checked={formData.cambiar_clave_proxima_sesion} onChange={() => handleToggle('cambiar_clave_proxima_sesion')} />
                                <button type="button" className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 bg-white">
                                    <Lock className="w-3.5 h-3.5" /> Enviar correo para recuperación o cambio de contraseña
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONTENIDO TAB 3: CONFIGURACIÓN */}
                    <div className={activeTab === 'config' ? 'block' : 'hidden'}>
                        <div className="max-w-2xl mx-auto flex flex-col gap-6">
                            
                            <div className="flex flex-col gap-1 max-w-md">
                                <label className="text-sm text-gray-700">Idioma*</label>
                                <select name="idioma" value={formData.idioma} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 bg-white">
                                    <option value="Español (Ecuador)">Español (Ecuador)</option>
                                    <option value="Inglés">Inglés</option>
                                </select>
                            </div>

                            <div>
                                <Toggle label="Tiene acceso a la aplicación Preferencias" checked={formData.acceso_preferencias} onChange={() => handleToggle('acceso_preferencias')} />
                                <Toggle label="Chat" checked={formData.acceso_chat} onChange={() => handleToggle('acceso_chat')} />
                            </div>
                        </div>
                    </div>

                    {/* BOTONERA INFERIOR */}
                    <div className="mt-12 pt-4 border-t border-gray-200 flex items-center justify-between">
                        {id ? (
                            <button type="button" className="bg-[#c23934] text-white px-4 py-1.5 rounded text-sm hover:bg-red-800 flex items-center gap-1">
                                Eliminar <Trash2 className="w-4 h-4" />
                            </button>
                        ) : <div></div>}

                        <div className="flex gap-2">
                            <button type="button" onClick={() => navigate(-1)} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} className="bg-[#2185d0] text-white px-5 py-1.5 rounded text-sm hover:bg-blue-600 disabled:opacity-50">
                                {loading ? 'Guardando...' : 'Aceptar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};