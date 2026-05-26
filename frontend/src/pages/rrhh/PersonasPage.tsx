import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import api from '../../lib/axios';
import { Persona } from '../../data/users'; // Asegúrate de que la ruta sea correcta

export const PersonasPage = () => {
    const navigate = useNavigate();
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(true);
    const [palabraClave, setPalabraClave] = useState('');

    useEffect(() => {
        const fetchPersonas = async () => {
            try {
                // Ajusta la ruta del endpoint según tu backend
                const response = await api.get('/personas');
                
                // Ordenar por apellidos por defecto (como sugiere la flecha en la imagen)
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

    return (
        <div className="flex flex-col gap-4">
            {/* Barra de herramientas y acciones */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Atrás
                    </button>
                    <button 
                        onClick={() => navigate('/rrhh/personas/nuevo')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Nuevo recurso
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Imprimir
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Importar
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Exportar
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Plan de Capacitación
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                        Eliminar
                    </button>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Actualizar Listado
                    </button>
                </div>

                {/* Buscador alineado a la derecha como en la imagen */}
                <div className="flex items-center gap-2">
                    <label htmlFor="palabraClave" className="text-sm text-gray-700">Palabra clave:</label>
                    <input 
                        id="palabraClave"
                        type="text" 
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                        value={palabraClave}
                        onChange={(e) => setPalabraClave(e.target.value)}
                    />
                </div>
            </div>

            {/* Botón Buscar inferior */}
            <div className="flex items-center gap-2 px-3">
                <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                    Buscar
                </button>
            </div>

            {/* Tabla de Personas */}
            <div className="overflow-x-auto border border-gray-200 rounded shadow-sm bg-white">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    {/* Cabecera verde */}
                    <thead className="bg-[#007b00] text-white font-bold">
                        <tr>
                            <th className="px-4 py-3 w-10 text-center">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-green-800">
                                Apellidos ▼
                            </th>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Puestos</th>
                            <th className="px-4 py-3">Usuario</th>
                            <th className="px-4 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Cargando datos...</td></tr>
                        ) : personas.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay personas registradas.</td></tr>
                        ) : (
                            personas.map((persona) => (
                                <tr 
                                    key={persona.id} 
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3 text-center align-middle">
                                        <input type="checkbox" className="rounded" />
                                    </td>
                                    
                                    {/* Foto y Apellidos */}
                                    <td className="px-4 py-3 flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/rrhh/personas/${persona.id}`)}>
                                        {persona.foto_ruta ? (
                                            <img 
                                                src={persona.foto_ruta} 
                                                alt={`Foto de ${persona.apellidos}`} 
                                                className="w-12 h-14 object-cover border border-gray-300 bg-gray-100"
                                            />
                                        ) : (
                                            <div className="w-12 h-14 flex items-center justify-center bg-gray-200 border border-gray-300 text-gray-500">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-800">{persona.apellidos}</span>
                                    </td>

                                    {/* Nombre (adaptado a tu BD) */}
                                    <td className="px-4 py-3 text-gray-700 align-middle">
                                        {persona.nombre}
                                    </td>

                                    {/* Puestos */}
                                    <td className="px-4 py-3 text-gray-700 align-middle">
                                        <div className="flex flex-col gap-1">
                                            {persona.puestos && persona.puestos.map((puesto, index) => (
                                                <span key={index}>{puesto}</span>
                                            ))}
                                        </div>
                                    </td>

                                    {/* Usuario */}
                                    <td className="px-4 py-3 align-middle">
                                        <span className={persona.usuario === 'Usuario externo' || persona.esUsuarioExterno ? "text-green-600" : "text-gray-800"}>
                                            {persona.usuario || '-'}
                                        </span>
                                    </td>

                                    {/* Estado (usando el booleano 'activo' de la BD) */}
                                    <td className="px-4 py-3 align-middle text-gray-800">
                                        {persona.activo ? 'Activo' : 'Inactivo'}
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