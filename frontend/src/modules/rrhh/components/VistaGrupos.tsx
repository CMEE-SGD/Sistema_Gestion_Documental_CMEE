import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

interface VistaGruposProps {
    vistaActual: 'tabla' | 'organigrama';
    gruposFiltrados: any[];
    loading: boolean;
    verPersonal: boolean;
}

const VistaGrupos = ({ vistaActual, gruposFiltrados, loading, verPersonal }: VistaGruposProps) => {
    const navigate = useNavigate();

    if (vistaActual === 'tabla') {
        return (
            <div className="overflow-x-auto border border-gray-200 rounded shadow-sm print:shadow-none print:border-gray-400 print:w-full">
                <table className="w-full text-sm text-left print:text-black">
                    <thead className="bg-[#8eb8d5] text-white font-bold print:bg-[#8eb8d5] print:text-black">
                        <tr>
                            <th className="px-4 py-2 border-b print:border-gray-400">Organigrama</th>
                            <th className="px-4 py-2 border-b print:border-gray-400">Tipo</th>
                            <th className="px-4 py-2 text-center border-b print:border-gray-400">Estado</th>
                            <th className="px-4 py-2 text-center border-b print:border-gray-400">Nº usuarios</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                        {loading ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando estructura...</td></tr>
                        ) : gruposFiltrados.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No se encontraron grupos.</td></tr>
                        ) : (
                            gruposFiltrados.map((dep) => (
                                <tr 
                                    key={dep.id} 
                                    onClick={() => navigate(`/rrhh/grupos/${dep.id}`)}
                                    className={`hover:bg-gray-100 cursor-pointer transition-colors print:break-inside-avoid ${!dep.activo ? 'opacity-70 bg-gray-50 print:opacity-100' : ''}`}
                                >
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <span style={{ paddingLeft: `${(dep.nivel || 0) * 1.5}rem` }}></span>
                                        <Users className="w-4 h-4 text-blue-600 print:text-black" />
                                        <span className={dep.nivel === 0 ? 'font-bold' : ''}>{dep.nombre}</span>
                                    </td>
                                    <td className="px-4 py-2 text-gray-600 print:text-black">{dep.tipo || 'Departamento'}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded text-xs border ${dep.activo ? 'bg-green-100 text-green-800 border-green-200 print:border-black print:bg-white print:text-black' : 'bg-red-100 text-red-800 border-red-200 print:border-black print:bg-white print:text-black'}`}>
                                            {dep.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center print:text-black">{dep.puestos_asignados?.length || 0}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    // VISTA ORGANIGRAMA
    return (
        <div className="border border-gray-300 print:border-gray-400 bg-white shadow-sm rounded-t overflow-hidden">
            <div className="grid grid-cols-12 bg-[#006600] print:bg-gray-200 text-white print:text-black text-sm font-bold border-b border-gray-300 print:border-gray-400">
                <div className="col-span-5 px-4 py-2 border-r border-[#004d00] print:border-gray-400">Nombre</div>
                <div className="col-span-7 px-4 py-2">Personal</div>
            </div>
            <div className="flex flex-col">
                {gruposFiltrados.map((dep, index) => (
                    <div key={dep.id} className={`grid grid-cols-12 text-[12px] border-b border-gray-200 print:border-gray-400 last:border-b-0 ${index % 2 === 0 ? 'bg-orange-50/30 print:bg-transparent' : 'bg-white print:bg-transparent'}`}>
                        <div 
                            className="col-span-5 px-4 py-3 flex items-start gap-2 border-r border-gray-200 print:border-gray-400"
                            style={{ paddingLeft: `${(dep.nivel || 0) * 1.5 + 1}rem` }}
                        >
                            <Users className="w-4 h-4 text-blue-600 print:text-black mt-0.5 shrink-0" />
                            <span className={`text-gray-800 print:text-black ${dep.nivel === 0 ? 'font-bold' : ''}`}>{dep.nombre}</span>
                        </div>
                        <div className="col-span-7 px-4 py-3 bg-[#f5efe6]/40 print:bg-transparent">
                            {verPersonal && dep.puestos_asignados?.length > 0 ? (
                                <ul className="space-y-1">
                                    {dep.puestos_asignados.map((asignacion: any, i: number) => (
                                        <li key={i} className="text-gray-700 print:text-black leading-tight">
                                            <span className="font-medium">{asignacion.persona?.nombre} {asignacion.persona?.apellidos}</span> 
                                            <span className="text-gray-500 print:text-gray-600 text-xs ml-1">({asignacion.puesto?.nombre || 'Sin cargo'})</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <span className="text-gray-400 print:text-gray-500 italic text-xs">Sin personal asignado</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VistaGrupos;