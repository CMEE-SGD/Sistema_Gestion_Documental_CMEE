import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderTree } from 'lucide-react'; 
import api from '../../../../core/api/axios';

export const AreasConfigPage = () => {
    const navigate = useNavigate();
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para saber qué librería seleccionó el usuario
    const [libreriaId, setLibreriaId] = useState('');

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await api.get('/carpetas');
                const data = Array.isArray(res.data) ? res.data : [];
                setCarpetas(data);

                // 👉 AUTO-SELECCIÓN DE LA PRIMERA LIBRERÍA
                const libreriasDisponibles = data
                    .filter(c => c.tipo === 'LIBRERIA')
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

                if (libreriasDisponibles.length > 0) {
                    setLibreriaId(libreriasDisponibles[0].id.toString());
                }

            } catch (error) {
                console.error("Error al cargar áreas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    // Separamos las librerías (para el select) y las áreas (para la tabla)
    const librerias = carpetas
        .filter(c => c.tipo === 'LIBRERIA')
        .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    const areasFiltradas = carpetas
        .filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === Number(libreriaId))
        .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    return (
        <div className="bg-white">
            <h2 className="text-[18px] font-bold text-gray-800 mb-6">
                Administración de áreas
            </h2>

            {/* 👉 FILTRO: Selector de Librería */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <label className="font-bold text-gray-700 text-sm">Seleccione una Librería:</label>
                <select 
                    value={libreriaId} 
                    onChange={(e) => setLibreriaId(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 min-w-[300px] outline-none focus:border-blue-500 text-sm"
                >
                    {librerias.length === 0 && <option value="">-- No hay librerías --</option>}
                    {librerias.map(lib => (
                        <option key={lib.id} value={lib.id}>{lib.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <button 
                    disabled={!libreriaId}
                    onClick={() => navigate('/gestordocumental/nueva-carpeta', { 
                        state: { 
                            forzarTipo: 'AREA', 
                            libreriaPreseleccionada: libreriaId 
                        } 
                    })}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Nueva área
                </button>
            </div>
            
            {loading ? (
                <div className="text-gray-500 p-4">Cargando áreas...</div>
            ) : !libreriaId ? (
                <div className="text-center py-10 text-gray-500 italic border-2 border-dashed border-gray-200 rounded-lg">
                    Por favor, seleccione una librería en el menú superior para ver sus áreas.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-800 border-collapse">
                        <thead className="bg-[#006400] text-white font-bold">
                            <tr>
                                <th className="px-3 py-2 border-r border-[#004d00]">Nombre ▼</th>
                                <th className="px-3 py-2 border-r border-[#004d00] text-center w-40">Código</th>
                                <th className="px-3 py-2 border-r border-[#004d00] text-center w-24">Orden</th>
                                <th className="px-3 py-2 text-center w-24">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500 italic border-b-[4px] border-[#006400]">
                                        No hay áreas registradas en esta librería.
                                    </td>
                                </tr>
                            ) : (
                                areasFiltradas.map((area, idx) => (
                                    <tr 
                                        key={area.id} 
                                        className={`border-b border-gray-200 transition-colors ${idx === areasFiltradas.length - 1 ? 'border-b-[4px] border-b-[#006400]' : ''} even:bg-gray-100 odd:bg-white hover:bg-gray-200`}
                                    >
                                        <td className="px-3 py-1.5 flex items-center gap-2">
                                            <FolderTree className="w-3.5 h-3.5 text-gray-800" />
                                            {area.nombre}
                                        </td>
                                        <td className="px-3 py-1.5 text-center">{area.codigo || '-'}</td>
                                        <td className="px-3 py-1.5 text-center">{area.orden || 10}</td>
                                        <td className="px-3 py-1.5 text-center">{area.activo ? 'Activo' : 'Inactivo'}</td>
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