import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Users } from 'lucide-react'; 
import api from '../../../../core/api/axios';
import { encodeId, decodeId } from '../../../../shared/utils/ids';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';

export const FasesConfigPage = () => {
    const { circuitoId: rawCircuitoId } = useParams();
    const circuitoId = rawCircuitoId ? decodeId(rawCircuitoId) : undefined;
    const location = useLocation();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    
    const nombreCircuito = location.state?.nombreCircuito || 'Desconocido';
    const [fases, setFases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFases = async () => {
        try {
            const res = await api.get(`/circuitos/${circuitoId}/fases`);
            setFases(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error al cargar fases:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (circuitoId) fetchFases();
    }, [circuitoId]);

    const handleEliminar = async (fase: any) => {
        const confirmacion = await confirm({
            title: 'Eliminar fase',
            message: `¿Está seguro de eliminar la fase "${fase.nombre}"? Esta acción no se puede deshacer.`,
        });
        if (!confirmacion) return;
        try {
            await api.delete(`/circuitos/${circuitoId}/fases/${fase.id}`);
            setFases(prev => prev.filter(f => f.id !== fase.id));
        } catch (error: any) {
            console.error("Error al eliminar fase:", error);
            await alert({ message: error?.response?.data?.message || 'Ocurrió un error al eliminar la fase.' });
        }
    };

    return (
        <div className="bg-white">
            <h2 className="text-[16px] font-bold text-gray-800 mb-6 flex items-center gap-2">
                Circuitos &gt; <span className="uppercase text-blue-800">{nombreCircuito}</span> &gt; Fases
            </h2>

            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
                    Cancelar
                </button>
                <button 
                    onClick={() => navigate(`/gestordocumental/configuracion/circuitos/${encodeId(circuitoId!)}/fases/nueva`, { state: { nombreCircuito }})}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Nueva fase
                </button>
            </div>
            
            {loading ? (
                <div className="text-gray-500 p-4">Cargando fases...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-800 border-collapse">
                        <thead className="bg-[#006400] text-white font-bold">
                            <tr>
                                <th className="px-3 py-2 border-r border-[#004d00]">Nombre</th>
                                {/* 👉 NUEVA COLUMNA */}
                                <th className="px-3 py-2 border-r border-[#004d00]">Asignados</th>
                                <th className="px-3 py-2 border-r border-[#004d00] text-center w-24">Orden ▼</th>
                                <th className="px-3 py-2 border-r border-[#004d00] text-center w-24">Estado</th>
                                <th className="px-3 py-2 text-right w-48">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fases.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500 italic border-b-[4px] border-[#006400]">No hay fases configuradas.</td>
                                </tr>
                            ) : (
                                fases.map((fase) => (
                                    <tr key={fase.id} className="border-b border-gray-200 even:bg-gray-100 odd:bg-white hover:bg-gray-200">
                                        <td className="px-3 py-2 flex items-center gap-2 font-bold text-gray-800 uppercase">
                                            <Settings className="w-4 h-4 text-gray-800" />
                                            {fase.nombre}
                                        </td>
                                        
                                        {/* 👉 NUEVA CELDA: Mostramos las personas asignadas */}
                                        <td className="px-3 py-2">
                                            {fase.participantes && fase.participantes.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 items-center">
                                                    <Users className="w-3.5 h-3.5 text-blue-600 mr-1" />
                                                    {fase.participantes.map((p: any) => `${p.persona?.nombre} ${p.persona?.apellidos}`).join(', ')}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Sin asignar</span>
                                            )}
                                        </td>

                                        <td className="px-3 py-2 text-center">{fase.orden}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${fase.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {fase.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button 
                                                onClick={() => navigate(`/gestordocumental/configuracion/circuitos/${encodeId(circuitoId!)}/fases/${encodeId(fase.id)}/editar`, { state: { nombreCircuito }})}
                                                className="px-3 py-1 mr-2 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm text-gray-700"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleEliminar(fase)}
                                                className="px-3 py-1 bg-red-600 text-white border border-red-600 rounded hover:bg-red-700 shadow-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};