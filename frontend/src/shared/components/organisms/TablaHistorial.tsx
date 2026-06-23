import { useState } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

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
    esGlobal?: boolean;
}

export const TablaHistorial = ({ logs, loading, esGlobal = false }: TablaHistorialProps) => {
    // Estados para paginación y filtros
    const [paginaActual, setPaginaActual] = useState(1);
    const [soloCambios, setSoloCambios] = useState(false);
    const registrosPorPagina = 15;

    // Función para formatear fechas
    const formatearFecha = (fechaIso: string) => {
        return new Date(fechaIso).toLocaleString('es-EC', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Función para asignar colores a las acciones
    const getBadgeColor = (accion: string) => {
        const texto = accion.toLowerCase();
        if (texto.includes('creación')) return 'bg-green-100 text-green-800 border-green-200';
        if (texto.includes('edición') || texto.includes('modificar')) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (texto.includes('eliminación') || texto.includes('inactivar')) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-gray-100 text-gray-600 border-gray-200'; // Para Consultas/GET
    };

    // Aplicar Filtro "Solo Cambios" (Oculta las consultas puras)
    const logsFiltrados = soloCambios 
        ? logs.filter(log => !log.accion.toLowerCase().includes('consulta'))
        : logs;

    // Lógica de Paginación
    const totalPaginas = Math.ceil(logsFiltrados.length / registrosPorPagina);
    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const logsPaginados = logsFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

    return (
        <div className="flex flex-col gap-3">
            {/* Controles superiores (Solo visibles si hay datos) */}
            {!loading && logs.length > 0 && (
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            checked={soloCambios}
                            onChange={(e) => {
                                setSoloCambios(e.target.checked);
                                setPaginaActual(1); // Reiniciar paginación al filtrar
                            }}
                        />
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                        Ocultar consultas (Ver solo modificaciones)
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium">
                        Mostrando {logsFiltrados.length} registros
                    </span>
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto border border-gray-300 rounded shadow-sm bg-white">
                <table className="w-full text-left whitespace-nowrap text-[11px]">
                    <thead className="bg-[#006400] text-white font-bold tracking-wider">
                        <tr>
                            <th className="px-4 py-2.5 border-r border-[#004d00]">Fecha / Hora</th>
                            <th className="px-4 py-2.5 border-r border-[#004d00]">Usuario</th>
                            {esGlobal && <th className="px-4 py-2.5 border-r border-[#004d00]">Módulo</th>}
                            <th className="px-4 py-2.5 border-r border-[#004d00]">Acción</th>
                            {esGlobal && <th className="px-4 py-2.5">Detalles del Endpoint</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={esGlobal ? 5 : 3} className="px-4 py-8 text-center text-gray-500 font-medium">Cargando registros de auditoría...</td></tr>
                        ) : logsPaginados.length === 0 ? (
                            <tr><td colSpan={esGlobal ? 5 : 3} className="px-4 py-8 text-center text-gray-500 font-medium">No se encontraron registros.</td></tr>
                        ) : (
                            logsPaginados.map((log) => (
                                <tr key={log.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-4 py-2.5 border-r border-gray-200 font-medium text-gray-700">
                                        {formatearFecha(log.fecha_hora)}
                                    </td>
                                    <td className="px-4 py-2.5 border-r border-gray-200 font-bold text-gray-900">
                                        {log.usuario?.nombre_usuario || 'Sistema'}
                                    </td>
                                    {esGlobal && (
                                        <td className="px-4 py-2.5 border-r border-gray-200">
                                            <span className="bg-gray-100 border border-gray-300 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                                {log.modulo}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-4 py-2.5 border-r border-gray-200">
                                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wide ${getBadgeColor(log.accion)}`}>
                                            {log.accion.toUpperCase()}
                                        </span>
                                    </td>
                                    {esGlobal && (
                                        <td className="px-4 py-2.5 text-gray-600 font-mono text-[10px] truncate max-w-md" title={log.descripcion}>
                                            {log.descripcion}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación Inferior */}
            {!loading && totalPaginas > 1 && (
                <div className="flex justify-between items-center px-2 py-1 mt-1">
                    <span className="text-[11px] text-gray-500">
                        Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
                    </span>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                            disabled={paginaActual === 1}
                            className="p-1 border border-gray-300 rounded bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas}
                            className="p-1 border border-gray-300 rounded bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};