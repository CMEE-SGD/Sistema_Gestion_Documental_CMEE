import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';
import api from '../../../core/api/axios';
import { useToast } from '../../../shared/components/molecules/Toast';

export const NuevoFicheroPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Atrapamos la carpeta destino
    const carpetaPadreId = location.state?.carpetaPadreId;
    const carpetaPadreNombre = location.state?.carpetaPadreNombre;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [nombrePropietario, setNombrePropietario] = useState('Cargando...');
    const [listaCircuitos, setListaCircuitos] = useState<{id: number, nombre: string}[]>([]);

    // Estado para el archivo físico
    const [archivoPdf, setArchivoPdf] = useState<File | null>(null);

    // Estados para los campos de texto
    const [formData, setFormData] = useState({
        empresa: 'Centro de Metrología del Ejército Ecuatoriano',
        circuito_id: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: true,
        titulo: '',
        version: '1'
    });

    useEffect(() => {
        // 1. Lógica del propietario
        const userStr = localStorage.getItem('usuario'); 
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const nombrePersona = user.persona?.nombre || user.nombre || '';
                const apellidoPersona = user.persona?.apellidos || user.apellidos || '';
                const nombreUsuario = user.nombre_usuario || '';
                let nombreCompleto = '';
                
                if (nombrePersona || apellidoPersona) {
                    nombreCompleto = `${nombrePersona} ${apellidoPersona}`.trim();
                } else if (nombreUsuario) {
                    nombreCompleto = nombreUsuario;
                }
                setNombrePropietario(nombreCompleto || 'Usuario Desconocido');
            } catch (error) {
                setNombrePropietario('Usuario Desconocido');
            }
        } else {
            setNombrePropietario('Usuario no identificado');
        }

        // 2. Consultar los Circuitos al Backend
        const fetchCircuitos = async () => {
            try {
                const res = await api.get('/documentos/circuitos');
                setListaCircuitos(res.data);
            } catch (error) {
                console.error("Error al cargar los circuitos:", error);
            }
        };
        fetchCircuitos();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    //comentario

    // 👉 ACTUALIZADO: Absorbe el nombre del archivo y lo pone en el título
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            if (file.type !== 'application/pdf') {
                setError('Por favor, seleccione únicamente un archivo PDF.');
                setArchivoPdf(null);
                e.target.value = ''; 
                return;
            }
            
            setError('');
            setArchivoPdf(file);

            // Extraemos el nombre del archivo eliminando la extensión .pdf (sin importar si está en mayúsculas o minúsculas)
            const nombreSinExtension = file.name.replace(/\.pdf$/i, '');
            
            // Actualizamos el estado del formulario para que el título se llene solo
            setFormData(prev => ({
                ...prev,
                titulo: nombreSinExtension
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!carpetaPadreId) return setError('Error: No se ha seleccionado una carpeta destino.');
        if (!archivoPdf) return setError('Debe seleccionar un archivo para subir.');

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('archivo', archivoPdf);
            submitData.append('propietario', nombrePropietario);
            submitData.append('carpeta_id', carpetaPadreId.toString());
            submitData.append('empresa', formData.empresa);
            if (formData.circuito_id) submitData.append('circuito_id', formData.circuito_id);
            submitData.append('created_at', formData.fecha);
            submitData.append('activo', String(formData.estado));
            submitData.append('nombre', formData.titulo);
            submitData.append('version', formData.version);

            await api.post('/documentos', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast({ message: 'Fichero creado correctamente' });
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
                        <label className="w-24 text-gray-700 font-medium">Empresa:</label>
                        <input 
                            type="text" name="empresa" value={formData.empresa} readOnly
                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-600 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-24 md:w-16 text-gray-700 font-medium text-left md:text-right">Fecha:</label>
                        <input 
                            type="date" name="fecha" value={formData.fecha} onChange={handleChange}
                            className="w-full md:w-40 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Fila 2: Circuito y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <label className="w-24 text-gray-700 font-medium">Circuito:</label>
                        <select 
                            name="circuito_id" value={formData.circuito_id} onChange={handleChange}
                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        >
                            <option value="">Seleccione un circuito</option>
                            {listaCircuitos.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="w-24 md:w-16 text-gray-700 font-medium text-left md:text-right">Estado:</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" name="estado" checked={formData.estado} onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            Activo
                        </label>
                    </div>
                </div>

                {/* Fila 3: Propietario (Solo lectura) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <label className="w-24 text-gray-700 font-medium">Propietario:</label>
                        <div className="flex-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 font-semibold rounded text-sm">
                            {nombrePropietario}
                        </div>
                    </div>
                </div>

                {/* Fila 4: Selección de Archivo y Título */}
                <div className="mt-2 border-t border-gray-200 pt-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                        <label className="w-24 text-gray-700 font-medium">Fichero:</label>
                        <div className="flex-1 w-full">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <label className="w-24 text-gray-700 font-medium">Título:</label>
                        <input 
                            type="text" name="titulo" value={formData.titulo} onChange={handleChange} required
                            placeholder="Nombre del documento"
                            className="flex-1 w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 uppercase"
                        />
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <label className="text-gray-700 font-medium md:ml-4">Versión:</label>
                            <input 
                                type="text" name="version" value={formData.version} onChange={handleChange}
                                className="w-16 border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-center"
                            />
                        </div>
                    </div>
                </div>

                {/* Botonera inferior */}
                <div className="flex items-center gap-3 mt-4 border-t border-gray-200 pt-6">
                    <button 
                        type="submit" disabled={loading}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Subiendo...' : 'Aceptar'}
                    </button>
                    <button 
                        type="button" onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

            </form>
        </div>
    );
};