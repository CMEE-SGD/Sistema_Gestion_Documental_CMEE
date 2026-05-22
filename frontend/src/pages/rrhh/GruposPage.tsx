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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
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
                
                <select className="p-1.5 text-sm border border-gray-300 rounded bg-white">
                    <option>Sólo grupos activos</option>
                    <option>Todos</option>
                </select>
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
                        ) : departamentos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    No hay grupos registrados.
                                </td>
                            </tr>
                        ) : (
                            departamentos.map((dep) => (
                                <tr 
                                    key={dep.id} 
                                    onClick={() => navigate(`/rrhh/grupos/${dep.id}`)}
                                    className="hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-2 flex items-center gap-2">
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
                                        {/* AHORA LEE puestos_asignados */}
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