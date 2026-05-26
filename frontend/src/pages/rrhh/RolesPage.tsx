import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserCog } from 'lucide-react';
import api from '../../lib/axios';

export const RolesPage = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get('/roles');
                // Ordenar por el campo 'orden'
                const ordenados = response.data.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
                setRoles(ordenados);
            } catch (error) {
                console.error('Error cargando roles', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const formatearFecha = (cadena: string) => {
        if (!cadena) return '';
        const fecha = new Date(cadena);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const rolesFiltrados = roles.filter(rol => {
        // Filtro por Estado
        if (filtroEstado === 'activo' && !rol.activo) return false;
        if (filtroEstado === 'inactivo' && rol.activo) return false;

        // Filtro por Palabra Clave (Busca en nombre y código)
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoRol = `${rol.nombre || ''} ${rol.codigo || ''}`.toLowerCase();
            if (!textoRol.includes(busqueda)) {
                return false;
            }
        }

        return true; 
    });
    
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Atrás</button>
                <button 
                    onClick={() => navigate('/rrhh/roles/nuevo')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> Nuevo rol
                </button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Ver esquema</button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Importar</button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Imprimir</button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Buscar</button>

                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filtroEstado" className="text-sm font-bold text-gray-700">Estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                            className="p-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="activo">Sólo roles activos</option>
                            <option value="inactivo">Sólo roles inactivos</option>
                            <option value="todos">Todos</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="palabraClave" className="text-sm font-bold text-gray-700">Palabra clave:</label>
                        <input 
                            id="palabraClave"
                            type="text" 
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500"
                            value={palabraClave}
                            onChange={(e) => setPalabraClave(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#8eb8d5] text-white font-bold">
                        <tr>
                            <th className="px-4 py-2">Rol</th>
                            <th className="px-4 py-2">Código</th>
                            <th className="px-4 py-2 text-center">Orden</th>
                            <th className="px-4 py-2 text-center">Fecha última mod.</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
                        ) : rolesFiltrados.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No se encontraron roles con esos filtros.</td></tr>
                        ) : rolesFiltrados.map((rol) => (
                            <tr 
                                key={rol.id} 
                                onClick={() => navigate(`/rrhh/roles/${rol.id}`)}
                                className={`hover:bg-gray-100 cursor-pointer transition-colors ${!rol.activo ? 'opacity-70 bg-gray-50' : ''}`}
                            >
                                <td className="px-4 py-2 flex items-center gap-2">
                                    <UserCog className="w-4 h-4 text-orange-500" />
                                    {rol.nombre}
                                </td>
                                <td className="px-4 py-2">{rol.codigo}</td>
                                <td className="px-4 py-2 text-center">{rol.orden}</td>
                                <td className="px-4 py-2 text-center">{formatearFecha(rol.updatedAt)}</td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs ${rol.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {rol.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};