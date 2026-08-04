import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../../core/api/axios';

export const DetalleNcPage = () => {
    const { auditoriaId, ncId } = useParams();
    const navigate = useNavigate();
    const [nc, setNc] = useState<any>(null);

    useEffect(() => {
        api.get(`/calidad/no-conformidades/${ncId}`)
            .then(res => setNc(res.data))
            .catch(() => navigate(`/calidad/auditorias/${auditoriaId}`));
    }, [ncId]);

    if (!nc) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button onClick={() => navigate(`/calidad/auditorias/${auditoriaId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver a la auditoría
            </button>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="w-[10%] p-4 text-center align-top border-r border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Categoría</div>
                                <div className="font-bold text-base">{nc.categoria || 'NC'}</div>
                            </td>
                            <td className="w-[8%] p-4 text-center align-top border-r border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">No.</div>
                                <div className="font-bold text-base">{nc.codigo}</div>
                            </td>
                            <td className="p-4 align-top">
                                <div className="text-xs text-gray-500 mb-1">Requisito</div>
                                <div>{nc.requisito || '-'}</div>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                            <td colSpan={3} className="p-4 align-top">
                                <div className="text-xs text-gray-500 mb-1">{nc.categoria === 'COM' ? 'Comentarios:' : 'No conformidades:'}</div>
                                <div className="whitespace-pre-wrap">{nc.hallazgo}</div>
                            </td>
                        </tr>
                        {nc.evidencia && (
                            <tr>
                                <td colSpan={3} className="p-4 align-top">
                                    <div className="text-xs text-gray-500 mb-1">Evidencias:</div>
                                    <div className="whitespace-pre-wrap">{nc.evidencia}</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end">
                <button onClick={() => navigate(`/calidad/auditorias/${auditoriaId}/nc/${ncId}/plan-accion`)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
                    Crear Plan de Acción
                </button>
            </div>
        </div>
    );
};
