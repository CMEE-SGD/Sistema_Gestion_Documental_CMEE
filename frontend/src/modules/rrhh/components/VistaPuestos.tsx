import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users } from 'lucide-react';

interface VistaPuestosProps {
    vistaActual: 'tabla' | 'esquema';
    puestosFiltrados: any[];
    loading: boolean;
}

const formatearFecha = (cadena: string) => {
    if (!cadena) return '';
    return new Date(cadena).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const VistaPuestos = ({ vistaActual, puestosFiltrados, loading }: VistaPuestosProps) => {
    const navigate = useNavigate();

    if (vistaActual === 'tabla') {
        return (
            <div className="overflow-x-auto border border-gray-200 rounded shadow-sm print:shadow-none print:border-gray-400 print:w-full">
                <table className="w-full text-sm text-left print:text-black">
                    <thead className="bg-[#8eb8d5] text-white font-bold print:bg-[#8eb8d5] print:text-black">
                        <tr>
                            <th className="px-4 py-2 border-b print:border-gray-400">Puesto</th>
                            <th className="px-4 py-2 border-b print:border-gray-400">Código</th>
                            <th className="px-4 py-2 text-center border-b print:border-gray-400">Orden</th>
                            <th className="px-4 py-2 text-center border-b print:border-gray-400">Fecha última mod.</th>
                            <th className="px-4 py-2 text-center border-b print:border-gray-400">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
                        ) : puestosFiltrados.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No se encontraron puestos.</td></tr>
                        ) : (
                            puestosFiltrados.map((puesto) => (
                                <tr 
                                    key={puesto.id} 
                                    onClick={() => navigate(`/rrhh/puestos/${puesto.id}`)}
                                    className={`hover:bg-gray-100 cursor-pointer transition-colors print:break-inside-avoid ${!puesto.activo ? 'opacity-70 bg-gray-50 print:opacity-100' : ''}`}
                                >
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-800 print:text-black" />
                                        {puesto.nombre}
                                    </td>
                                    <td className="px-4 py-2">{puesto.codigo}</td>
                                    <td className="px-4 py-2 text-center">{puesto.orden}</td>
                                    <td className="px-4 py-2 text-center">{formatearFecha(puesto.fecha_ultima_mod || puesto.updatedAt)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded text-xs border ${puesto.activo ? 'bg-green-100 text-green-800 border-green-200 print:border-black print:bg-white print:text-black' : 'bg-red-100 text-red-800 border-red-200 print:border-black print:bg-white print:text-black'}`}>
                                            {puesto.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="border border-gray-300 print:border-gray-400 bg-white shadow-sm rounded-t overflow-hidden">
            <div className="grid grid-cols-12 bg-[#006600] print:bg-gray-200 text-white print:text-black text-sm font-bold border-b border-gray-300 print:border-gray-400">
                <div className="col-span-4 px-4 py-2 border-r border-[#004d00] print:border-gray-400">Puesto</div>
                <div className="col-span-8 px-4 py-2">Personal</div>
            </div>
            <div className="flex flex-col">
                {puestosFiltrados.map((puesto, index) => (
                    <div key={puesto.id} className={`grid grid-cols-12 text-[12px] border-b border-gray-200 print:border-gray-400 last:border-b-0 ${index % 2 === 0 ? 'bg-gray-100/60 print:bg-transparent' : 'bg-white print:bg-transparent'}`}>
                        <div className="col-span-4 px-4 py-3 flex items-start gap-2 border-r border-gray-200 print:border-gray-400">
                            <Users className="w-4 h-4 text-blue-700 print:text-black shrink-0 mt-0.5" />
                            <span className="text-gray-900 print:text-black font-medium">{puesto.nombre}</span>
                        </div>
                        <div className="col-span-8 px-4 py-3 print:bg-transparent">
                            {puesto.personas_asignadas && puesto.personas_asignadas.length > 0 ? (
                                <ul className="flex flex-col gap-0.5">
                                    {puesto.personas_asignadas.map((asignacion: any, i: number) => (
                                        <li key={i} className="text-gray-800 print:text-black leading-tight">
                                            {asignacion.persona?.apellidos}, {asignacion.persona?.nombre} 
                                            <span className="text-gray-600 print:text-gray-700 ml-1">
                                                ({asignacion.persona?.codigo || ''})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-gray-400 print:text-gray-500 italic text-xs">Sin personal asignado</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VistaPuestos;