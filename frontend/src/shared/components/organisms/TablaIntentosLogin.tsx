import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

interface IntentoLogin {
    id: number;
    nombre_usuario: string;
    exito: boolean;
    motivo_fallo?: string | null;
    ip?: string | null;
    fecha_hora: string;
}

interface PaginacionServidor {
    paginaActual: number;
    totalPaginas: number;
    total: number;
    onCambiarPagina: (pagina: number) => void;
}

interface TablaIntentosLoginProps {
    intentos: IntentoLogin[];
    loading: boolean;
    paginacionServidor: PaginacionServidor;
}

const MOTIVOS_LABELS: Record<string, string> = {
    usuario_no_encontrado: 'Usuario no encontrado',
    usuario_bloqueado: 'Usuario bloqueado',
    cuenta_inactiva: 'Cuenta inactiva',
    clave_incorrecta: 'Contraseña incorrecta',
};

export const TablaIntentosLogin = ({ intentos, loading, paginacionServidor }: TablaIntentosLoginProps) => {
    const formatearFecha = (fechaIso: string) => {
        return new Date(fechaIso).toLocaleString('es-EC', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {!loading && intentos.length > 0 && (
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-[11px] text-gray-500 font-medium">
                        {paginacionServidor.total} intentos en total
                    </span>
                </div>
            )}

            <div className="overflow-x-auto border border-gray-300 rounded shadow-sm bg-white">
                <table className="w-full text-left whitespace-nowrap text-[11px]">
                    <thead className="bg-[#006400] text-white font-bold tracking-wider">
                        <tr>
                            <th className="px-4 py-2.5 border-r border-[#004d00]">Fecha / Hora</th>
                            <th className="px-4 py-2.5 border-r border-[#004d00]">Usuario intentado</th>
                            <th className="px-4 py-2.5 border-r border-[#004d00]">Resultado</th>
                            <th className="px-4 py-2.5 border-r border-[#004d00]">Motivo</th>
                            <th className="px-4 py-2.5">IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-medium">Cargando intentos de inicio de sesión...</td></tr>
                        ) : intentos.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-medium">No se encontraron registros.</td></tr>
                        ) : (
                            intentos.map((intento) => (
                                <tr key={intento.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-4 py-2.5 border-r border-gray-200 font-medium text-gray-700">
                                        {formatearFecha(intento.fecha_hora)}
                                    </td>
                                    <td className="px-4 py-2.5 border-r border-gray-200 font-bold text-gray-900">
                                        {intento.nombre_usuario}
                                    </td>
                                    <td className="px-4 py-2.5 border-r border-gray-200">
                                        {intento.exito ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-700">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Exitoso
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-700">
                                                <XCircle className="w-3.5 h-3.5" /> Fallido
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 border-r border-gray-200 text-gray-600">
                                        {intento.motivo_fallo ? (MOTIVOS_LABELS[intento.motivo_fallo] ?? intento.motivo_fallo) : '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-600">
                                        {intento.ip || '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && paginacionServidor.totalPaginas > 1 && (
                <div className="flex justify-between items-center px-2 py-1 mt-1">
                    <span className="text-[11px] text-gray-500">
                        Página <strong>{paginacionServidor.paginaActual}</strong> de <strong>{paginacionServidor.totalPaginas}</strong>
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => paginacionServidor.onCambiarPagina(Math.max(paginacionServidor.paginaActual - 1, 1))}
                            disabled={paginacionServidor.paginaActual === 1}
                            className="p-1 border border-gray-300 rounded bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => paginacionServidor.onCambiarPagina(Math.min(paginacionServidor.paginaActual + 1, paginacionServidor.totalPaginas))}
                            disabled={paginacionServidor.paginaActual === paginacionServidor.totalPaginas}
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
