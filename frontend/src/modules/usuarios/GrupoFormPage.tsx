import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Trash2, ArrowLeft, UsersRound } from 'lucide-react';
import api from '../../core/api/axios';
import { useAlert } from '../../shared/components/molecules/AlertModal';
import { useToast } from '../../shared/components/molecules/Toast';

// Componente Toggle reutilizable modernizado
const Toggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center cursor-pointer w-max my-2 group">
        <div className="relative flex items-center">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-primary' : 'bg-slate-300'}`}></div>
            <div className={`absolute left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </div>
        <span className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </label>
);

export const GrupoFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'datos' | 'usuarios' | 'aplicaciones'>('datos');
    const [loading, setLoading] = useState(false);
    
    const [catalogoApps, setCatalogoApps] = useState<any[]>([]);
    const [usuariosDelGrupo, setUsuariosDelGrupo] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        activo: true,
        aplicaciones: [] as any[]
    });

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const resApps = await api.get('/aplicaciones');
                setCatalogoApps(resApps.data);

                if (id) {
                    const resGrupo = await api.get(`/grupos/${id}`);
                    const grupo = resGrupo.data;
                    setFormData({
                        nombre: grupo.nombre,
                        descripcion: grupo.descripcion || '',
                        activo: grupo.activo,
                        aplicaciones: grupo.aplicaciones.map((a: any) => ({
                            aplicacion_id: a.aplicacion_id,
                            nivel: a.nivel,
                            orden: a.orden,
                            nombre: a.aplicacion.nombre 
                        }))
                    });
                    setUsuariosDelGrupo(grupo.usuarios || []);
                }
            } catch (error) {
                console.error("Error al cargar datos", error);
            }
        };
        fetchDatos();
    }, [id]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddApp = (e: any) => {
        const appId = Number(e.target.value);
        if (!appId) return;

        if (formData.aplicaciones.some(app => app.aplicacion_id === appId)) return;

        const appSeleccionada = catalogoApps.find(a => a.id === appId);
        
        setFormData(prev => ({
            ...prev,
            aplicaciones: [
                ...prev.aplicaciones, 
                { aplicacion_id: appId, nivel: 5, orden: 0, nombre: appSeleccionada.nombre }
            ]
        }));
        e.target.value = ""; 
    };

    const handleAppChange = (appId: number, field: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            aplicaciones: prev.aplicaciones.map(app => 
                app.aplicacion_id === appId ? { ...app, [field]: value } : app
            )
        }));
    };

    const handleRemoveApp = (appId: number) => {
        setFormData(prev => ({
            ...prev,
            aplicaciones: prev.aplicaciones.filter(app => app.aplicacion_id !== appId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                activo: formData.activo,
                aplicaciones: formData.aplicaciones.map(app => ({
                    aplicacion_id: app.aplicacion_id,
                    nivel: Number(app.nivel),
                    orden: Number(app.orden)
                }))
            };

            if (id) {
                await api.patch(`/grupos/${id}`, payload);
                toast({ message: 'Grupo actualizado correctamente.' });
            } else {
                await api.post('/grupos', payload);
                toast({ message: 'Grupo creado correctamente.' });
            }
            navigate('/usuarios/grupos');
        } catch (error) {
            console.error("Error al guardar grupo", error);
            await alert({ message: "Error al guardar el grupo" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!await confirm({ message: "¿Estás seguro de que deseas eliminar este grupo permanentemente?" })) return;
        try {
            setLoading(true);
            await api.delete(`/grupos/${id}`);
            toast({ message: 'Grupo eliminado correctamente.' });
            navigate('/usuarios/grupos');
        } catch (error) {
            console.error("Error al eliminar grupo", error);
            await alert({ message: "No se pudo eliminar el grupo. Verifica que no tenga usuarios activos asignados." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Cabecera */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{id ? 'Editar Grupo' : 'Nuevo Grupo'}</h1>
                    <p className="text-sm text-muted-foreground">Define las reglas y permisos para este conjunto de usuarios.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Tabs estilo Segmented Control */}
                <div className="p-4 border-b border-border bg-muted/20">
                    <div className="flex bg-muted p-1 rounded-lg w-fit">
                        {[
                            { id: 'datos', label: 'Datos del Grupo' },
                            { id: 'usuarios', label: 'Usuarios Asignados' },
                            { id: 'aplicaciones', label: 'Aplicaciones y Permisos' }
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
                    
                    {/* TAB 1: DATOS */}
                    <div className={activeTab === 'datos' ? 'block' : 'hidden'}>
                        <div className="max-w-xl flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-foreground">Nombre del Grupo <span className="text-destructive">*</span></label>
                                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-transparent" placeholder="Ej: Administradores de Laboratorio" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-foreground">Descripción</label>
                                <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-transparent" placeholder="Propósito del grupo" />
                            </div>
                            <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border w-fit">
                                <Toggle label="Grupo Activo" checked={formData.activo} onChange={() => setFormData(prev => ({ ...prev, activo: !prev.activo }))} />
                            </div>
                        </div>
                    </div>

                    {/* TAB 2: USUARIOS */}
                    <div className={activeTab === 'usuarios' ? 'block' : 'hidden'}>
                        {usuariosDelGrupo.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-border rounded-xl bg-muted/10">
                                <UsersRound className="w-8 h-8 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium text-foreground">No hay usuarios asignados</p>
                                <p className="text-xs text-muted-foreground mt-1">Los usuarios se asignan desde el perfil de cada uno.</p>
                            </div>
                        ) : (
                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-muted-foreground">Usuario</th>
                                            <th className="px-4 py-3 font-semibold text-muted-foreground">Nombre completo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {usuariosDelGrupo.map((usuario: any) => (
                                            <tr key={usuario.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-medium text-foreground">{usuario.nombre_usuario}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {usuario.persona?.apellidos}, {usuario.persona?.nombre}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* TAB 3: APLICACIONES */}
                    <div className={activeTab === 'aplicaciones' ? 'block' : 'hidden'}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1.5 max-w-sm">
                                <label className="text-sm font-semibold text-foreground">Vincular Aplicación</label>
                                <select onChange={handleAddApp} className="border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-transparent">
                                    <option value="">Seleccione una aplicación para añadir...</option>
                                    {catalogoApps.map(app => (
                                        <option key={app.id} value={app.id}>{app.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.aplicaciones.length > 0 && (
                                <div className="border border-border rounded-xl overflow-hidden mt-2">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        <div className="col-span-5">Aplicación</div>
                                        <div className="col-span-3 text-center">Nivel de Acceso</div>
                                        <div className="col-span-3 text-center">Orden Visual</div>
                                        <div className="col-span-1 text-center">X</div>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {formData.aplicaciones.map(app => (
                                            <div key={app.aplicacion_id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-muted/10 transition-colors">
                                                <div className="col-span-5 text-sm font-medium text-foreground flex items-center">
                                                    <div className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md border border-border">
                                                        {app.nombre}
                                                    </div>
                                                </div>
                                                <div className="col-span-3 px-2">
                                                    <select 
                                                        value={app.nivel} 
                                                        onChange={(e) => handleAppChange(app.aplicacion_id, 'nivel', Number(e.target.value))}
                                                        className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-primary/20"
                                                    >
                                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Nivel {n}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-3 px-2">
                                                    <input 
                                                        type="number" 
                                                        value={app.orden} 
                                                        onChange={(e) => handleAppChange(app.aplicacion_id, 'orden', Number(e.target.value))}
                                                        className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <button type="button" onClick={() => handleRemoveApp(app.aplicacion_id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BOTONERA */}
                    <div className="mt-10 pt-5 border-t border-border flex items-center justify-between">
                        {id ? (
                            <button type="button"  onClick={handleDelete} className="text-destructive hover:bg-destructive/10 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                                <Trash2 className="w-4 h-4" /> Eliminar Grupo
                            </button>
                        ) : <div></div>}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-input bg-transparent hover:bg-muted text-foreground text-sm font-medium rounded-md transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50">
                                {loading ? 'Guardando...' : 'Guardar Grupo'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};