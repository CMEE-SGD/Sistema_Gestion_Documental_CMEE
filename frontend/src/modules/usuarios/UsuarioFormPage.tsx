import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Lock, Calendar, X, ArrowLeft } from 'lucide-react';
import api from '../../core/api/axios';
import { encodeId, decodeId } from '../../shared/utils/ids';
import { useAlert } from '../../shared/components/molecules/AlertModal';
import { useToast } from '../../shared/components/molecules/Toast';

// Toggle rediseñado: Estilo Switch moderno
const Toggle = ({ label, checked, onChange, icon }: any) => (
    <label className="flex items-center cursor-pointer w-max my-2 group">
        <div className="relative flex items-center">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-primary' : 'bg-slate-300'}`}></div>
            <div className={`absolute left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </div>
        <div className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2">
            {icon} {label}
        </div>
    </label>
);

export const UsuarioFormPage = () => {
    const { id: rawId } = useParams();
    const id = rawId ? decodeId(rawId) : undefined;
    const navigate = useNavigate();
    const { alert } = useAlert();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'general' | 'clave' | 'config'>('general');
    const [loading, setLoading] = useState(false);
    
    const [personas, setPersonas] = useState<any[]>([]);
    const [grupos, setGrupos] = useState<any[]>([]); 

    const [formData, setFormData] = useState({
        nombre_usuario: '', persona_id: '', grupoIds: [] as number[],
        fecha_caducidad: '', estado_cuenta: true, bloqueado: false,
        clave: '', cambiar_clave_proxima_sesion: false,
        idioma: 'Español (Ecuador)', acceso_preferencias: false, acceso_chat: false
    });

    const [mostrarCambioClave, setMostrarCambioClave] = useState(false);
    const [confirmarClave, setConfirmarClave] = useState('');

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
                    setMostrarCambioClave(false);
                    setConfirmarClave('');
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
                await alert({ message: "El nombre de usuario es requerido" });
                setLoading(false);
                return;
            }
            if (!formData.persona_id) {
                await alert({ message: "Debes seleccionar un recurso (Persona)" });
                setLoading(false);
                return;
            }
            if (!id && !formData.clave.trim()) {
                await alert({ message: "La contraseña es requerida para crear un usuario" });
                setLoading(false);
                return;
            }
            if (id && mostrarCambioClave && formData.clave.trim()) {
                if (formData.clave.trim().length < 6) {
                    await alert({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
                    setLoading(false);
                    return;
                }
                if (formData.clave.trim() !== confirmarClave.trim()) {
                    await alert({ message: "Las contraseñas nuevas no coinciden" });
                    setLoading(false);
                    return;
                }
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
                    await alert({ message: "La contraseña es requerida" });
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
                toast({ message: "Usuario actualizado correctamente" });
            } else {
                await api.post('/usuarios', payload);
                toast({ message: "Usuario creado correctamente" });
            }
            navigate('/usuarios');
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || error.message || "Error al guardar el usuario";
            await alert({ message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            {/* Cabecera con botón de retroceso */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{id ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
                    <p className="text-sm text-muted-foreground">Configura las credenciales y permisos de acceso.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Tabs estilo Segmented Control */}
                <div className="p-4 border-b border-border bg-muted/20">
                    <div className="flex bg-muted p-1 rounded-lg w-fit">
                        {[
                            { id: 'general', label: 'Datos Generales' },
                            { id: 'clave', label: 'Seguridad y Clave' },
                            { id: 'config', label: 'Configuración' }
                        ].map(tab => (
                            <button 
                                key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                    activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    
                    {/* TAB 1: GENERAL */}
                    <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                        <div className="flex flex-col gap-5 max-w-lg">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-foreground">Usuario <span className="text-destructive">*</span></label>
                                <input type="text" name="nombre_usuario" required value={formData.nombre_usuario} onChange={handleChange} className="border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" placeholder="Ej: jdoe" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-foreground">Recurso Vinculado <span className="text-destructive">*</span></label>
                                <select name="persona_id" required value={formData.persona_id} onChange={handleChange} className="border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-transparent">
                                    <option value="">Seleccione a quién pertenece esta cuenta</option>
                                    {personas.map(p => (
                                        <option key={p.id} value={p.id}>{p.apellidos}, {p.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-foreground">Grupos de acceso</label>
                                <select onChange={(e) => handleAddGrupo(Number(e.target.value))} className="border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-transparent">
                                    <option value="">Añadir a un grupo...</option>
                                    {grupos.filter(g => !formData.grupoIds.includes(g.id)).map(g => (
                                        <option key={g.id} value={g.id}>{g.nombre}</option>
                                    ))}
                                </select>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.grupoIds.map(grupoId => {
                                        const grupo = grupos.find(g => g.id === grupoId);
                                        return (
                                            <span key={grupoId} className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-md border border-border flex items-center gap-1.5">
                                                {grupo?.nombre}
                                                <X className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => handleRemoveGrupo(grupoId)} />
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-foreground">Fecha de caducidad</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-input rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                                <Toggle label="Cuenta Activa" checked={formData.estado_cuenta} onChange={() => handleToggle('estado_cuenta')} />
                                <Toggle label="Bloquear acceso" checked={formData.bloqueado} onChange={() => handleToggle('bloqueado')} />
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
                            ) : !mostrarCambioClave ? (
                                <button
                                    type="button"
                                    onClick={() => setMostrarCambioClave(true)}
                                    className="bg-[#2185d0] text-white px-4 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors"
                                >
                                    Cambiar contraseña
                                </button>
                            ) : (
                                <div className="flex flex-col gap-3 w-full max-w-sm p-4 bg-muted/30 rounded-lg border border-border">
                                    <p className="text-xs text-muted-foreground">
                                        Como administrador puedes fijar una nueva contraseña para este usuario. Se aplicará al guardar los cambios.
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-700">Nueva contraseña</label>
                                        <input type="password" name="clave" minLength={6} value={formData.clave} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm text-gray-700">Confirmar nueva contraseña</label>
                                        <input type="password" minLength={6} value={confirmarClave} onChange={(e) => setConfirmarClave(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setMostrarCambioClave(false); setFormData(prev => ({ ...prev, clave: '' })); setConfirmarClave(''); }}
                                        className="text-xs text-muted-foreground hover:text-foreground self-start"
                                    >
                                        Cancelar
                                    </button>
                                </div>
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

                    {/* BOTONERA */}
                    <div className="mt-10 pt-5 border-t border-border flex items-center justify-between">
                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-input bg-transparent hover:bg-muted text-foreground text-sm font-medium rounded-md transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};