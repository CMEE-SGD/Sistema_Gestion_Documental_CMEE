import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import api from '../../core/api/axios';

// Componente Toggle reutilizable
const Toggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center cursor-pointer w-max my-3">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#2185d0]' : 'bg-gray-300'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
        <span className="ml-3 text-sm text-gray-700">{label}</span>
    </label>
);

export const GrupoFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'datos' | 'usuarios' | 'aplicaciones'>('datos');
    const [loading, setLoading] = useState(false);
    
    // Catálogos
    const [catalogoApps, setCatalogoApps] = useState<any[]>([]);
    const [usuariosDelGrupo, setUsuariosDelGrupo] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        activo: true,
        aplicaciones: [] as any[] // Aquí guardaremos { aplicacion_id, nivel, orden, nombre }
    });

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                // 1. Cargar el catálogo de aplicaciones disponibles
                const resApps = await api.get('/aplicaciones');
                console.log("Apps recibidas del backend:", resApps.data); // <-- MIRA LA CONSOLA
                setCatalogoApps(resApps.data);

                // 2. Si es edición, cargar los datos del grupo
                if (id) {
                    const resGrupo = await api.get(`/grupos/${id}`);
                    const grupo = resGrupo.data;
                    setFormData({
                        nombre: grupo.nombre,
                        descripcion: grupo.descripcion || '',
                        activo: grupo.activo,
                        // Mapeamos para que coincida con nuestro estado del frontend
                        aplicaciones: grupo.aplicaciones.map((a: any) => ({
                            aplicacion_id: a.aplicacion_id,
                            nivel: a.nivel,
                            orden: a.orden,
                            nombre: a.aplicacion.nombre // Necesario para mostrar el nombre en la tabla
                        }))
                    });
                    // Cargar usuarios del grupo
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

    // --- LÓGICA DE APLICACIONES ---
    const handleAddApp = (e: any) => {
        const appId = Number(e.target.value);
        if (!appId) return;

        // Evitar duplicados
        if (formData.aplicaciones.some(app => app.aplicacion_id === appId)) return;

        const appSeleccionada = catalogoApps.find(a => a.id === appId);
        
        setFormData(prev => ({
            ...prev,
            aplicaciones: [
                ...prev.aplicaciones, 
                { aplicacion_id: appId, nivel: 5, orden: 0, nombre: appSeleccionada.nombre }
            ]
        }));
        e.target.value = ""; // Resetear select
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

    // --- GUARDAR ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Preparamos el payload quitando el 'nombre' de las apps (el backend no lo necesita)
            const payload = {
                ...formData,
                aplicaciones: formData.aplicaciones.map(app => ({
                    aplicacion_id: app.aplicacion_id,
                    nivel: Number(app.nivel),
                    orden: Number(app.orden)
                }))
            };

            if (id) {
                await api.patch(`/grupos/${id}`, payload);
            } else {
                await api.post('/grupos', payload);
            }
            navigate('/usuarios/grupos');
        } catch (error) {
            console.error("Error al guardar grupo", error);
            alert("Error al guardar el grupo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* TABS */}
                <div className="flex border-b border-gray-300 mb-6">
                    <button type="button" onClick={() => setActiveTab('datos')} className={`px-6 py-2.5 text-sm ${activeTab === 'datos' ? 'border-b-2 border-[#2185d0] text-[#2185d0] font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                        Datos
                    </button>
                    <button type="button" onClick={() => setActiveTab('usuarios')} className={`px-6 py-2.5 text-sm ${activeTab === 'usuarios' ? 'border-b-2 border-[#2185d0] text-[#2185d0] font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                        Usuarios
                    </button>
                    <button type="button" onClick={() => setActiveTab('aplicaciones')} className={`px-6 py-2.5 text-sm ${activeTab === 'aplicaciones' ? 'border-b-2 border-[#2185d0] text-[#2185d0] font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                        Aplicaciones
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* TAB 1: DATOS */}
                    <div className={activeTab === 'datos' ? 'block' : 'hidden'}>
                        <div className="max-w-2xl mx-auto flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-700">Nombre*</label>
                                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" placeholder="Nombre" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-700">Descripción*</label>
                                <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500" placeholder="Descripción" />
                            </div>
                            <Toggle label="Estado" checked={formData.activo} onChange={() => setFormData(prev => ({ ...prev, activo: !prev.activo }))} />
                        </div>
                    </div>

                    {/* TAB 2: USUARIOS */}
                    <div className={activeTab === 'usuarios' ? 'block' : 'hidden'}>
                        <div className="max-w-4xl mx-auto">
                            {usuariosDelGrupo.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded">
                                    <p className="text-sm">No hay usuarios asignados a este grupo aún.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-300">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuario</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre completo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuariosDelGrupo.map((usuario: any) => (
                                                <tr key={usuario.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">{usuario.nombre_usuario}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">
                                                        {usuario.persona?.apellidos}, {usuario.persona?.nombre}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TAB 3: APLICACIONES */}
                    <div className={activeTab === 'aplicaciones' ? 'block' : 'hidden'}>
                        <div className="max-w-4xl mx-auto flex flex-col gap-6">
                            
                            {/* Selector para añadir */}
                            <div className="flex flex-col gap-1 max-w-md">
                                <label className="text-sm text-gray-700">Añadir</label>
                                <select onChange={handleAddApp} className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm bg-white">
                                    <option value="">Seleccione Añadir</option>
                                    {catalogoApps.map(app => (
                                        <option key={app.id} value={app.id}>{app.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tabla de aplicaciones seleccionadas */}
                            {formData.aplicaciones.length > 0 && (
                                <div className="mt-4">
                                    <div className="grid grid-cols-12 gap-4 pb-2 border-b border-gray-200 text-xs font-bold text-gray-600">
                                        <div className="col-span-6">Aplicación</div>
                                        <div className="col-span-2 text-center">Nivel</div>
                                        <div className="col-span-3 text-center">Orden</div>
                                        <div className="col-span-1 text-center">Eliminar</div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-3">
                                        {formData.aplicaciones.map(app => (
                                            <div key={app.aplicacion_id} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-2 rounded border border-gray-100">
                                                <div className="col-span-6 text-sm text-gray-700 bg-gray-200 px-3 py-1.5 rounded">
                                                    {app.nombre}
                                                </div>
                                                <div className="col-span-2">
                                                    <select 
                                                        value={app.nivel} 
                                                        onChange={(e) => handleAppChange(app.aplicacion_id, 'nivel', Number(e.target.value))}
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                                                    >
                                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-3">
                                                    <input 
                                                        type="number" 
                                                        value={app.orden} 
                                                        onChange={(e) => handleAppChange(app.aplicacion_id, 'orden', Number(e.target.value))}
                                                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <button type="button" onClick={() => handleRemoveApp(app.aplicacion_id)} className="text-gray-500 hover:text-red-600">
                                                        <X className="w-5 h-5" />
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
                            <button type="submit" disabled={loading} className="bg-[#005ea2] text-white px-5 py-1.5 rounded text-sm hover:bg-blue-800 disabled:opacity-50">
                                {loading ? 'Guardando...' : 'Aceptar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};