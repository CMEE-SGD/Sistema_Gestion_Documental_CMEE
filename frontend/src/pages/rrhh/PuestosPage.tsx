import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import api from '../../lib/axios';

export const PuestosPage = () => {
    const navigate = useNavigate();
    const [puestos, setPuestos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Estados para los filtros
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');

    useEffect(() => {
        const fetchPuestos = async () => {
            try {
                const response = await api.get('/puestos');
                const ordenados = response.data.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
                setPuestos(ordenados);
            } catch (error) {
                console.error('Error cargando puestos', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPuestos();
    }, []);

    const formatearFecha = (cadena: string) => {
        if (!cadena) return '';
        return new Date(cadena).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // 2. Lógica de Filtrado
    const puestosFiltrados = puestos.filter(puesto => {
        // Filtro por Estado
        if (filtroEstado === 'activo' && !puesto.activo) return false;
        if (filtroEstado === 'inactivo' && puesto.activo) return false;

        // Filtro por Palabra Clave (Busca en nombre y código)
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const textoPuesto = `${puesto.nombre || ''} ${puesto.codigo || ''}`.toLowerCase();
            if (!textoPuesto.includes(busqueda)) {
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
                    onClick={() => navigate('/rrhh/puestos/nuevo')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> Nuevo puesto
                </button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Ver esquema</button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Asignar carpeta</button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Importar</button>
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Imprimir</button>
                
                {/* 3. Cuadro de Filtros Dinámicos */}
                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filtroEstado" className="text-sm font-bold text-gray-700">Estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                            className="p-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="activo">Sólo puestos activos</option>
                            <option value="inactivo">Sólo puestos inactivos</option>
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
                            <th className="px-4 py-2">Puesto</th>
                            <th className="px-4 py-2">Código</th>
                            <th className="px-4 py-2 text-center">Orden</th>
                            <th className="px-4 py-2 text-center">Fecha última mod.</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
                        ) : puestosFiltrados.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No se encontraron puestos.</td></tr>
                        ) : (
                            // 4. Mapeamos sobre los datos ya filtrados
                            puestosFiltrados.map((puesto) => (
                                <tr 
                                    key={puesto.id} 
                                    onClick={() => navigate(`/rrhh/puestos/${puesto.id}`)}
                                    className={`hover:bg-gray-100 cursor-pointer transition-colors ${!puesto.activo ? 'opacity-70 bg-gray-50' : ''}`}
                                >
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-800" />
                                        {puesto.nombre}
                                    </td>
                                    <td className="px-4 py-2">{puesto.codigo}</td>
                                    <td className="px-4 py-2 text-center">{puesto.orden}</td>
                                    <td className="px-4 py-2 text-center">{formatearFecha(puesto.fecha_ultima_mod || puesto.updatedAt)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${puesto.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {puesto.activo ? 'Activo' : 'Inactivo'}
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