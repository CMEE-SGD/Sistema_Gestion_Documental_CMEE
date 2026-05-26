import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../../lib/axios';

export const UsuariosGruposPage = () => {
    const navigate = useNavigate();
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

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

    // Filtro local por nombre o descripción
    const filtrados = grupos.filter((g: any) =>
        g.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (g.descripcion && g.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Botón superior derecho */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate('/usuarios/grupos/nuevo')}
                    className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1 font-medium"
                >
                    <Plus className="w-4 h-4" /> Nuevo grupo
                </button>
            </div>

            {/* Contenedor principal de la tabla */}
            <div className="border border-gray-200 rounded bg-white shadow-sm">
                
                {/* Barra de búsqueda */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Introduzca su búsqueda"
                        className="w-full outline-none text-sm text-gray-700"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100">GRUPO ↕</th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100">DESCRIPCIÓN ↕</th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-gray-100">ESTADO ↕</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-8">Cargando datos...</td></tr>
                            ) : filtrados.length === 0 ? (
                                <tr><td colSpan={3} className="text-center py-8">No se encontraron grupos.</td></tr>
                            ) : (
                                filtrados.map((grupo: any) => (
                                    <tr
                                        key={grupo.id}
                                        onClick={() => navigate(`/usuarios/grupos/editar/${grupo.id}`)}
                                        className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-800">{grupo.nombre}</td>
                                        <td className="px-4 py-3">{grupo.descripcion || '-'}</td>
                                        <td className="px-4 py-3">{grupo.activo ? 'Activo' : 'Inactivo'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};