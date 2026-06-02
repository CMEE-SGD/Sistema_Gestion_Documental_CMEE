import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import api from '../../lib/axios';
import { Persona } from '../../data/users'; 

export const PersonasPage = () => {
    const navigate = useNavigate();
    
    // Estados principales
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para los filtros
    const [palabraClave, setPalabraClave] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo'); // Por defecto vemos los activos

    useEffect(() => {
        const fetchPersonas = async () => {
            try {
                const response = await api.get('/personas');
                // Ordenar por apellidos por defecto
                const ordenados = response.data.sort((a: Persona, b: Persona) => 
                    (a.apellidos || '').localeCompare(b.apellidos || '')
                );
                setPersonas(ordenados);
            } catch (error) {
                console.error('Error cargando personas', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersonas();
    }, []);

    // LÓGICA DE FILTRADO (Se ejecuta antes de renderizar la tabla)
    const personasFiltradas = personas.filter(persona => {
        // 1. Filtro por Estado
        if (filtroEstado === 'activo' && !persona.activo) return false;
        if (filtroEstado === 'inactivo' && persona.activo) return false;
        // Si es 'todos', no retorna false, deja pasar a ambos.

        // 2. Filtro por Palabra Clave (Busca en nombre o apellido)
        if (palabraClave) {
            const busqueda = palabraClave.toLowerCase();
            const nombreCompleto = `${persona.nombre} ${persona.apellidos}`.toLowerCase();
            if (!nombreCompleto.includes(busqueda)) {
                return false;
            }
        }

        return true; // Si pasa todos los filtros, se muestra
    });

    return (
        <div className="flex flex-col gap-4 font-sans bg-white min-h-screen">
            
            {/* Barra de herramientas y acciones */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50">
                <div className="flex flex-wrap items-center gap-1.5">
                    <button 
                        onClick={() => navigate('/rrhh')}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        Atrás
                    </button>
                    <button 
                        onClick={() => navigate('/rrhh/personas/nuevo')}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        Nuevo recurso
                    </button>
                    <button className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Imprimir</button>
                    <button className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Importar</button>
                    <button className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Exportar</button>
                    <button className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Plan de Capacitación</button>
                    <button className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Eliminar</button>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm"
                    >
                        Actualizar Listado
                    </button>
                </div>

                {/* FILTROS (Estado y Palabra Clave) */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filtroEstado" className="text-[11px] font-bold text-gray-700">Estado:</label>
                        <select
                            id="filtroEstado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value as 'activo' | 'inactivo' | 'todos')}
                            className="border border-gray-300 rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="activo">Ver personal activo</option>
                            <option value="inactivo">Ver personal inactivo</option>
                            <option value="todos">Ver todo el personal</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="palabraClave" className="text-[11px] font-bold text-gray-700">Palabra clave:</label>
                        <input 
                            id="palabraClave"
                            type="text" 
                            className="border border-gray-300 rounded px-2 py-0.5 text-[11px] w-48 focus:outline-none focus:border-blue-500"
                            value={palabraClave}
                            onChange={(e) => setPalabraClave(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de Personas */}
            <div className="px-4">
                <div className="overflow-x-auto border border-gray-300 rounded shadow-sm bg-white">
                    <table className="w-full text-left whitespace-nowrap text-[11px]">
                        <thead className="bg-[#006400] text-white font-bold">
                            <tr>
                                <th className="px-4 py-2 w-10 text-center border-r border-[#004d00]">
                                    <input type="checkbox" className="rounded" />
                                </th>
                                <th className="px-4 py-2 border-r border-[#004d00] cursor-pointer hover:bg-[#004d00]">
                                    Apellidos ▼
                                </th>
                                <th className="px-4 py-2 border-r border-[#004d00]">Nombre</th>
                                <th className="px-4 py-2 border-r border-[#004d00]">Puestos</th>
                                <th className="px-4 py-2 border-r border-[#004d00]">Usuario</th>
                                <th className="px-4 py-2 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Cargando datos...</td></tr>
                            ) : personasFiltradas.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay registros que coincidan con los filtros.</td></tr>
                            ) : (
                                // Usamos personasFiltradas en lugar de personas
                                personasFiltradas.map((persona) => (
                                    <tr 
                                        key={persona.id} 
                                        className={`hover:bg-gray-100 transition-colors ${!persona.activo ? 'opacity-60 bg-gray-50' : ''}`}
                                    >
                                        <td className="px-4 py-2 text-center align-middle border-r border-gray-200">
                                            <input type="checkbox" className="rounded" />
                                        </td>
                                        
                                        <td className="px-4 py-2 border-r border-gray-200 cursor-pointer" onClick={() => navigate(`/rrhh/personas/${persona.id}`)}>
                                            <div className="flex items-center gap-3">
                                                {persona.foto_ruta ? (
                                                    <img src={persona.foto_ruta} alt="Foto" className="w-8 h-10 object-cover border border-gray-300" />
                                                ) : (
                                                    <div className="w-8 h-10 flex items-center justify-center bg-gray-200 border border-gray-300 text-gray-400">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <span className="font-bold text-gray-800">{persona.apellidos}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-2 text-gray-700 align-middle border-r border-gray-200">
                                            {persona.nombre}
                                        </td>

                                        <td className="px-4 py-2 text-gray-700 align-middle border-r border-gray-200">
                                            {/* Si los puestos vienen del backend como array, haz un map. Aquí un ejemplo genérico: */}
                                            {persona.puestos && persona.puestos.length > 0 ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {persona.puestos.map((p, i) => (
                                                        <span key={i}>{p.puesto?.nombre} ({p.departamento?.nombre})</span>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </td>
                                            
                                        <td className="px-4 py-2 align-middle border-r border-gray-200">
                                            <span className={persona.usuario?.nombre_usuario === 'Usuario externo' ? "text-green-600" : "text-gray-800"}>
                                                {persona.usuario?.nombre_usuario || '-'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2 align-middle text-center">
                                            <span className={`px-2 py-0.5 rounded font-bold ${persona.activo ? 'text-[#006400]' : 'text-red-600'}`}>
                                                {persona.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
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