import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import api from '../../lib/axios';
import { FileText, Eye, Download, Printer } from 'lucide-react';

export const DocumentosPersonaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [persona, setPersona] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                // Al buscar a la persona, el backend ya nos devuelve sus documentos asociados
                const response = await api.get(`/personas/${id}`);
                setPersona(response.data);
            } catch (error) {
                console.error('Error al cargar documentos', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, [id]);
// Forzar descarga automática usando Blobs (Salto de seguridad Cross-Origin)
    const handleDescargar = async (fileUrl: string, nombreArchivo: string) => {
        try {
            // Descargamos el archivo en la memoria del navegador
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            
            // Creamos un link invisible para forzar la descarga en la PC
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            
            // Limpiamos la memoria
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error al descargar', error);
            alert('No se pudo descargar el documento.');
        }
    };

    // Forzar la ventana de impresión usando un Iframe invisible
    const handleImprimir = async (fileUrl: string) => {
        try {
            // 1. Descargamos el archivo como Blob para evitar bloqueos de seguridad cruzada (CORS)
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // 2. Creamos un "iframe" (una ventana incrustada) pero la hacemos invisible
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);

            // 3. Esperamos a que el PDF cargue en el iframe y lanzamos la impresión
            iframe.onload = () => {
                // Un pequeño delay (200ms) asegura que el PDF esté completamente dibujado
                setTimeout(() => {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                    }
                    
                    // 4. Limpiamos la memoria después de unos segundos para no dejar iframes fantasma
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 10000);
                }, 200);
            };
        } catch (error) {
            console.error('Error al intentar imprimir', error);
            alert('Error: No se pudo preparar el documento para impresión.');
        }
    };

    if (loading) return <div className="p-8 text-center text-sm font-sans">Cargando documentos...</div>;
    if (!persona) return <div className="p-8 text-center text-sm text-red-500 font-sans">Recurso no encontrado.</div>;

    const documentos = persona.documentos || [];

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Cabecera */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 text-sm">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-800">
                    Documentos adjuntos: {persona.nombre} {persona.apellidos}
                </span>
            </div>

            {/* Botonera */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-300 bg-gray-50">
                <Button onClick={() => navigate(`/rrhh/personas/${id}`)} variant="cancelar">Atrás a la Ficha</Button>
            </div>

            {/* Tabla */}
            <div className="p-4">
                <div className="border border-gray-300 shadow-sm">
                    <div className="bg-[#8eb8d5] text-white font-bold px-4 py-2 text-sm">
                        Listado de Documentos
                    </div>
                    
                    <div className="p-4 bg-white">
                        {documentos.length === 0 ? (
                            <div className="text-gray-500 italic text-[12px] p-2">No hay documentos registrados para esta persona.</div>
                        ) : (
                            <table className="w-full text-left text-[12px] border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-100 text-gray-700">
                                        <th className="py-2.5 px-3 font-bold">Nombre del archivo</th>
                                        <th className="py-2.5 px-3 w-40 text-center font-bold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documentos.map((doc: any) => {
                                        // Armamos la URL correcta hacia tu backend
                                        const fileUrl = `${import.meta.env.VITE_BACKEND_URL}${doc.ruta}`;
                                        
                                        return (
                                            <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-2.5 px-3 font-medium text-blue-800">
                                                    {doc.nombre_archivo}
                                                </td>
                                                <td className="py-2.5 px-3 flex justify-center gap-3">
                                                    
                                                    {/* ACCIÓN: VER */}
                                                    <a 
                                                        href={fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="Ver en nueva pestaña"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                    
                                                    {/* ACCIÓN: DESCARGAR (Fuerza la descarga automática) */}
                                                    <button 
                                                        onClick={() => handleDescargar(fileUrl, doc.nombre_archivo)}
                                                        className="text-green-600 hover:text-green-800 transition-colors"
                                                        title="Descargar archivo"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>

                                                    {/* ACCIÓN: IMPRIMIR (Lleva a la pestaña del documento) */}
                                                    <button 
                                                        onClick={() => handleImprimir(fileUrl)}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                        title="Abrir para imprimir"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};