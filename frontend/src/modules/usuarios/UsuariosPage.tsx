import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit2, Trash2, Search, Users } from 'lucide-react';
import api from '../../core/api/axios';
import { tienePermiso } from '../../shared/utils/auth';

export const UsuariosPage = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const puedeCrear = tienePermiso('Gestion de Usuarios', 5);
    const puedeEditar = tienePermiso('Gestion de Usuarios', 4);
    const puedeEliminar = tienePermiso('Gestion de Usuarios', 5);
    const mostrarAcciones = puedeEditar || puedeEliminar;

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

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.persona?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.persona?.apellidos.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Deseas eliminar este usuario?")) return;
        try {
            await api.delete(`/usuarios/${id}`);
            setUsuarios(usuarios.filter(u => u.id !== id));
        } catch (error) {
            alert("Error al eliminar el usuario");
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

            {/* Buscador Moderno */}
            <div className="mb-6 relative max-w-md">
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
                                        <p className="text-xs text-muted-foreground mt-1">Ajusta tu búsqueda o crea un nuevo registro.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            usuariosFiltrados.map(usuario => (
                                <tr key={usuario.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{usuario.nombre_usuario}</td>
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
                                                    <button onClick={() => navigate(`/usuarios/editar/${usuario.id}`)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1.5 rounded-md transition-colors" title="Editar">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {puedeEliminar && (
                                                    <button onClick={() => handleDelete(usuario.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors" title="Eliminar">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};