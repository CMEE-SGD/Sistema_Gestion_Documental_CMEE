import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, RotateCcw, FileSignature, X } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { buildFileUrl } from '../../../shared/utils/backendUrl';
import { useToast } from '../../../shared/components/molecules/Toast';
import FirmarDocumentoModal from '../components/FirmarDocumentoModal';
import { encodeId, decodeId } from '../../../shared/utils/ids';


export const DetalleDocumentoPage = () => {
    const { id: rawId } = useParams();
    const id = rawId ? decodeId(rawId) : undefined;
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();

    const [documento, setDocumento] = useState<any>(null);
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showVersionForm, setShowVersionForm] = useState(false);
    const [versionFile, setVersionFile] = useState<File | null>(null);
    const [versionComentario, setVersionComentario] = useState('');
    const [versionFecha, setVersionFecha] = useState(new Date().toISOString().split('T')[0]);
    const [subiendoVersion, setSubiendoVersion] = useState(false);

    const [isFirmaModalOpen, setIsFirmaModalOpen] = useState(false);
    const [nivelPermiso, setNivelPermiso] = useState<number>(5);

    const [listaCircuitos, setListaCircuitos] = useState<{ id: number, nombre: string }[]>([]);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({
        nombre: '', codigo: '', propietario: '', empresa: '', circuito_id: '', activo: true, created_at: '',
    });
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    const [showLogModal, setShowLogModal] = useState(false);
    const [showVersionesModal, setShowVersionesModal] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resDoc, resCarpetas, resCircuitos] = await Promise.all([
                    api.get(`/documentos/${id}`),
                    api.get('/carpetas'),
                    api.get('/documentos/circuitos')
                ]);

                setDocumento(resDoc.data);
                setCarpetas(Array.isArray(resCarpetas.data) ? resCarpetas.data : []);
                setListaCircuitos(Array.isArray(resCircuitos.data) ? resCircuitos.data : []);

                const doc = resDoc.data;
                if (doc?.carpeta_id) {
                    api.get(`/carpetas/${doc.carpeta_id}/mis-permisos`).then(r => {
                        if (r.data?.nivel_permiso !== undefined) setNivelPermiso(r.data.nivel_permiso);
                    }).catch(() => {});
                }
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

        const fileUrl = buildFileUrl(documento.archivo_url);
        if (!fileUrl) return;

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
            await alert({ message: 'Hubo un problema al intentar descargar el archivo.' });
        }
    };

    // 👉 NUEVA FUNCIÓN: Imprimir el PDF de forma silenciosa e integrada
    const handleImprimir = async () => {
        if (!documento?.archivo_url) return;

        const fileUrl = buildFileUrl(documento.archivo_url);
        if (!fileUrl) return;

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
            await alert({ message: 'No se pudo enviar a imprimir el archivo.' });
        }
    };

    // Función para el botón Mover
    const handleMover = () => {
        if (!documento) return;
        navigate('/gestordocumental/mover-documentos', {
            state: { documentos: [documento] }
        });
    };
    const handleDescargarArchivoWF = async (ruta: string) => {
        const fileUrl = buildFileUrl(ruta);
        if (!fileUrl) return;
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', ruta.split('/').pop() || 'documento.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar:', error);
        }
    };

    // 👉 NUEVA FUNCIÓN: Abre el PDF en una nueva pestaña
    const handleAbrirFichero = () => {
        const fileUrl = buildFileUrl(documento?.archivo_url);
        if (fileUrl) {
            window.open(fileUrl, '_blank', 'noopener,noreferrer');
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
            formData.append('created_at', versionFecha);

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
            await alert({ message: 'Error al subir la nueva versión.' });
        } finally {
            setSubiendoVersion(false);
        }
    };

    const handleRestaurarVersion = async (versionId: number) => {
        const ok = await confirm({ title: 'Restaurar versión', message: '¿Restaurar esta versión? El documento apuntará al archivo de esta versión.' });
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
            await alert({ message: 'Error al restaurar la versión.' });
        }
    };

    // El firmante y el rechazante ahora se determinan en el backend a partir
    // de la sesión autenticada — el modal solo necesita avisar que terminó
    // para recargar el documento con su workflow actualizado.
    const handleFirmaSuccess = async () => {
        try {
            const res = await api.get(`/documentos/${id}`);
            setDocumento(res.data);
        } catch (err) {
            console.error('Error recargando el documento:', err);
        }
    };

    // 👉 NUEVA FUNCIÓN: Elimina el documento actual
    const handleEliminar = async () => {
        if (!documento) return;

        const confirmacion = await confirm({ title: 'Eliminar documento', message: `¿Está seguro de eliminar el documento "${documento.nombre}"? Esta acción no se puede deshacer.` });
        if (!confirmacion) return;

        try {
            await api.delete(`/documentos/${documento.id}`);

            toast({ message: 'Documento eliminado correctamente' });
            window.dispatchEvent(new Event('refreshDocumentos'));
            navigate(-1);
        } catch (error) {
            console.error("Error al eliminar el documento:", error);
            await alert({ message: "Ocurrió un error al intentar eliminar el documento." });
        }
    };

    // 👉 NUEVA FUNCIÓN: Abre el formulario de edición precargado con los datos actuales
    const handleAbrirEdicion = () => {
        if (!documento) return;
        setEditFormData({
            nombre: documento.nombre || '',
            codigo: documento.codigo || '',
            propietario: documento.propietario || '',
            empresa: documento.empresa || 'Centro de Metrología del Ejército Ecuatoriano',
            circuito_id: documento.circuito_id ? String(documento.circuito_id) : '',
            activo: documento.activo,
            created_at: documento.created_at ? documento.created_at.split('T')[0] : '',
        });
        setShowVersionForm(false);
        setShowEditForm(true);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleGuardarEdicion = async () => {
        if (!documento) return;
        setGuardandoEdicion(true);
        try {
            await api.patch(`/documentos/${documento.id}`, {
                nombre: editFormData.nombre,
                codigo: editFormData.codigo,
                propietario: editFormData.propietario,
                empresa: editFormData.empresa,
                circuito_id: editFormData.circuito_id || null,
                activo: editFormData.activo,
                created_at: editFormData.created_at || null,
            });
            const resDoc = await api.get(`/documentos/${id}`);
            setDocumento(resDoc.data);
            setShowEditForm(false);
            toast({ message: 'Documento actualizado correctamente' });
            window.dispatchEvent(new Event('refreshDocumentos'));
        } catch (err) {
            console.error('Error al editar el documento:', err);
            await alert({ message: 'Error al guardar los cambios del documento.' });
        } finally {
            setGuardandoEdicion(false);
        }
    };

    // 👉 NUEVA FUNCIÓN: Carga y muestra la bitácora de auditoría del documento
    const handleVerLog = async () => {
        setShowLogModal(true);
        setLoadingLogs(true);
        try {
            const res = await api.get(`/auditoria/documento/${id}`);
            setLogs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error al cargar el log de auditoría:', err);
            setLogs([]);
        } finally {
            setLoadingLogs(false);
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
                <button
                    disabled={nivelPermiso < 3}
                    onClick={handleAbrirEdicion}
                    className={`px-3 py-1 border rounded transition-colors shadow-sm ${nivelPermiso >= 3 ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'}`}
                >
                    Editar
                </button>
                <button
                    disabled={nivelPermiso < 3}
                    onClick={() => { setShowVersionForm(!showVersionForm); setShowEditForm(false); }}
                    className={`px-3 py-1 border rounded transition-colors shadow-sm ${nivelPermiso >= 3 ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'}`}
                >
                    Nueva versión
                </button>
                <button
                    disabled={nivelPermiso < 5}
                    onClick={handleEliminar}
                    className={`px-3 py-1 border rounded transition-colors shadow-sm ${nivelPermiso >= 5 ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'}`}
                >
                    Eliminar
                </button>
                <button onClick={handleVerLog} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Log</button>
                <button onClick={() => setShowVersionesModal(true)} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Historial</button>

                {/* Botón Mover conectado */}
                <button
                    disabled={nivelPermiso < 4}
                    onClick={handleMover}
                    className={`px-3 py-1 border rounded transition-colors shadow-sm ${nivelPermiso >= 4 ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'}`}
                >
                    Mover
                </button>

                <button 
                    disabled={nivelPermiso < 2}
                    onClick={handleDescargar}
                    className={`px-3 py-1 border rounded transition-colors shadow-sm ${nivelPermiso >= 2 ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'}`}
                >
                    Descargar
                </button>
                <button 
                    onClick={handleImprimir}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Imprimir
                </button>
                <button onClick={() => navigate(-1)} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Cancelar</button>
            </div>

            {/* Formulario Editar documento */}
            {showEditForm && (
                <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-sm text-gray-800 mb-3">Editar documento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Título</label>
                            <input
                                type="text" name="nombre" value={editFormData.nombre} onChange={handleEditFormChange}
                                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm uppercase"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Código</label>
                            <input
                                type="text" name="codigo" value={editFormData.codigo} onChange={handleEditFormChange}
                                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Propietario</label>
                            <input
                                type="text" name="propietario" value={editFormData.propietario} onChange={handleEditFormChange}
                                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Empresa</label>
                            <input
                                type="text" name="empresa" value={editFormData.empresa} onChange={handleEditFormChange}
                                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Fecha</label>
                            <input
                                type="date" name="created_at" value={editFormData.created_at} onChange={handleEditFormChange}
                                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Circuito</label>
                            <select
                                name="circuito_id" value={editFormData.circuito_id} onChange={handleEditFormChange}
                                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                            >
                                <option value="">Sin clasificar</option>
                                {listaCircuitos.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                            <input
                                type="checkbox" name="activo" checked={editFormData.activo} onChange={handleEditFormChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label className="text-sm text-gray-700">Activo</label>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleGuardarEdicion}
                            disabled={guardandoEdicion || !editFormData.nombre.trim()}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                        >
                            {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button
                            onClick={() => setShowEditForm(false)}
                            className="px-4 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

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
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 font-medium">Fecha:</label>
                            <input
                                type="date"
                                value={versionFecha}
                                onChange={(e) => setVersionFecha(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleNuevaVersion}
                                disabled={!versionFile || subiendoVersion}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                            >
                                {subiendoVersion ? 'Subiendo...' : 'Subir versión'}
                            </button>
                            <button
                                onClick={() => { setShowVersionForm(false); setVersionFile(null); setVersionComentario(''); setVersionFecha(new Date().toISOString().split('T')[0]); }}
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
                    Responsable
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
                                                <td className="py-1.5">{wf.fase?.participantes?.map((p: any) => `${p.persona.nombre} ${p.persona.apellidos}`).join(', ') || '---'}</td>
                                                <td className="py-1.5">{wf.created_at ? new Date(wf.created_at).toLocaleDateString('es-ES') : '---'}</td>
                                                <td className="py-1.5 text-gray-500">{wf.comentario || '---'}</td>
                                                <td className={`py-1.5 font-semibold ${colorEstado}`}>{labelEstado}</td>
                                                <td className="py-1.5">
                                                    {wf.archivo_url && (
                                                        <div className="flex gap-2">
                                                            <a
                                                                href={buildFileUrl(wf.archivo_url) ?? undefined}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-xs"
                                                            >
                                                                Ver PDF
                                                            </a>
                                                            <button
                                                                onClick={() => handleDescargarArchivoWF(wf.archivo_url)}
                                                                className="text-blue-600 hover:underline text-xs"
                                                            >
                                                                Descargar
                                                            </button>
                                                        </div>
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

                            return esAsignado ? (
                                <div className="border-t border-gray-200 p-3 bg-gray-50">
                                    <button
                                        onClick={() => setIsFirmaModalOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                    >
                                        <FileSignature className="w-4 h-4" />
                                        Firmar documento
                                    </button>
                                </div>
                            ) : null;
                        })()}
                    </div>
                ) : (
                    <div className="bg-white p-2 text-sm font-semibold">
                        {documento.propietario || 'Sin propietario'}
                    </div>
                )}
            </div>

            <FirmarDocumentoModal
                isOpen={isFirmaModalOpen}
                onClose={() => setIsFirmaModalOpen(false)}
                documentoId={documento.id}
                archivoUrl={documento.archivo_url}
                tituloAccion={`Firmar: ${documento.workflow?.fases?.find((f: any) => f.estado === 'EN_CURSO')?.fase?.nombre || documento.nombre}`}
                onSuccess={handleFirmaSuccess}
            />

            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                            <h3 className="font-bold text-sm text-gray-800">Log de auditoría del documento</h3>
                            <button onClick={() => setShowLogModal(false)} className="text-gray-500 hover:text-gray-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto text-sm">
                            {loadingLogs ? (
                                <p className="text-gray-500">Cargando historial...</p>
                            ) : logs.length === 0 ? (
                                <p className="text-gray-500">No hay registros de auditoría para este documento.</p>
                            ) : (
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="font-bold text-gray-800 border-b border-gray-200">
                                            <th className="p-2">Fecha</th>
                                            <th className="p-2">Usuario</th>
                                            <th className="p-2">Acción</th>
                                            <th className="p-2">Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log: any) => (
                                            <tr key={log.id} className="border-b border-gray-100">
                                                <td className="p-2 whitespace-nowrap">{new Date(log.fecha_hora).toLocaleString('es-ES')}</td>
                                                <td className="p-2">{log.usuario?.nombre_usuario || '-'}</td>
                                                <td className="p-2">{log.accion}</td>
                                                <td className="p-2 text-gray-500">{log.descripcion || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showVersionesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                            <h3 className="font-bold text-sm text-gray-800">Historial de versiones</h3>
                            <button onClick={() => setShowVersionesModal(false)} className="text-gray-500 hover:text-gray-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="overflow-y-auto text-sm">
                            {documento.versiones && documento.versiones.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="font-bold text-gray-800 border-b border-gray-200 text-xs">
                                            <th className="p-3">Versión</th>
                                            <th className="p-3">Subido por</th>
                                            <th className="p-3">Comentario</th>
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">Acción</th>
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
                                <p className="p-4 text-gray-500">Sin historial de versiones.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};