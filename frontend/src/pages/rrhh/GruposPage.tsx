import { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

// Interfaces basadas en tu backend
interface Departamento {
    id: number;
    codigo: string;
    nombre: string;
    tipo: string;
    dependencia_id: number | null;
    activo: boolean;
    orden: number;
    // Nueva propiedad mapeada del backend
    puestos_asignados?: any[]; 
    nivel?: number; 
}

export const GruposPage = () => {
    const navigate = useNavigate();
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. ESTADOS PARA LOS FILTROS
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');

    useEffect(() => {
        cargarDepartamentos();
    }, []);

    const cargarDepartamentos = async () => {
        try {
            const response = await api.get('/departamentos');
            const arbol = construirArbolJerarquico(response.data);
            setDepartamentos(arbol);
        } catch (error) {
            console.error('Error al cargar departamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const construirArbolJerarquico = (data: Departamento[], padreId: number | null = null, nivel: number = 0): Departamento[] => {
        let resultado: Departamento[] = [];
        
        const hijos = data
            .filter((d) => d.dependencia_id === padreId)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0)); 
        
        hijos.forEach((hijo) => {
            resultado.push({ ...hijo, nivel });
            resultado = resultado.concat(construirArbolJerarquico(data, hijo.id, nivel + 1));
        });
        
        return resultado;
    };

    // 2. LÓGICA DE FILTRADO
    const gruposFiltrados = departamentos.filter(dep => {
        // Filtro por Estado
        if (filtroEstado === 'activo' && !dep.activo) return false;
        if (filtroEstado === 'inactivo' && dep.activo) return false;

        // Filtro por Palabra Clave (Busca en nombre y código)
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoGrupo = `${dep.nombre || ''} ${dep.codigo || ''}`.toLowerCase();
            if (!textoGrupo.includes(busqueda)) {
                return false;
            }
        }

        return true; 
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex gap-2">
                    <button onClick={() => navigate('/rrhh')}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Atrás
                    </button>
                    <button 
                        onClick={() => navigate('/rrhh/grupos/nuevo')} 
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" /> Nuevo grupo
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Organigrama
                    </button>
                </div>
                
                {/* 3. CUADRO DE FILTROS DINÁMICOS */}
                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filtroEstado" className="text-sm font-bold text-gray-700">Estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                            className="p-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="activo">Sólo grupos activos</option>
                            <option value="inactivo">Sólo grupos inactivos</option>
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
                            <th className="px-4 py-2">Organigrama</th>
                            <th className="px-4 py-2">Tipo</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                            <th className="px-4 py-2 text-center">Nº usuarios</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    Cargando estructura...
                                </td>
                            </tr>
                        ) : gruposFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    No se encontraron grupos con esos filtros.
                                </td>
                            </tr>
                        ) : (
                            // 4. MAPEO CON EL ARREGLO FILTRADO
                            gruposFiltrados.map((dep) => (
                                <tr 
                                    key={dep.id} 
                                    onClick={() => navigate(`/rrhh/grupos/${dep.id}`)}
                                    className={`hover:bg-gray-100 cursor-pointer transition-colors ${!dep.activo ? 'opacity-70 bg-gray-50' : ''}`}
                                >
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        {/* Manteniendo la indentación jerárquica */}
                                        <span style={{ paddingLeft: `${(dep.nivel || 0) * 1.5}rem` }}></span>
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <span className={dep.nivel === 0 ? 'font-bold' : ''}>
                                            {dep.nombre}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">{dep.tipo || 'Departamento'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${dep.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {dep.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {dep.puestos_asignados?.length || 0}
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