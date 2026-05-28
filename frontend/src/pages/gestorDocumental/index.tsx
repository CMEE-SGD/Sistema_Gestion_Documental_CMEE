import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, Folder, FileSignature } from 'lucide-react';
import api from '../../lib/axios';

export const GestorDocumentalPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [documentos, setDocumentos] = useState<any[]>([]); // Para el futuro, cuando agregues archivos
    const [loading, setLoading] = useState(true);

    // Controles de la vista de árbol
    const [ordenarPor, setOrdenarPor] = useState<'alfabetico' | 'orden'>('orden');
    const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});

    const fetchDatos = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/carpetas');
            setCarpetas(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error al cargar la biblioteca:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDatos();
        window.addEventListener('refreshCarpetas', fetchDatos);
        return () => window.removeEventListener('refreshCarpetas', fetchDatos);
    }, [fetchDatos]);

    // Expandir automáticamente la carpeta de la URL (opcional)
    useEffect(() => {
        if (id) {
            setExpandedFolders(prev => ({ ...prev, [parseInt(id)]: true }));
        }
    }, [id]);

    const carpetaSeleccionada = id ? carpetas.find(c => c.id.toString() === id) : null;

    const handleAtras = () => {
        if (!carpetaSeleccionada) return;
        if (carpetaSeleccionada.carpeta_padre_id) {
            navigate(`/gestordocumental/carpeta/${carpetaSeleccionada.carpeta_padre_id}`);
        } else {
            navigate('/gestordocumental');
        }
    };

    // Función para ordenar las carpetas
    const sortItems = (items: any[]) => {
        return [...items].sort((a, b) => {
            if (ordenarPor === 'alfabetico') {
                return a.nombre.localeCompare(b.nombre);
            }
            return (a.orden || 0) - (b.orden || 0);
        });
    };

    // --- RENDERIZADO RECURSIVO DEL ÁRBOL (Estilo Imagen) ---
    const RenderTreeView = ({ parentId, depth = 0 }: { parentId: number | null, depth?: number }) => {
        // Filtrar hijas o raíces
        const rawChildren = parentId === null
            ? carpetas.filter(c => c.tipo === 'LIBRERIA')
            : carpetas.filter(c => c.carpeta_padre_id === parentId);

        const children = sortItems(rawChildren);

        if (children.length === 0) return null;

        return (
            <div className="flex flex-col">
                {children.map(carpeta => {
                    const isExpanded = expandedFolders[carpeta.id];
                    // Validar si tiene subcarpetas para permitir expandir
                    const hasChildren = carpetas.some(c => c.carpeta_padre_id === carpeta.id);

                    return (
                        <div key={carpeta.id} className="flex flex-col">
                            <div
                                className="flex items-center gap-2 py-1 hover:bg-blue-50 cursor-pointer rounded px-2 w-max transition-colors"
                                onClick={() => {
                                    // Al hacer clic, navegamos y expandimos
                                    navigate(`/gestordocumental/carpeta/${carpeta.id}`);
                                    if (hasChildren) {
                                        setExpandedFolders(prev => ({ ...prev, [carpeta.id]: !prev[carpeta.id] }));
                                    }
                                }}
                            >
                                {/* Espaciado e Identador visual "L..." */}
                                <div style={{ paddingLeft: `${depth * 24}px` }} className="flex items-center">
                                    {depth > 0 && (
                                        <span className="text-gray-300 font-mono text-xs tracking-widest mr-2 select-none">
                                            L...
                                        </span>
                                    )}
                                    {/* Carpeta negra estilo sistema clásico */}
                                    <Folder className="w-4 h-4 text-gray-800 fill-current shrink-0" />
                                </div>

                                {/* Nombre de la carpeta */}
                                <span className={`text-sm text-gray-900 ${depth === 0 ? 'uppercase font-bold' : 'font-semibold'}`}>
                                    {carpeta.nombre}
                                </span>
                            </div>

                            {/* Dibujar hijas si está expandida o si es la raíz (opcional) */}
                            {isExpanded && <RenderTreeView parentId={carpeta.id} depth={depth + 1} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full h-full bg-white p-2">

            {/* Controles de Ordenamiento */}
            <div className="flex items-center gap-4 mb-6 px-2">
                <span className="font-bold text-sm text-gray-900">Ordenar por:</span>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                        type="radio"
                        name="ordenarPor"
                        value="alfabetico"
                        checked={ordenarPor === 'alfabetico'}
                        onChange={() => setOrdenarPor('alfabetico')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    Nombre alfabéticamente
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                        type="radio"
                        name="ordenarPor"
                        value="orden"
                        checked={ordenarPor === 'orden'}
                        onChange={() => setOrdenarPor('orden')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    Orden
                </label>
            </div>

            {/* Árbol Principal */}
            <div className="overflow-auto bg-white rounded-lg pb-10">
                {loading ? (
                    <div className="flex justify-center text-gray-400 p-10">Cargando árbol documental...</div>
                ) : carpetas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-gray-200 rounded-xl p-10">
                        <HelpCircle className="w-10 h-10 text-gray-300" />
                        <p className="text-sm font-medium">La biblioteca está vacía.</p>
                    </div>
                ) : (
                    // Si estamos en una carpeta específica, podemos optar por mostrar solo sus hijas o todo el árbol.
                    // Según la imagen, se muestra todo el árbol desde las raíces.
                    <RenderTreeView parentId={null} />
                )}
            </div>
        </div>
    );
};