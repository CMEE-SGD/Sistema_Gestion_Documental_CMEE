import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit2, Trash2, Search, Users, ArchiveRestore, MonitorX, LogOut } from 'lucide-react';
import api from '../../core/api/axios';
import { encodeId } from '../../shared/utils/ids';
import { tienePermiso } from '../../shared/utils/auth';
import { useAlert } from '../../shared/components/molecules/AlertModal';
import { useToast } from '../../shared/components/molecules/Toast';

export const UsuariosPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    
    // 👇 1. Nuevo estado para el filtro de eliminados
    const [mostrarInactivos, setMostrarInactivos] = useState(false);

    // 👇 Estado para el control de sesiones activas
    const [sesiones, setSesiones] = useState<any[]>([]);
    const [cargandoSesiones, setCargandoSesiones] = useState(false);

    const puedeCrear = tienePermiso('Gestion de Usuarios', 5);
    const puedeEditar = tienePermiso('Gestion de Usuarios', 4);
    const puedeEliminar = tienePermiso('Gestion de Usuarios', 5);
    const mostrarAcciones = puedeEditar || puedeEliminar;
    const puedeCerrarSesiones = tienePermiso('Gestion de Usuarios', 5);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                setLoading(true);
                const res = await api.get('/usuarios');
                setUsuarios(res.data);
            } catch (error) {
                console.error("Error al cargar usuarios", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsuarios();
    }, []);

    // 👇 Carga de sesiones activas
    useEffect(() => {
        if (!puedeCerrarSesiones) return;
        const fetchSesiones = async () => {
            try {
                setCargandoSesiones(true);
                const res = await api.get('/usuarios/sesiones');
                setSesiones(res.data);
            } catch (error) {
                console.error("Error al cargar sesiones activas", error);
            } finally {
                setCargandoSesiones(false);
            }
        };
        fetchSesiones();
    }, [puedeCerrarSesiones]);

    const formatFecha = (fecha: string) => {
        if (!fecha) return '—';
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return fecha;
        return d.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const handleCerrarSesiones = async (usuario: any) => {
        const nombre = usuario?.persona?.nombre
            ? `${usuario.persona.nombre} ${usuario.persona.apellidos ?? ''}`.trim()
            : usuario?.nombre_usuario ?? 'este usuario';
        if (!await confirm({ message: `¿Cerrar todas las sesiones activas de ${nombre}? Se revocará su acceso al instante.` })) return;
        try {
            await api.post(`/usuarios/${usuario.id}/cerrar-sesiones`);
            setSesiones(sesiones.filter(s => s.usuario_id !== usuario.id));
            toast({ message: `Sesiones de ${nombre} cerradas correctamente.` });
        } catch (error) {
            await alert({ message: "Error al cerrar las sesiones" });
        }
    };

    // 👇 2. Lógica de filtrado combinada (Texto + Estado)
    const usuariosFiltrados = usuarios.filter(u => {
        // Asumimos que el borrado lógico usa 'estado_cuenta' o 'activo'
        const esInactivo = u.estado_cuenta === false || u.activo === false;
        
        // Si el switch está apagado y el usuario es inactivo, lo ocultamos
        if (!mostrarInactivos && esInactivo) return false;

        // Filtro de texto normal
        return (
            u.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.persona?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.persona?.apellidos?.toLowerCase().includes(busqueda.toLowerCase())
        );
    });

    const handleDelete = async (id: number) => {
        if (!await confirm({ message: "¿Deseas desactivar/eliminar este usuario?" })) return;
        try {
            await api.delete(`/usuarios/${id}`);
            // 👇 3. En lugar de borrarlo, lo actualizamos localmente como inactivo
            setUsuarios(usuarios.map(u => 
                u.id === id ? { ...u, estado_cuenta: false, activo: false } : u
            ));
            toast({ message: 'Usuario desactivado correctamente.' });
        } catch (error) {
            await alert({ message: "Error al eliminar el usuario" });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Usuarios del Sistema</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona los accesos y credenciales del personal.</p>
                </div>
                
                {puedeCrear && (
                    <button
                        onClick={() => navigate('/usuarios/nuevo')}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Nuevo Usuario
                    </button>
                )}
            </div>

            {/* Buscador y Filtro */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por usuario, nombre o apellido..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>

                {/* 👇 Checkbox estético para alternar vista */}
                <label className="flex items-center gap-2 cursor-pointer group bg-card border border-border px-4 py-2 rounded-lg shadow-sm hover:bg-muted/50 transition-colors">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={mostrarInactivos} 
                            onChange={(e) => setMostrarInactivos(e.target.checked)} 
                        />
                        <div className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out ${mostrarInactivos ? 'bg-primary' : 'bg-slate-300'}`}></div>
                        <div className={`absolute left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${mostrarInactivos ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Mostrar inactivos / eliminados
                    </span>
                </label>
            </div>

            {/* Tabla */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Usuario</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Nombre completo</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Grupos</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Estado</th>
                            {mostrarAcciones && (
                                <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Cargando usuarios...</td></tr>
                        ) : usuariosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="bg-muted p-3 rounded-full mb-3">
                                            <Users className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No se encontraron usuarios</p>
                                        <p className="text-xs text-muted-foreground mt-1">Ajusta tu búsqueda o el filtro de inactivos.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            usuariosFiltrados.map(usuario => {
                                const esInactivo = usuario.estado_cuenta === false || usuario.activo === false;
                                
                                return (
                                    <tr key={usuario.id} className={`transition-colors ${esInactivo ? 'bg-rose-50/30' : 'hover:bg-muted/30'}`}>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {usuario.nombre_usuario}
                                            {esInactivo}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {usuario.persona?.apellidos}, {usuario.persona?.nombre}
                                        </td>
                                        <td className="px-6 py-4">
                                            {usuario.grupos?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {usuario.grupos.map((g: any) => (
                                                        <span key={g.id} className="bg-secondary text-secondary-foreground text-[11px] font-medium px-2 py-0.5 rounded-md border border-border">
                                                            {g.nombre}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Sin grupos</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                                                usuario.bloqueado 
                                                    ? 'bg-rose-100 text-rose-700' 
                                                    : usuario.estado_cuenta 
                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                        : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {usuario.bloqueado ? 'Bloqueado' : usuario.estado_cuenta ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>

                                        {mostrarAcciones && (
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-1">
                                                    {puedeEditar && (
                                                        <button onClick={() => navigate(`/usuarios/editar/${encodeId(usuario.id)}`)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1.5 rounded-md transition-colors" title="Editar">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {/* Si está inactivo no mostramos el tacho de basura, si está activo sí */}
                                                    {puedeEliminar && !esInactivo && (
                                                        <button onClick={() => handleDelete(usuario.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors" title="Eliminar">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* 👇 Sesiones activas — control de acceso */}
            {puedeCerrarSesiones && (
                <div className="mt-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <MonitorX className="w-5 h-5 text-primary" />
                                Sesiones Activas
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Usuarios con sesión iniciada en el sistema. Puedes revocar su acceso al instante.
                            </p>
                        </div>
                        <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full border border-border">
                            {sesiones.length} sesión{sesiones.length !== 1 ? 'es' : ''} activa{sesiones.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-muted-foreground">Usuario</th>
                                    <th className="px-6 py-3 font-semibold text-muted-foreground">IP</th>
                                    <th className="px-6 py-3 font-semibold text-muted-foreground">Inicio</th>
                                    <th className="px-6 py-3 font-semibold text-muted-foreground">Expiración</th>
                                    <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {cargandoSesiones ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Cargando sesiones...</td></tr>
                                ) : sesiones.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="bg-muted p-3 rounded-full mb-3">
                                                    <LogOut className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">No hay sesiones activas</p>
                                                <p className="text-xs text-muted-foreground mt-1">Los usuarios que se conecten aparecerán aquí.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sesiones.map(sesion => (
                                        <tr key={sesion.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-foreground">{sesion.usuario?.nombre_usuario}</span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {sesion.usuario?.persona
                                                        ? `${sesion.usuario.persona.apellidos}, ${sesion.usuario.persona.nombre}`
                                                        : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                                    {sesion.ip ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{formatFecha(sesion.fecha_inicio)}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{formatFecha(sesion.fecha_expiracion)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-1">
                                                    {/* Cerrar todas las sesiones del usuario */}
                                                    <button
                                                        onClick={() => handleCerrarSesiones(sesion.usuario)}
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                                                        title="Cerrar todas las sesiones de este usuario"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};