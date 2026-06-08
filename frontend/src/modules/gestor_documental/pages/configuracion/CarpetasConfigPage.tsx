import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react'; 
import api from '../../../../core/api/axios';

export const CarpetasConfigPage = () => {
    const navigate = useNavigate();
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para los filtros en cascada
    const [libreriaId, setLibreriaId] = useState('');
    const [areaId, setAreaId] = useState('');

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await api.get('/carpetas');
                const data = Array.isArray(res.data) ? res.data : [];
                setCarpetas(data);

                // 👉 AUTO-SELECCIÓN: Elegimos la primera librería y su primera área
                const libreriasDisp = data.filter(c => c.tipo === 'LIBRERIA').sort((a, b) => (a.orden || 0) - (b.orden || 0));
                
                if (libreriasDisp.length > 0) {
                    const primeraLibId = libreriasDisp[0].id;
                    setLibreriaId(primeraLibId.toString());
                    
                    const areasDisp = data.filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === primeraLibId).sort((a, b) => (a.orden || 0) - (b.orden || 0));
                    if (areasDisp.length > 0) {
                        setAreaId(areasDisp[0].id.toString());
                    }
                }
            } catch (error) {
                console.error("Error al cargar carpetas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    // Manejo de cambio de Librería (resetea y auto-selecciona la primera área de esa librería)
    const handleLibreriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLibId = e.target.value;
        setLibreriaId(newLibId);
        
        const areasDeEstaLib = carpetas.filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === Number(newLibId)).sort((a, b) => (a.orden || 0) - (b.orden || 0));
        setAreaId(areasDeEstaLib.length > 0 ? areasDeEstaLib[0].id.toString() : '');
    };

    // Filtros visuales
    const librerias = carpetas.filter(c => c.tipo === 'LIBRERIA').sort((a, b) => (a.orden || 0) - (b.orden || 0));
    const areas = carpetas.filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === Number(libreriaId)).sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Nombres para el título dinámico
    const libSeleccionada = librerias.find(l => l.id.toString() === libreriaId);
    const areaSeleccionada = areas.find(a => a.id.toString() === areaId);

    // 👉 MAGIA RECURSIVA: Aplana el árbol jerárquico para dibujarlo en la tabla
    const obtenerSubcarpetasAnidadas = (parentId: number, depth: number = 0): any[] => {
        const hijos = carpetas
            .filter(c => c.carpeta_padre_id === parentId)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0)); // Ordenamos los hijos
        
        let resultado: any[] = [];
        hijos.forEach(hijo => {
            resultado.push({ ...hijo, depth }); // Guardamos el nivel de profundidad
            resultado = resultado.concat(obtenerSubcarpetasAnidadas(hijo.id, depth + 1)); // Buscamos a los nietos
        });
        return resultado;
    };

    // Generamos la lista final que se pintará en la tabla
    const estructuraPlana = areaId ? obtenerSubcarpetasAnidadas(Number(areaId)) : [];

    return (
        <div className="bg-white">
            {/* Título dinámico basado en la imagen */}
            <h2 className="text-[16px] font-bold text-gray-800 mb-6">
                Administración de carpetas de {areaSeleccionada?.nombre || '...'} de {libSeleccionada?.nombre || '...'}
            </h2>

            {/* Controles Superiores */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <select 
                    value={libreriaId} 
                    onChange={handleLibreriaChange}
                    className="border border-gray-300 rounded px-3 py-1.5 min-w-[250px] outline-none focus:border-blue-500 text-sm"
                >
                    {librerias.length === 0 && <option value="">-- No hay librerías --</option>}
                    {librerias.map(lib => <option key={lib.id} value={lib.id}>{lib.nombre}</option>)}
                </select>

                <select 
                    value={areaId} 
                    onChange={(e) => setAreaId(e.target.value)}
                    disabled={!libreriaId}
                    className="border border-gray-300 rounded px-3 py-1.5 min-w-[250px] outline-none focus:border-blue-500 text-sm disabled:bg-gray-100"
                >
                    {areas.length === 0 && <option value="">-- No hay áreas --</option>}
                    {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>

                <button 
                    disabled={!areaId}
                    // Enviamos el ID del Área para que la nueva carpeta sea de primer nivel
                    onClick={() => navigate('/gestordocumental/nueva-carpeta', { 
                        state: { carpetaPadreId: areaId, carpetaPadreNombre: areaSeleccionada?.nombre } 
                    })}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                >
                    Carpeta nueva
                </button>
                <button 
                    disabled={!areaId}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                >
                    Copiar carpeta
                </button>
            </div>
            
            {loading ? (
                <div className="text-gray-500 p-4">Cargando estructura de carpetas...</div>
            ) : !areaId ? (
                <div className="text-center py-10 text-gray-500 italic border-2 border-dashed border-gray-200 rounded-lg">
                    Seleccione una Librería y un Área para ver sus carpetas.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-800 border-collapse">
                        <thead className="bg-[#006400] text-white font-bold">
                            <tr>
                                <th className="px-3 py-2 border-r border-[#004d00]">Nombre ▼</th>
                                <th className="px-3 py-2 border-r border-[#004d00] text-center w-32">Código</th>
                                <th className="px-3 py-2 border-r border-[#004d00] text-center w-32">Categoría</th>
                                <th className="px-3 py-2 border-r border-[#004d00] text-center w-24">Estado</th>
                                <th className="px-3 py-2 text-center w-32"></th> {/* Columna para el botón */}
                            </tr>
                        </thead>
                        <tbody>
                            {estructuraPlana.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500 italic border-b-[4px] border-[#006400]">
                                        Esta área está vacía.
                                    </td>
                                </tr>
                            ) : (
                                estructuraPlana.map((carpeta, idx) => (
                                    <tr 
                                        key={carpeta.id} 
                                        className={`border-b border-gray-200 transition-colors ${idx === estructuraPlana.length - 1 ? 'border-b-[4px] border-b-[#006400]' : ''} even:bg-gray-100 odd:bg-white hover:bg-gray-200`}
                                    >
                                        <td className="px-3 py-1.5">
                                            {/* Efecto escalonado dependiendo del nivel (depth) */}
                                            <div style={{ marginLeft: `${carpeta.depth * 20}px` }} className="flex items-center gap-2">
                                                {carpeta.depth > 0 && <span className="text-gray-400 tracking-tighter">└─</span>}
                                                <Folder className="w-3.5 h-3.5 text-gray-800 fill-current shrink-0" />
                                                <span className="font-medium">{carpeta.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 text-center">{carpeta.codigo || '-'}</td>
                                        <td className="px-3 py-1.5 text-center">Sin categoría</td>
                                        <td className="px-3 py-1.5 text-center">{carpeta.activo ? 'Activa' : 'Inactiva'}</td>
                                        <td className="px-3 py-1.5 text-center">
                                            {/* Botón en cada fila para crear subcarpetas anidadas */}
                                            <button 
                                                onClick={() => navigate('/gestordocumental/nueva-carpeta', { 
                                                    state: { carpetaPadreId: carpeta.id, carpetaPadreNombre: carpeta.nombre } 
                                                })}
                                                className="px-2 py-1 text-[11px] text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                                            >
                                                Nueva subcarpeta
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