import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../shared/utils/ids';
import { buildFileUrl } from '../../../shared/utils/backendUrl';

export const GestorDocumentalPage = () => {
    const navigate = useNavigate();
    const { id: rawId } = useParams();
    const id = rawId ? decodeId(rawId) : undefined;
    const { alert, confirm } = useAlert();
    const { toast } = useToast();

    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [documentosSeleccionados, setDocumentosSeleccionados] = useState<number[]>([]);
    const [misPermisos, setMisPermisos] = useState<{ permiso_docs: boolean; permiso_carpetas: boolean; nivel_permiso: number }>({ permiso_docs: true, permiso_carpetas: true, nivel_permiso: 5 });

    const [ordenarPor, setOrdenarPor] = useState<'alfabetico' | 'orden'>('alfabetico');
    const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});
    const carpetaSeleccionada = id ? carpetas.find(c => c.id.toString() === id) : null;
    const esSubcarpeta = carpetaSeleccionada?.tipo === 'SUBCARPETA';
    const puedeMover = misPermisos.nivel_permiso >= 4;
    const puedeEliminar = misPermisos.nivel_permiso >= 5;
    const puedeImprimir = misPermisos.nivel_permiso >= 2;

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
            api.get(`/carpetas/${id}/mis-permisos`).then(res => {
                if (res.data) setMisPermisos(res.data);
            }).catch(() => {});
        } else {
            setDocumentos([]);
            setMisPermisos({ permiso_docs: true, permiso_carpetas: true, nivel_permiso: 5 });
        }
    }, [id, fetchDocumentos]);

    const toggleSeleccion = (docId: number) => {
        setDocumentosSeleccionados(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const toggleSeleccionarTodos = () => {
        if (documentosSeleccionados.length === documentos.length) {
            setDocumentosSeleccionados([]); // Desmarcar todos
        } else {
            setDocumentosSeleccionados(documentos.map(doc => doc.id)); // Marcar todos
        }
    };

    const handleEliminarDocumentos = async () => {
        if (documentosSeleccionados.length === 0) {
            await alert({ message: "Por favor, seleccione al menos un documento para eliminar." });
            return;
        }

        const confirmacion = await confirm({ message: `¿Está seguro de eliminar ${documentosSeleccionados.length} documento(s)? Esta acción no se puede deshacer.` });
        if (!confirmacion) return;

        try {
            setLoadingDocs(true);

            // Usamos Promise.all para enviar todas las peticiones DELETE a tu backend de NestJS al mismo tiempo
            await Promise.all(
                documentosSeleccionados.map(docId => api.delete(`/documentos/${docId}`))
            );

            toast({ message: 'Documentos eliminados correctamente' });
            setDocumentosSeleccionados([]);

            // Volvemos a cargar la tabla para que los documentos borrados desaparezcan
            if (id) fetchDocumentos(id);

        } catch (error) {
            console.error("Error al eliminar los documentos:", error);
            await alert({ message: "Ocurrió un error al intentar eliminar. Es posible que no tenga permisos." });
        } finally {
            setLoadingDocs(false);
        }
    };

    // 👉 5. (Opcional) Limpiar la selección si el usuario cambia de carpeta
    useEffect(() => {
        setDocumentosSeleccionados([]);
    }, [id]);

    const handleAtras = () => {
        if (!carpetaSeleccionada) return;

        let padreActual = carpetas.find(c => c.id === carpetaSeleccionada.carpeta_padre_id);

        while (padreActual && padreActual.tipo === 'SUBCARPETA') {
            padreActual = carpetas.find(c => c.id === padreActual.carpeta_padre_id);
        }

        if (padreActual) {
            navigate(`/gestordocumental/carpeta/${encodeId(padreActual.id)}`);
        } else {
            navigate('/gestordocumental');
        }
    };
    // 👉 Función para el botón Imprimir: envía los archivos seleccionados a la impresora del navegador
    const handleImprimirDocumentos = async () => {
        if (documentosSeleccionados.length === 0) {
            await alert({ message: "Por favor, seleccione al menos un documento para imprimir." });
            return;
        }

        const docsAImprimir = documentos.filter(doc => documentosSeleccionados.includes(doc.id) && doc.archivo_url);

        for (const doc of docsAImprimir) {
            try {
                const fileUrl = buildFileUrl(doc.archivo_url);
                if (!fileUrl) continue;
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = blobUrl;
                document.body.appendChild(iframe);

                iframe.onload = () => {
                    setTimeout(() => {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();
                        setTimeout(() => document.body.removeChild(iframe), 10000);
                    }, 500);
                };
            } catch (error) {
                console.error('Error al imprimir documento:', doc.id, error);
            }
        }
    };

    // 👉 Función para el botón Mover
    const handleMoverDocumentos = async () => {
        if (documentosSeleccionados.length === 0) {
            await alert({ message: "Por favor, seleccione al menos un documento para mover." });
            return;
        }

        // Extraemos los objetos completos de los documentos seleccionados
        const docsAMover = documentos.filter(doc => documentosSeleccionados.includes(doc.id));

        // Navegamos al nuevo formulario enviando los documentos en el estado
        navigate('/gestordocumental/mover-documentos', {
            state: { documentos: docsAMover }
        });
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
                                className="flex items-center gap-1 py-1 hover:bg-blue-50 cursor-pointer rounded px-2 w-max transition-colors"
                                onClick={() => navigate(`/gestordocumental/carpeta/${encodeId(carpeta.id)}`)}
                            >
                                <div style={{ paddingLeft: `${depth * 24}px` }} className="flex items-center gap-1">
                                    {hasChildren ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedFolders(prev => ({ ...prev, [carpeta.id]: !prev[carpeta.id] }));
                                            }}
                                            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700"
                                            title={isExpanded ? 'Contraer' : 'Desplegar'}
                                        >
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    ) : (
                                        <div className="w-4 h-4 shrink-0" />
                                    )}
                                    {depth > 0 && (
                                        <span className="text-gray-300 font-mono text-xs tracking-widest mr-1 select-none">
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
                            <button
                                disabled={!misPermisos.permiso_docs}
                                onClick={() => navigate('/gestordocumental/nuevo-fichero', {
                                    state: {
                                        carpetaPadreId: id,
                                        carpetaPadreNombre: carpetaSeleccionada?.nombre
                                    }
                                })}
                                className={`px-3 py-1.5 text-sm border rounded transition-colors shadow-sm ${misPermisos.permiso_docs ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'}`}
                            >
                                Nuevo fichero
                            </button>
                            <button
                                onClick={handleMoverDocumentos}
                                disabled={!puedeMover}
                                className={`px-3 py-1.5 text-sm border rounded transition-colors shadow-sm ${puedeMover ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'}`}
                            >
                                Mover {documentosSeleccionados.length > 0 && `(${documentosSeleccionados.length})`}
                            </button>                            <button
                                onClick={handleEliminarDocumentos}
                                disabled={!puedeEliminar}
                                className={`px-3 py-1.5 text-sm border rounded transition-colors shadow-sm ${puedeEliminar ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'}`}
                            >
                                Eliminar {documentosSeleccionados.length > 0 && `(${documentosSeleccionados.length})`}
                            </button>
                            <button onClick={handleImprimirDocumentos} disabled={!puedeImprimir} className={`px-3 py-1.5 text-sm border rounded transition-colors shadow-sm ${puedeImprimir ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'}`}>Imprimir</button>
                            <button
                                disabled={!misPermisos.permiso_carpetas}
                                onClick={() => navigate('/gestordocumental/nueva-carpeta', {
                                    state: {
                                        carpetaPadreId: id,
                                        carpetaPadreNombre: carpetaSeleccionada?.nombre
                                    }
                                })}
                                className={`px-3 py-1.5 text-sm border rounded transition-colors shadow-sm ${misPermisos.permiso_carpetas ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'}`}
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
                                            <th className="px-2 py-2 w-8 text-center border-r border-[#004d00]">
                                                {/* Checkbox "Seleccionar Todos" */}
                                                <input
                                                    type="checkbox"
                                                    className="cursor-pointer"
                                                    checked={documentos.length > 0 && documentosSeleccionados.length === documentos.length}
                                                    onChange={toggleSeleccionarTodos}
                                                />
                                            </th>
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
                                                {/* EL TD ES OBLIGATORIO PARA EVITAR EL ERROR DE DOMNesting */}
                                                <td colSpan={7} className="text-center py-6 text-gray-400 italic bg-gray-50">
                                                    No hay documentos en esta carpeta.
                                                </td>
                                            </tr>
                                        ) : (
                                            documentos.map((doc, idx) => (
                                                <tr key={doc.id || idx} className="border-b border-gray-200 even:bg-gray-100 odd:bg-white hover:bg-gray-200 transition-colors">
                                                    <td className="px-2 py-1.5 text-center align-middle">
                                                        {/* Checkbox Individual */}
                                                        <input
                                                            type="checkbox"
                                                            className="cursor-pointer"
                                                            checked={documentosSeleccionados.includes(doc.id)}
                                                            onChange={() => toggleSeleccion(doc.id)}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1.5 text-center align-middle">
                                                        <div className="bg-gray-500 text-white text-[8px] font-bold px-1 rounded flex items-center justify-center mx-auto w-max">
                                                            PDF
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-1.5 uppercase cursor-pointer text-blue-600 hover:underline font-semibold"
                                                        onClick={() => navigate(`/gestordocumental/documento/${encodeId(doc.id)}`)}>
                                                        {doc.nombre}
                                                    </td>
                                                    <td className="px-3 py-1.5">
                                                        {doc.fase || ''}
                                                    </td>
                                                    <td className="px-3 py-1.5 font-medium text-gray-700">
                                                        {doc.propietario || 'Desconocido'}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-center">
                                                        {doc.version || '1'}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-center">
                                                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('es-ES') : ''}
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

                    <div className="overflow-auto bg-white rounded-lg pb-10 max-h-[calc(100vh-190px)]">
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