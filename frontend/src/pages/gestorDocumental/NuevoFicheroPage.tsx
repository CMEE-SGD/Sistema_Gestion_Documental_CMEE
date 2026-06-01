import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Save, X } from 'lucide-react';
import api from '../../lib/axios';

export const NuevoFicheroPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Atrapamos la carpeta destino (igual que hicimos con la creación de carpetas)
    const carpetaPadreId = location.state?.carpetaPadreId;
    const carpetaPadreNombre = location.state?.carpetaPadreNombre;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado para el archivo físico
    const [archivoPdf, setArchivoPdf] = useState<File | null>(null);

    // Estados para los campos de texto (basado en Prisma)
    const [formData, setFormData] = useState({
        empresa: 'Centro de Metrología del Ejército Ecuatoriano',
        circuito: 'SIN_CLASIFICAR', // Valores exactos de tu Enum en Prisma
        fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        estado: true,
        titulo: '',
        version: '1'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // Validación opcional: Asegurarnos de que sea PDF
            if (file.type !== 'application/pdf') {
                setError('Por favor, seleccione únicamente un archivo PDF.');
                setArchivoPdf(null);
                e.target.value = ''; // Limpiar el input
                return;
            }
            setError('');
            setArchivoPdf(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!carpetaPadreId) {
            setError('Error: No se ha seleccionado una carpeta destino.');
            return;
        }

        if (!archivoPdf) {
            setError('Debe seleccionar un archivo para subir.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 🔥 LA MAGIA OCURRE AQUÍ: Empaquetamos todo en FormData
            const submitData = new FormData();
            
            // Adjuntamos el archivo físico (el backend buscará un archivo llamado 'archivo')
            submitData.append('archivo', archivoPdf);
            
            // Adjuntamos los datos de texto
            submitData.append('carpeta_id', carpetaPadreId.toString());
            submitData.append('empresa', formData.empresa);
            submitData.append('circuito', formData.circuito);
            submitData.append('fecha_documento', formData.fecha);
            submitData.append('activo', String(formData.estado)); // FormData solo acepta strings
            submitData.append('nombre', formData.titulo);
            submitData.append('version', formData.version);

            // Enviamos por Axios con cabecera multipart
            await api.post('/documentos', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Disparamos evento (opcional si la tabla escucha) y volvemos
            window.dispatchEvent(new Event('refreshDocumentos'));
            navigate(-1);

        } catch (err: any) {
            console.error('Error subiendo archivo:', err);
            setError(err.response?.data?.message || 'Error al subir el documento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mt-6 text-sm">
            
            {/* Cabecera */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="p-2 bg-green-700 rounded text-white">
                    <Upload className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Nuevo fichero</h2>
                    {carpetaPadreNombre && (
                        <p className="text-xs text-blue-600 font-medium">Destino: {carpetaPadreNombre}</p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {/* Fila 1: Empresa y Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <label className="w-24 text-gray-700">Empresa:</label>
                        <input 
                            type="text" name="empresa" value={formData.empresa} readOnly
                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-600 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-16 text-gray-700 text-right">Fecha:</label>
                        <input 
                            type="date" name="fecha" value={formData.fecha} onChange={handleChange}
                            className="w-40 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Fila 2: Circuito y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <label className="w-24 text-gray-700">Circuito:</label>
                        <select 
                            name="circuito" value={formData.circuito} onChange={handleChange}
                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        >
                            <option value="SIN_CLASIFICAR">Sin clasificar</option>
                            <option value="ALTA_FRECUENCIA">ALTA FRECUENCIA</option>
                            <option value="ATENCION_AL_CLIENTE">ATENCIÓN AL CLIENTE</option>
                            <option value="BAJA_FRECUENCIA">BAJA FRECUENCIA</option>
                            <option value="CALIDAD">CALIDAD</option>
                            <option value="CAPACITACION">CAPACITACION</option>
                            <option value="CUALIFICACION">CUALIFICACIÓN</option>
                            <option value="FORMATOS">FORMATOS</option>
                            <option value="GESTION_DE_PATRONES">GESTIÓN DE PATRONES</option>
                            <option value="GESTION_LOGISTICA">GESTION LOGISTICA</option>
                            <option value="LEGALIZACION">LEGALIZACION</option>
                            <option value="PRESION">PRESIÓN</option>
                            <option value="PROCEDIMIENTOS_GESTION_DOCUMENTAL">PROCEDIMIENTOS GESTIÓN DOCUMENTAL</option>
                            <option value="TERMOMETRIA">TERMOMETRIA</option>
                            <option value="TIEMPO">TIEMPO</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-16 text-gray-700 text-right">Estado:</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" name="estado" checked={formData.estado} onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            Activo
                        </label>
                    </div>
                </div>

                {/* Links visuales de tu diseño */}
                <div className="flex flex-col gap-2 mt-2">
                    <a href="#" className="text-blue-600 underline text-xs">Más información:</a>
                    <a href="#" className="text-blue-600 underline text-xs">Otros datos:</a>
                    <div className="mt-2">
                        <span className="border border-black px-2 py-0.5 text-xs font-bold rounded cursor-pointer hover:bg-gray-100">Permisos</span>
                    </div>
                </div>

                {/* Fila 3: Selección de Archivo y Título */}
                <div className="mt-4 border-t border-gray-200 pt-6">
                    <div className="flex items-start gap-4 mb-4">
                        <label className="w-24 text-gray-700 mt-1">Fichero:</label>
                        <div className="flex-1 flex flex-col gap-2">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="w-24 text-gray-700 text-right">Título:</label>
                        <input 
                            type="text" name="titulo" value={formData.titulo} onChange={handleChange} required
                            placeholder="Nombre del documento"
                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 uppercase"
                        />
                        <label className="text-gray-700 ml-4">Versión:</label>
                        <input 
                            type="text" name="version" value={formData.version} onChange={handleChange}
                            className="w-16 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-center"
                        />
                    </div>
                </div>

                {/* Botonera inferior */}
                <div className="flex items-center gap-3 mt-6 border-t border-gray-200 pt-6">
                    <button 
                        type="submit" disabled={loading}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Subiendo...' : 'Aceptar'}
                    </button>
                    <button 
                        type="button" onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

            </form>
        </div>
    );
};