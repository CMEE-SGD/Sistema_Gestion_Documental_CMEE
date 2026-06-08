import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import api from '../../core/api/axios';

export const UsuariosPage = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

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

    // Filtrar usuarios por nombre o usuario
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
            alert("Usuario eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar usuario", error);
            alert("Error al eliminar el usuario");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-xl font-semibold text-gray-800">Usuarios del sistema</h1>
                <button
                    onClick={() => navigate('/usuarios/nuevo')}
                    className="bg-[#2185d0] text-white px-4 py-2 rounded text-sm hover:bg-blue-600 flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Nuevo usuario
                </button>
            </div>

            {/* Campo de búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por usuario, nombre o apellido..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-md border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                />
            </div>

            {/* Tabla de usuarios */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>
            ) : usuariosFiltrados.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded shadow-sm p-8 text-center text-gray-500">
                    {usuarios.length === 0
                        ? "No hay usuarios registrados. Haz clic en 'Nuevo usuario' para crear uno."
                        : "No se encontraron usuarios con esos criterios de búsqueda."
                    }
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre completo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Grupos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuariosFiltrados.map(usuario => (
                                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{usuario.nombre_usuario}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {usuario.persona?.apellidos}, {usuario.persona?.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {usuario.grupos?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {usuario.grupos.map((g: any) => (
                                                    <span key={g.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                        {g.nombre}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Sin grupos</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${usuario.estado_cuenta && !usuario.bloqueado
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {usuario.bloqueado ? 'Bloqueado' : usuario.estado_cuenta ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Editar usuario"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};