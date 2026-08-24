import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, FolderPlus, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import api from '../../../core/api/axios';
import { encodeId, decodeId } from '../../../shared/utils/ids';

const SidebarGestorDocumental = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});

    const fetchDatos = useCallback(async () => {
        try {
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

    // Abrir automáticamente la carpeta actual en el sidebar
    useEffect(() => {
        if (carpetas.length === 0) return;
        const match = location.pathname.match(/\/carpeta\/([^/]+)/);
        if (!match) return;

        const activeFolderId = Number(decodeId(match[1]));
        const getAncestors = (folderId: number) => {
            const ancestors: number[] = [];
            let current = carpetas.find(c => c.id === folderId);
            while (current && current.carpeta_padre_id) {
                ancestors.push(current.carpeta_padre_id);
                current = carpetas.find(c => c.id === current.carpeta_padre_id);
            }
            return ancestors;
        };

        const ancestorsToOpen = getAncestors(activeFolderId);
        setExpandedFolders(prev => {
            const newState = { ...prev, [activeFolderId]: true };
            let hasChanges = false;
            ancestorsToOpen.forEach(id => {
                if (!newState[id]) {
                    newState[id] = true;
                    hasChanges = true;
                }
            });
            return hasChanges ? newState : prev;
        });
    }, [location.pathname, carpetas]);

    const obtenerTodosLosDescendientes = useCallback((parentId: number): number[] => {
        let hijos = carpetas.filter(c => c.carpeta_padre_id === parentId);
        let descendientes = hijos.map(h => h.id);
        hijos.forEach(h => {
            descendientes = [...descendientes, ...obtenerTodosLosDescendientes(h.id)];
        });
        return descendientes;
    }, [carpetas]);

    const RenderTree = ({ parentId, depth = 0 }: { parentId: number | null, depth?: number }) => {
        const children = parentId === null
            ? carpetas.filter(c => c.tipo === 'LIBRERIA')
            : carpetas.filter(c => c.carpeta_padre_id === parentId);

        if (children.length === 0) return null;

        return (
            <div className={`flex flex-col ${depth > 0 ? 'ml-4 pl-2 border-l border-gray-200' : ''}`}>
                {children.map(carpeta => {
                    const isActive = location.pathname.includes(`/gestordocumental/carpeta/${encodeId(carpeta.id)}`);
                    const isExpanded = expandedFolders[carpeta.id];
                    const hasChildren = carpetas.some(c => c.carpeta_padre_id === carpeta.id);

                    return (
                        <div key={carpeta.id} className="flex flex-col mt-1">
                            <div
                                onClick={() => {
                                    navigate(`/gestordocumental/carpeta/${encodeId(carpeta.id)}`);
                                    if (hasChildren) {
                                        setExpandedFolders(prev => {
                                            const isOpening = !prev[carpeta.id];
                                            const newState = { ...prev, [carpeta.id]: isOpening };
                                            if (carpeta.tipo === 'AREA' && isOpening) {
                                                const descendientes = obtenerTodosLosDescendientes(carpeta.id);
                                                descendientes.forEach(id => { newState[id] = true; });
                                            } else if (carpeta.tipo === 'AREA' && !isOpening) {
                                                const descendientes = obtenerTodosLosDescendientes(carpeta.id);
                                                descendientes.forEach(id => { newState[id] = false; });
                                            }
                                            return newState;
                                        });
                                    }
                                }}
                                className={`flex items-center gap-1.5 font-medium py-1.5 px-2 rounded cursor-pointer transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {hasChildren ? (
                                    <div className="p-0.5 rounded text-gray-400">
                                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </div>
                                ) : (
                                    <div className="w-4 h-4 shrink-0" />
                                )}

                                <Folder className={`w-4 h-4 shrink-0 fill-current ${isActive ? 'text-blue-600' : 'text-gray-800'}`} />
                                <span className="truncate text-xs">{carpeta.nombre}</span>
                            </div>

                            {isExpanded && <RenderTree parentId={carpeta.id} depth={depth + 1} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <aside
            className={`${sidebarOpen ? 'w-72 border-r' : 'w-12 border-r'
                } transition-all duration-300 ease-in-out bg-white shrink-0 overflow-hidden border-gray-200 relative shadow-sm z-10`}
        >
            <div className="w-72 h-full absolute top-0 left-0 flex flex-col">
                {/* Cabecera del Sidebar */}
                <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 h-12">
                    <span
                        onClick={() => navigate('/gestordocumental')}
                        className="font-bold text-xs text-gray-500 uppercase tracking-wider mr-2 cursor-pointer hover:text-blue-600 transition-colors"
                        title="Ir al inicio del Gestor Documental"
                    >
                        Menú Documental
                    </span>
                </div>

                <div className={`p-3 flex flex-col gap-3 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate('/gestordocumental/configuracion')}
                            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
                            title="Administración"
                        >
                            <Settings className="w-4 h-4 text-gray-600" />
                        </button>                        <button onClick={() => navigate('/gestordocumental/nueva-carpeta')} className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"><FolderPlus className="w-4 h-4 text-gray-600" /></button>
                    </div>

                    <input
                        type="text" placeholder="Filtrar..."
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                    />

                    <div className="flex flex-col gap-1 mt-2 overflow-y-auto pb-20">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estructura Documental</h4>
                        {loading ? (
                            <span className="text-xs text-gray-400 italic">Cargando estructura...</span>
                        ) : carpetas.length === 0 ? (
                            <div className="text-xs text-gray-400 italic py-1">No hay carpetas registradas.</div>
                        ) : (
                            <RenderTree parentId={null} />
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SidebarGestorDocumental;