import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import api from '../../../lib/axios';

export const CircuitosConfigPage = () => {
    const navigate = useNavigate();
    const [circuitos, setCircuitos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchCircuitos();
    }, []);

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
                <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
                    Matriz de responsables
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
                                        <button className="px-3 py-1 mr-2 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm text-gray-700">
                                            Editar
                                        </button>
                                        <button className="px-3 py-1 mr-2 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm text-gray-700">
                                            Permisos
                                        </button>
                                        <button 
                                            // 👉 Al dar clic, navegamos a la vista de fases de ESTE circuito
                                            onClick={() => navigate(`/gestordocumental/configuracion/circuitos/${circuito.id}/fases`, { state: { nombreCircuito: circuito.nombre }})}
                                            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm text-gray-700 font-medium"
                                        >
                                            Fases
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