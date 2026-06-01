import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, Folder, Edit2 } from 'lucide-react';
import api from '../../lib/axios';

export const GestorDocumentalPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(false);

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

    const fetchDocumentos = useCallback(async (carpetaId: string) => {
        try {
            setLoadingDocs(true);
            const res = await api.get(`/documentos?carpeta_id=${carpetaId}`);
            setDocumentos(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error al cargar documentos:", error);
        } finally {
            setLoadingDocs(false);
        }
    }, []);

    useEffect(() => {
        fetchDatos();
        window.addEventListener('refreshCarpetas', fetchDatos);
        return () => window.removeEventListener('refreshCarpetas', fetchDatos);
    }, [fetchDatos]);

    useEffect(() => {
        if (id) {
            setExpandedFolders(prev => ({ ...prev, [parseInt(id)]: true }));
            fetchDocumentos(id);
        } else {
            setDocumentos([]);
        }
    }, [id, fetchDocumentos]);

    const carpetaSeleccionada = id ? carpetas.find(c => c.id.toString() === id) : null;
    const esSubcarpeta = carpetaSeleccionada?.tipo === 'SUBCARPETA';

    const handleAtras = () => {
        if (!carpetaSeleccionada) return;

        let padreActual = carpetas.find(c => c.id === carpetaSeleccionada.carpeta_padre_id);

        while (padreActual && padreActual.tipo === 'SUBCARPETA') {
            padreActual = carpetas.find(c => c.id === padreActual.carpeta_padre_id);
        }

        if (padreActual) {
            navigate(`/gestordocumental/carpeta/${padreActual.id}`);
        } else {
            navigate('/gestordocumental');
        }
    };

    const getBreadcrumb = () => {
        if (!id) return '';
        const path = [];
        let current = carpetas.find(c => c.id.toString() === id);
        while (current) {
            path.unshift(current.nombre);
            current = carpetas.find(c => c.id === current.carpeta_padre_id);
        }
        return `/ ${path.join(' / ')} /`;
    };

    const sortItems = (items: any[]) => {
        return [...items].sort((a, b) => {
            if (ordenarPor === 'alfabetico') {
                return a.nombre.localeCompare(b.nombre);
            }
            return (a.orden || 0) - (b.orden || 0);
        });
    };

    const obtenerTodosLosDescendientes = useCallback((parentId: number): number[] => {
        let hijos = carpetas.filter(c => c.carpeta_padre_id === parentId);
        let descendientes = hijos.map(h => h.id);
        hijos.forEach(h => {
            descendientes = [...descendientes, ...obtenerTodosLosDescendientes(h.id)];
        });
        return descendientes;
    }, [carpetas]);

    const RenderTreeView = ({ parentId, depth = 0 }: { parentId: number | null, depth?: number }) => {
        const rawChildren = parentId === null
            ? carpetas.filter(c => c.tipo === 'LIBRERIA')
            : carpetas.filter(c => c.carpeta_padre_id === parentId);

        const children = sortItems(rawChildren);
        if (children.length === 0) return null;

        return (
            <div className="flex flex-col">
                {children.map(carpeta => {
                    const isExpanded = expandedFolders[carpeta.id];
                    const hasChildren = carpetas.some(c => c.carpeta_padre_id === carpeta.id);

                    return (
                        <div key={carpeta.id} className="flex flex-col">
                            <div
                                className="flex items-center gap-2 py-1 hover:bg-blue-50 cursor-pointer rounded px-2 w-max transition-colors"
                                onClick={() => {
                                    navigate(`/gestordocumental/carpeta/${carpeta.id}`);
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
                            >
                                <div style={{ paddingLeft: `${depth * 24}px` }} className="flex items-center">
                                    {depth > 0 && (
                                        <span className="text-gray-300 font-mono text-xs tracking-widest mr-2 select-none">
                                            L...
                                        </span>
                                    )}
                                    <Folder className="w-4 h-4 text-gray-800 fill-current shrink-0" />
                                </div>
                                <span className={`text-sm text-gray-900 ${depth === 0 ? 'uppercase font-bold' : 'font-semibold'}`}>
                                    {carpeta.nombre}
                                </span>
                            </div>
                            {isExpanded && <RenderTreeView parentId={carpeta.id} depth={depth + 1} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full h-full bg-white p-2">

            {esSubcarpeta ? (
                /* --- VISTA DE TABLA DE DOCUMENTOS (Solo para subcarpetas) --- */
                <div className="flex flex-col w-full h-full">

                    {/* Cabecera dinámica movida exclusivamente aquí */}
                    <div className="mb-4 pb-4">
                        <h2 className="text-[15px] font-bold text-gray-900 mb-4">
                            Documentos de la carpeta: <span className="font-normal text-gray-700">{getBreadcrumb()}</span>
                        </h2>

                        {/* Botonera de acciones */}
                        <div className="flex flex-wrap items-center gap-1">
                            <button onClick={handleAtras} className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
                                Atrás
                            </button>
                            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Nuevo documento</button>
                            <button
                                onClick={() => navigate('/gestordocumental/nuevo-fichero', {
                                    state: {
                                        carpetaPadreId: id,
                                        carpetaPadreNombre: carpetaSeleccionada?.nombre
                                    }
                                })}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Nuevo fichero
                            </button>
                            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Nuevo enlace</button>
                            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Mover</button>
                            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Eliminar</button>
                            <button className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Imprimir</button>
                            <button
                                onClick={() => navigate('/gestordocumental/nueva-carpeta', {
                                    state: {
                                        carpetaPadreId: id,
                                        carpetaPadreNombre: carpetaSeleccionada?.nombre
                                    }
                                })}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Subcarpeta
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col overflow-x-auto">
                        {loadingDocs ? (
                            <div className="flex justify-center text-gray-400 p-10">Cargando documentos...</div>
                        ) : (
                            <>
                                <table className="w-full text-left text-xs text-gray-800 border-collapse">
                                    <thead className="bg-[#006400] text-white font-bold">
                                        <tr>
                                            <th className="px-2 py-2 w-8 text-center border-r border-[#004d00]"></th>
                                            <th className="px-2 py-2 w-8 text-center border-r border-[#004d00]"></th>
                                            <th className="px-2 py-2 w-8 text-center border-r border-[#004d00]"></th>
                                            <th className="px-3 py-2 border-r border-[#004d00]">Título ▼</th>
                                            <th className="px-3 py-2 border-r border-[#004d00]">Fase</th>
                                            <th className="px-3 py-2 border-r border-[#004d00]">Propietario</th>
                                            <th className="px-3 py-2 text-center border-r border-[#004d00]">Ver.</th>
                                            <th className="px-3 py-2 text-center">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documentos.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-6 text-gray-400 italic bg-gray-50">
                                                    No hay documentos en esta carpeta.
                                                </td>
                                            </tr>
                                        ) : (
                                            documentos.map((doc, idx) => (
                                                <tr key={doc.id || idx} className="border-b border-gray-200 even:bg-gray-100 odd:bg-white hover:bg-gray-200 transition-colors">
                                                    <td className="px-2 py-1.5 text-center align-middle"><input type="checkbox" className="cursor-pointer" /></td>
                                                    <td className="px-2 py-1.5 text-center align-middle"><Edit2 className="w-3.5 h-3.5 mx-auto text-gray-600 cursor-pointer" /></td>
                                                    <td className="px-2 py-1.5 text-center align-middle">
                                                        <div className="bg-gray-500 text-white text-[8px] font-bold px-1 rounded flex items-center justify-center mx-auto w-max">
                                                            PDF
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-1.5 uppercase">{doc.nombre}</td>
                                                    <td className="px-3 py-1.5">{doc.fase || ''}</td>
                                                    <td className="px-3 py-1.5">{doc.propietario || 'Toaquiza Bohorquez'}</td>
                                                    <td className="px-3 py-1.5 text-center">{doc.version || '1'}</td>
                                                    <td className="px-3 py-1.5 text-center">
                                                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('es-ES') : '04/02/2021'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <div className="bg-[#006400] text-white text-xs font-bold w-14 text-center py-1 mt-1 leading-tight">
                                    Total: <br /> {documentos.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* --- VISTA DE ÁRBOL (Para Raíz, Librerías y Áreas) --- */
                <>
                    {/* Controles de ordenamiento integrados limpiamente */}
                    <div className="flex items-center gap-4 mb-6 px-2">
                        <span className="font-bold text-sm text-gray-900">Ordenar por:</span>
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                                type="radio" name="ordenarPor" value="alfabetico"
                                checked={ordenarPor === 'alfabetico'} onChange={() => setOrdenarPor('alfabetico')}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            Nombre alfabéticamente
                        </label>
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                                type="radio" name="ordenarPor" value="orden"
                                checked={ordenarPor === 'orden'} onChange={() => setOrdenarPor('orden')}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            Orden
                        </label>
                    </div>

                    <div className="overflow-auto bg-white rounded-lg pb-10">
                        {loading ? (
                            <div className="flex justify-center text-gray-400 p-10">Cargando árbol documental...</div>
                        ) : carpetas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-gray-200 rounded-xl p-10">
                                <HelpCircle className="w-10 h-10 text-gray-300" />
                                <p className="text-sm font-medium">La biblioteca está vacía.</p>
                            </div>
                        ) : (
                            <RenderTreeView parentId={null} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};