import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react'; 
import api from '../../../../core/api/axios';

export const LibreriasConfigPage = () => {
    const navigate = useNavigate();
    const [librerias, setLibrerias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await api.get('/carpetas');
                const todas = Array.isArray(res.data) ? res.data : [];
                
                // Filtramos solo librerías y las ordenamos por su campo "orden"
                const filtradas = todas
                    .filter(c => c.tipo === 'LIBRERIA')
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0));
                    
                setLibrerias(filtradas);
            } catch (error) {
                console.error("Error al cargar librerías:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    return (
        <div className="bg-white">
            <h2 className="text-[18px] font-bold text-gray-800 mb-6">
                Administración de librerías
            </h2>

            <div className="flex items-center gap-2 mb-4">
                <button 
                    // 👉 Enviamos el estado forzarTipo para que el formulario se bloquee en "LIBRERIA"
                    onClick={() => navigate('/gestordocumental/nueva-carpeta', { state: { forzarTipo: 'LIBRERIA' } })}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Nueva librería
                </button>
                <button 
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Copiar librería
                </button>
            </div>
            
            {loading ? (
                <div className="text-gray-500 p-4">Cargando librerías...</div>
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
                            {librerias.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500 italic border-b-[4px] border-[#006400]">
                                        No hay librerías.
                                    </td>
                                </tr>
                            ) : (
                                librerias.map((lib, idx) => (
                                    <tr 
                                        key={lib.id} 
                                        // Intercalamos colores y agregamos la línea gruesa verde al final simulando tu imagen
                                        className={`border-b border-gray-200 transition-colors ${idx === librerias.length - 1 ? 'border-b-[4px] border-b-[#006400]' : ''} even:bg-gray-100 odd:bg-white hover:bg-gray-200`}
                                    >
                                        <td className="px-3 py-1.5 flex items-center gap-2">
                                            <Book className="w-3.5 h-3.5 text-gray-800 fill-current" />
                                            {lib.nombre}
                                        </td>
                                        <td className="px-3 py-1.5 text-center">{lib.codigo || '-'}</td>
                                        <td className="px-3 py-1.5 text-center">{lib.orden || 10}</td>
                                        <td className="px-3 py-1.5 text-center">{lib.activo ? 'Activo' : 'Inactivo'}</td>
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