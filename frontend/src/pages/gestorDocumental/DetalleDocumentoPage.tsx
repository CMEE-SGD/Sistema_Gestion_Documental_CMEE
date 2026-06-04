import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip } from 'lucide-react';
import api from '../../lib/axios';

export const DetalleDocumentoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [documento, setDocumento] = useState<any>(null);
    const [carpetas, setCarpetas] = useState<any[]>([]); // 👉 Nuevo estado para las carpetas
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">Nueva versión</button>
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
                    <div className="col-span-2 p-2">{documento.fase || ''}</div>
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
                    <div className="col-span-7 p-2 border-r border-gray-200">{documento.circuito?.replace(/_/g, ' ') || 'SIN CLASIFICAR'}</div>
                    <div className="col-span-5 p-2">{documento.activo ? 'Activo' : 'Inactivo'}</div>
                </div>

                <div className="grid grid-cols-12 bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200">
                    <div className="col-span-7 p-2 border-r border-gray-200">Elaboración</div>
                    <div className="col-span-5 p-2">Aprobación</div>
                </div>
                <div className="grid grid-cols-12 bg-white border-b border-gray-200">
                    <div className="col-span-7 p-2 border-r border-gray-200 font-bold">
                        {documento.propietario || 'Usuario Desconocido'} - {fechaCreacion}
                    </div>
                    <div className="col-span-5 p-2 font-bold">
                        Cristian Espinosa A.. - {fechaCreacion}
                    </div>
                </div>

                <div className="bg-gray-100 font-bold text-gray-600 uppercase text-xs border-b border-gray-200 p-2">
                    Acciones
                </div>
                <div className="bg-white p-2">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="font-bold text-gray-800 border-b border-gray-200">
                                <th className="w-8 pb-2"></th>
                                <th className="pb-2">Descripción</th>
                                <th className="pb-2">Tipo</th>
                                <th className="pb-2">Responsable</th>
                                <th className="pb-2">Fecha</th>
                                <th className="pb-2">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-1"><Paperclip className="w-4 h-4 text-gray-500" /></td>
                                <td className="py-1">Cumpliendo con el programa anual de revisión de documentos e instructivos.</td>
                                <td className="py-1">ELABORACIÓN</td>
                                <td className="py-1">{documento.propietario || 'José Cusín Antamba'}</td>
                                <td className="py-1">{fechaCreacion}</td>
                                <td className="py-1 text-red-600">Cerrada</td>
                            </tr>
                            <tr>
                                <td className="py-1"><Paperclip className="w-4 h-4 text-gray-500" /></td>
                                <td className="py-1">Documento vigente</td>
                                <td className="py-1">APROBACIÓN</td>
                                <td className="py-1">Cristian Espinosa A..</td>
                                <td className="py-1">{fechaCreacion}</td>
                                <td className="py-1 text-red-600">Cerrada</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};