import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Persona } from '../interfaces/persona.interface';
import { tienePermiso } from '../../../shared/utils/auth';
import { encodeId } from '../../../shared/utils/ids';
import { buildFileUrl } from '../../../shared/utils/backendUrl';

interface TablaPersonasProps {
    personas: Persona[];
    personasFiltradas: Persona[];
    loading: boolean;
    seleccionados: number[];
    onCheckIndividual: (id: number) => void;
    onCheckTodos: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TablaPersonas = ({
    personas,
    personasFiltradas,
    loading,
    seleccionados,
    onCheckIndividual,
    onCheckTodos
}: TablaPersonasProps) => {
    const navigate = useNavigate();
    const puedeEliminar = tienePermiso('Recursos Humanos', 5);
    const colSpanDinamico = puedeEliminar ? 6 : 5; 

    return (
        <div className="px-4 print:px-0">
            <div className="overflow-x-auto border border-gray-300 rounded shadow-sm bg-white print:shadow-none print:border-gray-400 print:w-full">
                <table className="w-full text-left whitespace-nowrap text-[11px] print:text-black print:text-[10px]">
                    <thead className="bg-[#006400] text-white font-bold print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
                        <tr>
                            {puedeEliminar && (
                                <th className="px-4 py-2 w-10 text-center border-r border-[#004d00] print:hidden">
                                    <input 
                                        type="checkbox" 
                                        className="rounded" 
                                        checked={seleccionados.length > 0 && seleccionados.length === personas.length} 
                                        onChange={onCheckTodos} 
                                    />
                                </th>
                            )}
                            <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400 cursor-pointer hover:bg-[#004d00] print:hover:bg-transparent">
                                Apellidos
                            </th>
                            <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400">Nombre</th>
                            <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400">Puestos</th>
                            <th className="px-4 py-2 border-r border-[#004d00] print:border-gray-400">Usuario</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                        {loading ? (
                            <tr><td colSpan={colSpanDinamico} className="px-4 py-8 text-center text-gray-500">Cargando datos...</td></tr>
                        ) : personasFiltradas.length === 0 ? (
                            <tr><td colSpan={colSpanDinamico} className="px-4 py-8 text-center text-gray-500">No hay registros que coincidan con los filtros.</td></tr>
                        ) : (
                            personasFiltradas.map((persona: any) => (
                                // 👇 Opacidad condicional
                                <tr
                                    key={persona.id}
                                    className={`hover:bg-gray-100 transition-colors print:break-inside-avoid ${persona.estado === 'INACTIVO' ? 'opacity-60 bg-gray-50 print:opacity-100' : ''}`}
                                >
                                    {puedeEliminar && (
                                        <td className="px-4 py-2 text-center align-middle border-r border-gray-200 print:hidden">
                                            <input 
                                                type="checkbox" 
                                                className="rounded" 
                                                checked={seleccionados.includes(persona.id)} 
                                                onChange={() => onCheckIndividual(persona.id)} 
                                            />
                                        </td>
                                    )}

                                    <td className="px-4 py-2 border-r border-gray-200 print:border-gray-400 cursor-pointer" onClick={() => navigate(`/rrhh/personas/${encodeId(persona.id)}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="print:hidden">
                                                {persona.foto_ruta ? (
                                                    <img
                                                        src={buildFileUrl(persona.foto_ruta) ?? undefined} alt="Foto perfil"
                                                        className="w-8 h-10 object-cover"
                                                    />) : (
                                                    <div className="w-8 h-10 flex items-center justify-center bg-gray-200 border border-gray-300 text-gray-400">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-800 print:text-black">{persona.apellidos}</span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-2 text-gray-700 print:text-black align-middle border-r border-gray-200 print:border-gray-400">
                                        {persona.nombre}
                                    </td>

                                    <td className="px-4 py-2 text-gray-700 print:text-black align-middle border-r border-gray-200 print:border-gray-400 whitespace-normal min-w-[200px]">
                                        {persona.puestos && persona.puestos.length > 0 ? (
                                            <div className="flex flex-col gap-0.5">
                                                {persona.puestos.map((p: any, i: number) => (
                                                    <span key={i}>• {p.puesto?.nombre} <span className="text-gray-500 print:text-gray-700">({p.departamento?.nombre})</span></span>
                                                ))}
                                            </div>
                                        ) : '-'}
                                    </td>

                                    <td className="px-4 py-2 align-middle border-r border-gray-200 print:border-gray-400">
                                        <span className={persona.usuario?.nombre_usuario === 'Usuario externo' ? "text-green-600 print:text-black" : "text-gray-800 print:text-black"}>
                                            {persona.usuario?.nombre_usuario || '-'}
                                        </span>
                                    </td>

                                    {/* 👇 Insignias con 3 estados dinámicos */}
                                    <td className="px-4 py-2 align-middle text-center">
                                        <span className={`px-2 py-0.5 rounded font-bold border border-transparent print:border-black print:text-black ${
                                            persona.estado === 'ACTIVO' ? 'text-[#006400]' : 
                                            persona.estado === 'SUSPENDIDO' ? 'text-amber-600' : 
                                            'text-red-600'
                                        }`}>
                                            {persona.estado}
                                        </span>
                                    </td>
                                </tr>
                                )
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TablaPersonas;