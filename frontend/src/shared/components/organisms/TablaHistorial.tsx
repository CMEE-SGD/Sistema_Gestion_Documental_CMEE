import { ShieldAlert } from 'lucide-react';

interface LogAuditoria {
    id: number;
    modulo: string;
    accion: string;
    descripcion: string;
    fecha_hora: string;
    usuario?: { nombre_usuario: string };
}

interface TablaHistorialProps {
    logs: LogAuditoria[];
    loading: boolean;
    esGlobal?: boolean; // Si es false, ocultamos la columna 'Módulo' y 'Descripción'
}

export const TablaHistorial = ({ logs, loading, esGlobal = false }: TablaHistorialProps) => {
    const formatearFecha = (fechaIso: string) => {
        return new Date(fechaIso).toLocaleString('es-EC', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="overflow-x-auto border border-gray-300 rounded shadow-sm bg-white">
            <table className="w-full text-left whitespace-nowrap text-[11px]">
                <thead className="bg-[#006400] text-white font-bold">
                    <tr>
                        <th className="px-4 py-2 border-r border-[#004d00]">Fecha / Hora</th>
                        <th className="px-4 py-2 border-r border-[#004d00]">Usuario</th>
                        {esGlobal && <th className="px-4 py-2 border-r border-[#004d00]">Módulo</th>}
                        <th className="px-4 py-2 border-r border-[#004d00]">Acción</th>
                        {esGlobal && <th className="px-4 py-2">Detalles</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={esGlobal ? 5 : 3} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan={esGlobal ? 5 : 3} className="px-4 py-8 text-center text-gray-500">No hay registros.</td></tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 border-r border-gray-200 font-medium text-gray-700">
                                    {formatearFecha(log.fecha_hora)}
                                </td>
                                <td className="px-4 py-2 border-r border-gray-200 font-bold text-gray-900">
                                    {log.usuario?.nombre_usuario || 'Sistema'}
                                </td>
                                {esGlobal && (
                                    <td className="px-4 py-2 border-r border-gray-200">
                                        <span className="bg-gray-200 px-2 py-0.5 rounded font-bold">{log.modulo}</span>
                                    </td>
                                )}
                                <td className="px-4 py-2 border-r border-gray-200 text-gray-800">
                                    {log.accion}
                                </td>
                                {esGlobal && (
                                    <td className="px-4 py-2 text-gray-600 truncate max-w-md">{log.descripcion}</td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};