import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, FolderPlus, Search, LayoutGrid, HelpCircle, Folder } from 'lucide-react';
import Navbar from '../../components/Navbar'; 
import api from '../../lib/axios';

export const GestorDocumentalPage = () => {
    const navigate = useNavigate();
    
    // Estados
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Carpeta actual en la que el usuario ha hecho clic
    const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<any>(null);
    const [ordenarPor, setOrdenarPor] = useState<'alfabetico' | 'orden'>('orden');

    // 1. Cargar las carpetas desde la base de datos al iniciar la página
    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await api.get('/carpetas');
                setCarpetas(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error al cargar la biblioteca:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    // 2. Lógica de visualización:
    // Raíces para el menú lateral (Librerías)
    const librerias = carpetas.filter(c => c.tipo === 'LIBRERIA');
    
    // Lo que se muestra en el centro: 
    // Si hay una carpeta seleccionada, mostramos sus hijas. Si no, mostramos las librerías raíz.
    const contenidoCentral = carpetaSeleccionada 
        ? carpetas.filter(c => c.carpeta_padre_id === carpetaSeleccionada.id)
        : librerias;

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-sm">
            <Navbar />

            {/* Sub-Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-[#c9a800] rounded text-white">
                        <FolderPlus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 text-base">Biblioteca de Documentos</span>
                </div>
            </div>

            <div className="flex flex-1 bg-white">
                
                {/* --- PANEL LATERAL IZQUIERDO --- */}
                <aside className="w-72 border-r border-gray-200 bg-white p-3 flex flex-col gap-3 shrink-0">
                    
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors" title="Configuración">
                            <Settings className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                            onClick={() => navigate('/gestordocumental/nueva-carpeta')}
                            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors" 
                            title="Nueva carpeta"
                        >
                            <FolderPlus className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors" title="Buscar">
                            <Search className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors" title="Ver esquema">
                            <LayoutGrid className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    <button className="w-full py-1.5 px-3 text-xs bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-medium transition-all shadow-sm">
                        Relaciones de documentos
                    </button>

                    <input 
                        type="text" 
                        placeholder="Filtrar..." 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                    />

                    {/* Árbol Dinámico de Librerías */}
                    <div className="flex flex-col gap-1 mt-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Librerías principales</h4>
                        
                        {loading ? (
                            <span className="text-xs text-gray-400 italic">Cargando estructura...</span>
                        ) : librerias.length === 0 ? (
                            <div className="text-xs text-gray-400 italic py-1">
                                No hay carpetas registradas.
                            </div>
                        ) : (
                            librerias.map(lib => (
                                <div 
                                    key={lib.id}
                                    onClick={() => setCarpetaSeleccionada(lib)}
                                    className={`flex items-center gap-2 font-medium py-1.5 px-2 rounded cursor-pointer transition-colors ${
                                        carpetaSeleccionada?.id === lib.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Folder className={`w-4 h-4 ${carpetaSeleccionada?.id === lib.id ? 'text-blue-600' : 'text-yellow-600'}`} />
                                    <span className="truncate">{lib.nombre}</span>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* --- VISOR CENTRAL DERECHO --- */}
                <main className="flex-1 p-6 bg-white">
                    
                    {/* Migas de pan (Breadcrumb) */}
                    <div className="mb-6 pb-2 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Folder className="w-5 h-5 text-yellow-500" />
                            {carpetaSeleccionada ? carpetaSeleccionada.nombre : 'Directorio Raíz'}
                        </h2>
                        {carpetaSeleccionada && (
                            <button 
                                onClick={() => setCarpetaSeleccionada(null)}
                                className="text-xs text-blue-600 hover:underline mt-1"
                            >
                                ← Volver a la raíz
                            </button>
                        )}
                    </div>

                    {/* Renderizado de Subcarpetas */}
                    {loading ? (
                        <div className="text-center text-gray-400 mt-10">Cargando elementos...</div>
                    ) : contenidoCentral.length === 0 && documentos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                            <HelpCircle className="w-8 h-8 text-gray-300" />
                            <p className="text-sm font-medium">Esta carpeta está vacía.</p>
                            <button 
                                onClick={() => navigate('/gestordocumental/nueva-carpeta')}
                                className="text-blue-600 hover:underline text-xs mt-2"
                            >
                                + Crear nueva carpeta aquí
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Pintamos las carpetas hijas */}
                            {contenidoCentral.map(carpeta => (
                                <div 
                                    key={carpeta.id}
                                    onClick={() => setCarpetaSeleccionada(carpeta)}
                                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer hover:border-blue-300 transition-all bg-gray-50 group"
                                >
                                    <Folder className="w-8 h-8 text-yellow-500 flex-shrink-0 group-hover:text-yellow-600" />
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-gray-700 truncate" title={carpeta.nombre}>{carpeta.nombre}</p>
                                        <p className="text-xs text-gray-500 truncate">{carpeta.tipo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
};