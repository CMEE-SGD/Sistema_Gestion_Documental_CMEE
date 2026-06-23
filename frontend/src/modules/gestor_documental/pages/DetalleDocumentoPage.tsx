import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, RotateCcw, Upload } from 'lucide-react';
import api from '../../../core/api/axios';

export const DetalleDocumentoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [documento, setDocumento] = useState<any>(null);
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showVersionForm, setShowVersionForm] = useState(false);
    const [versionFile, setVersionFile] = useState<File | null>(null);
    const [versionComentario, setVersionComentario] = useState('');
    const [subiendoVersion, setSubiendoVersion] = useState(false);

    const [showWorkflowForm, setShowWorkflowForm] = useState(false);
    const [workflowFile, setWorkflowFile] = useState<File | null>(null);
    const [workflowComentario, setWorkflowComentario] = useState('');
    const [subiendoWorkflow, setSubiendoWorkflow] = useState(false);

    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectComentario, setRejectComentario] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 👉 Consultamos el documento y la lista de carpetas al mismo tiempo
                const [resDoc, resCarpetas] = await Promise.all([
                    api.get(`/documentos/${id}`),
                    api.get('/carpetas')
                ]);

                setDocumento(resDoc.data);
                setCarpetas(Array.isArray(resCarpetas.data) ? resCarpetas.data : []);
            } catch (err) {
                console.error("Error al cargar el documento:", err);
                setError("No se pudo cargar la información del documento.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // 👉 NUEVA FUNCIÓN: Escala por los padres para armar la ruta en texto
    const getBreadcrumb = (carpetaId: number) => {
        if (!carpetaId || carpetas.length === 0) return '';
        const path = [];
        let current = carpetas.find(c => c.id === carpetaId);

        while (current) {
            path.unshift(current.nombre);
            current = carpetas.find(c => c.id === current.carpeta_padre_id);
        }
        return path.join(' / ');
    };

    // 👉 NUEVA FUNCIÓN: Forzar la descarga del PDF
    const handleDescargar = async () => {
        if (!documento?.archivo_url) return;
        
        const backendUrl = 'http://localhost:3001';
        const rutaLimpia = documento.archivo_url.replace(/\\/g, '/');
        const fileUrl = `${backendUrl}/${rutaLimpia}`;

        try {
            // Descargamos los datos binarios del archivo
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Creamos un enlace invisible, le damos clic automático y lo destruimos
            const link = document.createElement('a');
            link.href = url;
            const nombreFichero = documento.archivo_url.split('/').pop() || 'documento.pdf';
            link.setAttribute('download', nombreFichero);
            
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url); // Liberamos memoria
        } catch (error) {
            console.error('Error al descargar:', error);
            alert('Hubo un problema al intentar descargar el archivo.');
        }
    };

    // 👉 NUEVA FUNCIÓN: Imprimir el PDF de forma silenciosa e integrada
    const handleImprimir = async () => {
        if (!documento?.archivo_url) return;
        
        const backendUrl = 'http://localhost:3001';
        const rutaLimpia = documento.archivo_url.replace(/\\/g, '/');
        const fileUrl = `${backendUrl}/${rutaLimpia}`;

        try {
            // Obtenemos el Blob para evitar bloqueos de seguridad del navegador
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // Creamos un iframe invisible en la página
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);

            // Cuando el iframe termine de cargar el PDF, lanzamos la ventana de impresión
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    
                    // Limpiamos el HTML después de unos segundos
                    setTimeout(() => document.body.removeChild(iframe), 10000);
                }, 500); // Pequeño retraso para asegurar que se renderizó completo
            };
        } catch (error) {
            console.error('Error al imprimir:', error);
            alert('No se pudo enviar a imprimir el archivo.');
        }
    };

    // Función para el botón Mover
    const handleMover = () => {
        if (!documento) return;
        navigate('/gestordocumental/mover-documentos', {
            state: { documentos: [documento] }
        });
    };
    // 👉 NUEVA FUNCIÓN: Abre el PDF en una nueva pestaña
    const handleAbrirFichero = () => {
        if (documento?.archivo_url) {
            // Reemplaza 'http://localhost:3001' si tu backend está en otro puerto o dominio
            const backendUrl = 'http://localhost:3001';
            const rutaLimpia = documento.archivo_url.replace(/\\/g, '/');
            window.open(`${backendUrl}/${rutaLimpia}`, '_blank', 'noopener,noreferrer');
        }
    };

    const handleNuevaVersion = async () => {
        if (!versionFile) return;
        setSubiendoVersion(true);
        try {
            const userStr = localStorage.getItem('usuario');
            let subidoPor = 'Usuario';
            if (userStr) {
                const user = JSON.parse(userStr);
                subidoPor = [user.persona?.nombre, user.persona?.apellidos].filter(Boolean).join(' ') || user.nombre_usuario || 'Usuario';
            }
            const formData = new FormData();
            formData.append('archivo', versionFile);
            formData.append('subido_por', subidoPor);
            formData.append('comentario', versionComentario);

            const res = await api.post(`/documentos/${id}/versiones`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setDocumento((prev: any) => ({
                ...prev,
                archivo_url: res.data.archivo_url,
                version: res.data.version,
                versiones: [{ ...res.data, documento: prev.nombre }, ...(prev.versiones || [])],
            }));

            setShowVersionForm(false);
            setVersionFile(null);
            setVersionComentario('');
            window.dispatchEvent(new Event('refreshDocumentos'));
        } catch (err) {
            console.error('Error subiendo nueva versión:', err);
            alert('Error al subir la nueva versión.');
        } finally {
            setSubiendoVersion(false);
        }
    };

    const handleRestaurarVersion = async (versionId: number) => {
        const ok = window.confirm('¿Restaurar esta versión? El documento apuntará al archivo de esta versión.');
        if (!ok) return;
        try {
            const res = await api.post(`/documentos/${id}/versiones/${versionId}/restaurar`);
            setDocumento((prev: any) => ({
                ...prev,
                archivo_url: res.data.archivo_url,
                version: res.data.version,
            }));
        } catch (err) {
            console.error('Error restaurando versión:', err);
            alert('Error al restaurar la versión.');
        }
    };

    const getUserName = () => {
        const userStr = localStorage.getItem('usuario');
        if (!userStr) return 'Usuario';
        try {
            const user = JSON.parse(userStr);
            return [user.persona?.nombre, user.persona?.apellidos].filter(Boolean).join(' ') || user.nombre_usuario || 'Usuario';
        } catch { return 'Usuario'; }
    };

    const handleAvanzarFase = async () => {
        if (!workflowFile) return;
        setSubiendoWorkflow(true);
        try {
            const formData = new FormData();
            formData.append('archivo', workflowFile);
            formData.append('procesado_por', getUserName());
            formData.append('comentario', workflowComentario);

            const res = await api.post(`/documentos/${id}/workflow/avanzar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setDocumento((prev: any) => ({ ...prev, workflow: res.data }));
            setShowWorkflowForm(false);
            setWorkflowFile(null);
            setWorkflowComentario('');
        } catch (err) {
            console.error('Error avanzando fase:', err);
            alert('Error al procesar la fase.');
        } finally {
            setSubiendoWorkflow(false);
        }
    };

    const handleRechazarFase = async () => {
        if (!rejectComentario.trim()) return;
        try {
            const res = await api.post(`/documentos/${id}/workflow/rechazar`, {
                procesado_por: getUserName(),
                comentario: rejectComentario.trim(),
            });
            setDocumento((prev: any) => ({ ...prev, workflow: res.data }));
            setShowRejectForm(false);
            setRejectComentario('');
        } catch (err) {
            console.error('Error rechazando fase:', err);
            alert('Error al rechazar la fase.');
        }
    };

    // 👉 NUEVA FUNCIÓN: Elimina el documento actual
    const handleEliminar = async () => {
        if (!documento) return;

        const confirmacion = window.confirm(`¿Está seguro de eliminar el documento "${documento.nombre}"? Esta acción no se puede deshacer.`);
        if (!confirmacion) return;

        try {
            await api.delete(`/documentos/${documento.id}`);

            // Avisamos a las otras vistas que recarguen y volvemos atrás
            window.dispatchEvent(new Event('refreshDocumentos'));
            navigate(-1);
        } catch (error) {
            console.error("Error al eliminar el documento:", error);
            alert("Ocurrió un error al intentar eliminar el documento.");
        }
    };

    if (loading) return <div className="p-10 text-gray-500">Cargando información...</div>;
    if (error) return <div className="p-10 text-red-500">{error}</div>;
    if (!documento) return <div className="p-10">Documento no encontrado.</div>;

    const nombreFichero = documento.archivo_url ? documento.archivo_url.split('/').pop() : 'Sin archivo físico';
    const fechaCreacion = documento.created_at ? new Date(documento.created_at).toLocaleDateString('es-ES') : '';

    return (
        <div className="flex flex-col w-full min-h-screen bg-white p-6 text-[13px] text-gray-800">

            {/* 👉 TÍTULO ACTUALIZADO CON LA RUTA AL LADO */}
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                Información del documento <span className="text-sm text-gray-500 font-normal">{getBreadcrumb(documento.carpeta_id)}/{documento.nombre}</span>


            </h2>

            {/* Botonera Superior */}
            <div className="flex flex-wrap items-center gap-1.5 mb-6">
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Editar</button>
                <button
                    onClick={() => setShowVersionForm(!showVersionForm)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Nueva versión
                </button>
                <button
                    onClick={handleEliminar}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm text-black-600 "
                >
                    Eliminar
                </button>                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Log</button>

                {/* Botón Mover conectado */}
                <button
                    onClick={handleMover}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Mover
                </button>

                <button 
                    onClick={handleDescargar}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Descargar
                </button>
                <button 
                    onClick={handleImprimir}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Imprimir
                </button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Lista distribución</button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Documentos relacionados</button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Objeto</button>
                <button onClick={() => navigate(-1)} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Cancelar</button>
                <select className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm outline-none">
                    <option>Valorar...</option>
                </select>
            </div>

            {/* Formulario Nueva Versión */}
            {showVersionForm && (
                <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-sm text-gray-800 mb-3">Subir nueva versión</h3>
                    <div className="flex flex-col gap-3">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                        />
                        <input
                            type="text"
                            placeholder="Comentario (opcional)"
                            value={versionComentario}
                            onChange={(e) => setVersionComentario(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleNuevaVersion}
                                disabled={!versionFile || subiendoVersion}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                            >
                                {subiendoVersion ? 'Subiendo...' : 'Subir versión'}
                            </button>
                            <button
                                onClick={() => { setShowVersionForm(false); setVersionFile(null); setVersionComentario(''); }}
                                className="px-4 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de Datos */}
            <div className="flex flex-col border border-gray-200">

                <div className="grid grid-cols-12 bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200">
                    <div className="col-span-5 p-2 border-r border-gray-200">Título</div>
                    <div className="col-span-2 p-2 border-r border-gray-200">Versión</div>
                    <div className="col-span-3 p-2 border-r border-gray-200">Fecha Creación</div>
                    <div className="col-span-2 p-2">Fase</div>
                </div>
                <div className="grid grid-cols-12 bg-white border-b border-gray-200">
                    <div className="col-span-5 p-2 border-r border-gray-200 uppercase">{documento.nombre}</div>
                    <div className="col-span-2 p-2 border-r border-gray-200">{documento.version || '1'}</div>
                    <div className="col-span-3 p-2 border-r border-gray-200">{fechaCreacion}</div>
                    <div className="col-span-2 p-2">{documento.workflow?.fases?.find((f: any) => f.estado === 'EN_CURSO')?.fase?.nombre || documento.workflow?.estado || ''}</div>
                </div>

                <div className="grid grid-cols-12 bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200">
                    <div className="col-span-7 p-2 border-r border-gray-200">Empresa</div>
                    <div className="col-span-5 p-2">Fichero</div>
                </div>
                <div className="grid grid-cols-12 bg-white border-b border-gray-200">
                    <div className="col-span-7 p-2 border-r border-gray-200">{documento.empresa || 'Centro de Metrología del Ejército Ecuatoriano'}</div>
                    <div
                        onClick={handleAbrirFichero}
                        className="col-span-5 p-2 text-blue-600 cursor-pointer hover:underline font-bold"
                        title="Clic para abrir en una nueva pestaña"
                    >
                        {nombreFichero}
                    </div>                </div>

                <div className="grid grid-cols-12 bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200">
                    <div className="col-span-7 p-2 border-r border-gray-200">Circuito</div>
                    <div className="col-span-5 p-2">Estado</div>
                </div>
                <div className="grid grid-cols-12 bg-white border-b border-gray-200">
                    <div className="col-span-7 p-2 border-r border-gray-200">{documento.circuito?.nombre || 'SIN CLASIFICAR'}</div>
                    <div className="col-span-5 p-2">{documento.activo ? 'Activo' : 'Inactivo'}</div>
                </div>

                <div className="bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200 p-2">
                    Workflow
                </div>
                {documento.workflow ? (
                    <div>
                        <div className="bg-white p-2">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="font-bold text-gray-800 border-b border-gray-200 text-xs">
                                        <th className="w-8 pb-2"></th>
                                        <th className="pb-2">Tipo</th>
                                        <th className="pb-2">Responsable</th>
                                        <th className="pb-2">Fecha</th>
                                        <th className="pb-2">Comentario</th>
                                        <th className="pb-2">Estado</th>
                                        <th className="pb-2">Archivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documento.workflow.fases?.map((wf: any) => {
                                        const colorEstado =
                                            wf.estado === 'COMPLETADO' ? 'text-green-600' :
                                            wf.estado === 'EN_CURSO' ? 'text-blue-600' :
                                            wf.estado === 'RECHAZADO' ? 'text-red-600' : 'text-gray-400';
                                        const labelEstado =
                                            wf.estado === 'COMPLETADO' ? 'Completada' :
                                            wf.estado === 'EN_CURSO' ? 'En curso' :
                                            wf.estado === 'RECHAZADO' ? 'Rechazada' : 'Pendiente';
                                        return (
                                            <tr key={wf.id} className="border-b border-gray-100 text-sm">
                                                <td className="py-1.5"><Paperclip className="w-4 h-4 text-gray-400" /></td>
                                                <td className="py-1.5 font-semibold">{wf.fase?.nombre || '---'}</td>
                                                <td className="py-1.5">{wf.procesado_por || '---'}</td>
                                                <td className="py-1.5">{wf.created_at ? new Date(wf.created_at).toLocaleDateString('es-ES') : '---'}</td>
                                                <td className="py-1.5 text-gray-500">{wf.comentario || '---'}</td>
                                                <td className={`py-1.5 font-semibold ${colorEstado}`}>{labelEstado}</td>
                                                <td className="py-1.5">
                                                    {wf.archivo_url && (
                                                        <a
                                                            href={`http://localhost:3001/${wf.archivo_url.replace(/\\/g, '/')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-xs"
                                                        >
                                                            Ver PDF
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {documento.workflow.estado === 'EN_CURSO' && (() => {
                            const userStr = localStorage.getItem('usuario');
                            const currentUser = userStr ? JSON.parse(userStr) : null;
                            const currentPersonaId = currentUser?.persona_id;

                            const faseActual = documento.workflow.fases?.find((f: any) => f.estado === 'EN_CURSO');
                            const asignados = faseActual?.fase?.participantes?.map((p: any) => p.persona.id) || [];
                            const esAsignado = asignados.length === 0 || asignados.includes(currentPersonaId);
                            const nombresAsignados = faseActual?.fase?.participantes?.map((p: any) => `${p.persona.nombre} ${p.persona.apellidos}`).join(', ');

                            return (
                                <div className="border-t border-gray-200 p-3 bg-gray-50">
                                    {esAsignado ? (
                                        !showWorkflowForm && !showRejectForm ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowWorkflowForm(true)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                                >
                                                    Subir PDF firmado
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectForm(true)}
                                                    className="px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                                                >
                                                    Rechazar fase
                                                </button>
                                            </div>
                                        ) : showWorkflowForm ? (
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(e) => setWorkflowFile(e.target.files?.[0] || null)}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Comentario (opcional)"
                                                    value={workflowComentario}
                                                    onChange={(e) => setWorkflowComentario(e.target.value)}
                                                    className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleAvanzarFase}
                                                        disabled={!workflowFile || subiendoWorkflow}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                                                    >
                                                        {subiendoWorkflow ? 'Subiendo...' : 'Confirmar y avanzar'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowWorkflowForm(false); setWorkflowFile(null); setWorkflowComentario(''); }}
                                                        className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <p className="text-sm text-gray-600 font-semibold">Motivo del rechazo:</p>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Describa el motivo del rechazo..."
                                                    value={rejectComentario}
                                                    onChange={(e) => setRejectComentario(e.target.value)}
                                                    className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-red-500 text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleRechazarFase}
                                                        disabled={!rejectComentario.trim()}
                                                        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                                                    >
                                                        Confirmar rechazo
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowRejectForm(false); setRejectComentario(''); }}
                                                        className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <p className="text-gray-500 text-sm">
                                            Fase asignada a: <strong>{nombresAsignados || '—'}</strong>
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {documento.workflow.estado === 'COMPLETADO' && (
                            <div className="border-t border-gray-200 p-3 bg-green-50 text-green-700 text-sm font-semibold">
                                Workflow completado
                            </div>
                        )}
                        {documento.workflow.estado === 'RECHAZADO' && (
                            <div className="border-t border-gray-200 p-3 bg-red-50 text-red-700 text-sm font-semibold">
                                Workflow rechazado
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white p-3 text-gray-500 text-sm">
                        Sin workflow (el documento no tiene un circuito asignado).
                    </div>
                )}
            </div>

            {/* Historial de Versiones */}
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200 p-2">
                    Historial de versiones
                </div>
                <div className="bg-white">
                    {documento.versiones && documento.versiones.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="font-bold text-gray-800 border-b border-gray-200 text-xs">
                                    <th className="p-2">Versión</th>
                                    <th className="p-2">Subido por</th>
                                    <th className="p-2">Comentario</th>
                                    <th className="p-2">Fecha</th>
                                    <th className="p-2">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documento.versiones.map((v: any) => (
                                    <tr key={v.id} className={`border-b border-gray-100 text-sm ${v.version === documento.version ? 'bg-green-50' : ''}`}>
                                        <td className="p-2 font-bold">{v.version}</td>
                                        <td className="p-2">{v.subido_por || '-'}</td>
                                        <td className="p-2 text-gray-500">{v.comentario || '-'}</td>
                                        <td className="p-2">{new Date(v.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="p-2">
                                            {v.version !== documento.version && (
                                                <button
                                                    onClick={() => handleRestaurarVersion(v.id)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                                >
                                                    <RotateCcw className="w-3 h-3" /> Restaurar
                                                </button>
                                            )}
                                            {v.version === documento.version && (
                                                <span className="text-green-600 text-xs font-semibold">Actual</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-3 text-gray-500 text-sm">Sin historial de versiones.</p>
                    )}
                </div>
            </div>

        </div>
    );
};