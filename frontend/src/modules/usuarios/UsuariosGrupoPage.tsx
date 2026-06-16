import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UsersRound } from 'lucide-react';
import api from '../../core/api/axios';
import { tienePermiso } from '../../shared/utils/auth';

export const UsuariosGruposPage = () => {
    const navigate = useNavigate();
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const puedeCrear = tienePermiso('Gestion de Usuarios', 5);
    const puedeEditar = tienePermiso('Gestion de Usuarios', 4);

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const res = await api.get('/grupos');
                setGrupos(res.data);
            } catch (error) {
                console.error("Error al cargar grupos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrupos();
    }, []);

    const filtrados = grupos.filter((g: any) =>
        g.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (g.descripcion && g.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Grupos de Usuarios</h1>
                    <p className="text-sm text-muted-foreground mt-1">Administra los roles y niveles de acceso a las aplicaciones.</p>
                </div>
                
                {puedeCrear && (
                    <button
                        onClick={() => navigate('/usuarios/grupos/nuevo')}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Grupo
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
                    placeholder="Buscar por nombre o descripción..."
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
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Grupo</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground">Descripción</th>
                            <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">Cargando grupos...</td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="bg-muted p-3 rounded-full mb-3">
                                            <UsersRound className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No se encontraron grupos</p>
                                        <p className="text-xs text-muted-foreground mt-1">Ajusta tu búsqueda o crea un nuevo registro.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtrados.map((grupo: any) => (
                                <tr
                                    key={grupo.id}
                                    onClick={() => puedeEditar && navigate(`/usuarios/grupos/editar/${grupo.id}`)}
                                    className={`transition-colors ${
                                        puedeEditar ? 'hover:bg-muted/40 cursor-pointer' : ''
                                    }`}
                                >
                                    <td className="px-6 py-4 font-medium text-foreground">{grupo.nombre}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{grupo.descripcion || <span className="italic text-muted-foreground/60">Sin descripción</span>}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                                            grupo.activo 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {grupo.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};