import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';
import { GraduationCap, Eye, Download, Printer, Trash2 } from 'lucide-react';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../../shared/utils/ids';
import { buildFileUrl } from '../../../../shared/utils/backendUrl';

export const CapacitacionesPersonaPage = () => {
    const { id: rawId } = useParams<{ id: string }>(); const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [persona, setPersona] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [subiendo, setSubiendo] = useState(false);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const response = await api.get(`/personas/${id}`);
                setPersona(response.data);
            } catch (error) {
                console.error('Error al cargar capacitaciones', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, [id]);

    const handleEliminar = async (archivoId: number, nombreArchivo: string) => {
        const ok = await confirm({ message: `¿Está seguro de que desea eliminar el archivo "${nombreArchivo}"?` });
        if (!ok) return;

        try {
            await api.delete(`/personas/capacitacion-archivo/${archivoId}`);
            setPersona((prev: any) => ({
                ...prev,
                capacitaciones_archivos: prev.capacitaciones_archivos.filter((a: any) => a.id !== archivoId)
            }));
            toast({ message: 'Archivo eliminado correctamente.' });
        } catch (error) {
            console.error('Error al eliminar', error);
            await alert({ message: 'Hubo un error al intentar eliminar el archivo.' });
        }
    };

    const handleSubirArchivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSubiendo(true);
        try {
            const formData = new FormData();
            formData.append('nombre', persona.nombre);
            formData.append('apellidos', persona.apellidos);

            files.forEach(file => {
                formData.append('capacitaciones', file);
            });

            await api.patch(`/personas/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast({ message: 'Archivos subidos exitosamente.' });

            const response = await api.get(`/personas/${id}`);
            setPersona(response.data);
        } catch (error) {
            console.error('Error al subir archivos', error);
            await alert({ message: 'Hubo un error al intentar subir los archivos.' });
        } finally {
            setSubiendo(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDescargar = async (fileUrl: string, nombreArchivo: string) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error al descargar', error);
            await alert({ message: 'No se pudo descargar el archivo.' });
        }
    };

    const handleImprimir = async (fileUrl: string) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                setTimeout(() => {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                    }
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 10000);
                }, 200);
            };
        } catch (error) {
            console.error('Error al intentar imprimir', error);
            await alert({ message: 'Error: No se pudo preparar el archivo para impresión.' });
        }
    };

    if (loading) return <div className="p-8 text-center text-sm font-sans">Cargando archivos...</div>;
    if (!persona) return <div className="p-8 text-center text-sm text-red-500 font-sans">Recurso no encontrado.</div>;

    const archivos = persona.capacitaciones_archivos || [];

    return (
        <div className="bg-white min-h-screen font-sans">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 text-sm">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-800">
                    Capacitaciones: {persona.nombre} {persona.apellidos}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-300 bg-gray-50">
                <Button onClick={() => navigate(`/rrhh/personas/${encodeId(id)}`)} variant="clasico">Atrás a la Ficha</Button>
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="clasico"
                    disabled={subiendo}
                >
                    {subiendo ? 'Subiendo archivos...' : 'Agregar Capacitaciones'}
                </Button>

                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleSubirArchivos}
                />
            </div>

            <div className="p-4">
                <div className="border border-gray-300 shadow-sm">
                    <div className="bg-[#8eb8d5] text-white font-bold px-4 py-2 text-sm">
                        Listado de Capacitaciones (PDFs)
                    </div>

                    <div className="p-4 bg-white">
                        {archivos.length === 0 ? (
                            <div className="text-gray-500 italic text-[12px] p-2">No hay archivos de capacitación registrados para esta persona.</div>
                        ) : (
                            <table className="w-full text-left text-[12px] border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-100 text-gray-700">
                                        <th className="py-2.5 px-3 font-bold">Nombre del archivo</th>
                                        <th className="py-2.5 px-3 font-bold">Fecha de subida</th>
                                        <th className="py-2.5 px-3 w-40 text-center font-bold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivos.map((archivo: any) => {
                                        const fileUrl = buildFileUrl(archivo.ruta) ?? '';
                                        return (
                                            <tr key={archivo.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-2.5 px-3 font-medium text-blue-800">
                                                    {archivo.nombre_archivo}
                                                </td>
                                                <td className="py-2.5 px-3 text-gray-500">
                                                    {new Date(archivo.fecha_subida).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="py-2.5 px-3 flex justify-center gap-3">
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="Ver en nueva pestaña"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>

                                                    <button
                                                        onClick={() => handleDescargar(fileUrl, archivo.nombre_archivo)}
                                                        className="text-green-600 hover:text-green-800 transition-colors"
                                                        title="Descargar archivo"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleImprimir(fileUrl)}
                                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                                        title="Abrir para imprimir"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleEliminar(archivo.id, archivo.nombre_archivo)}
                                                        className="text-red-600 hover:text-red-800 transition-colors ml-2"
                                                        title="Eliminar archivo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
