import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import api from '../../../../core/api/axios';
import { encodeId } from '../../../../shared/utils/ids';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';

export const CircuitosConfigPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const [circuitos, setCircuitos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCircuitos = async () => {
        try {
            const res = await api.get('/circuitos');
            setCircuitos(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error al cargar circuitos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircuitos();
    }, []);

    const handleEliminar = async (circuito: any) => {
        const confirmacion = await confirm({
            title: 'Eliminar circuito',
            message: `¿Está seguro de eliminar el circuito "${circuito.nombre}"? Se eliminarán también todas sus fases. Esta acción no se puede deshacer.`,
        });
        if (!confirmacion) return;
        try {
            await api.delete(`/circuitos/${circuito.id}`);
            setCircuitos(prev => prev.filter(c => c.id !== circuito.id));
        } catch (error: any) {
            console.error("Error al eliminar circuito:", error);
            await alert({ message: error?.response?.data?.message || 'Ocurrió un error al eliminar el circuito.' });
        }
    };

    return (
        <div className="bg-white">
            <h2 className="text-[18px] font-bold text-gray-800 mb-6">
                Administración de circuitos
            </h2>

            <div className="flex items-center gap-2 mb-4">
                <button 
                    onClick={() => navigate('/gestordocumental/configuracion/circuitos/nuevo')}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Nuevo circuito
                </button>
            </div>
            
            {loading ? (
                <div className="text-gray-500 p-4">Cargando circuitos...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-800 border-collapse">
                        <thead className="bg-[#006400] text-white font-bold">
                            <tr>
                                <th className="px-3 py-2 border-r border-[#004d00]">Nombre</th>
                                <th className="px-3 py-2 w-64 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {circuitos.map((circuito, idx) => (
                                <tr key={circuito.id} className={`border-b border-gray-200 transition-colors even:bg-gray-100 odd:bg-white hover:bg-gray-200`}>
                                    <td className="px-3 py-2 flex items-center gap-2 font-bold text-gray-700">
                                        <RefreshCcw className="w-4 h-4 text-gray-800" />
                                        {circuito.nombre}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={() => navigate('/gestordocumental/configuracion/circuitos/nuevo', { state: { circuitoId: circuito.id, nombreActual: circuito.nombre, activoActual: circuito.activo } })}
                                            className="px-3 py-1 mr-2 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm text-gray-700"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            // 👉 Al dar clic, navegamos a la vista de fases de ESTE circuito
                                            onClick={() => navigate(`/gestordocumental/configuracion/circuitos/${encodeId(circuito.id)}/fases`, { state: { nombreCircuito: circuito.nombre }})}
                                            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm text-gray-700 font-medium"
                                        >
                                            Fases
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(circuito)}
                                            className="px-3 py-1 ml-2 bg-red-600 text-white border border-red-600 rounded hover:bg-red-700 shadow-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};