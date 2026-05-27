import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Folder, Plus, ArrowLeft } from 'lucide-react';
import api from '../../lib/axios';

export const NuevaCarpetaPage = () => {
    const navigate = useNavigate();

    // Estados para almacenar los datos de la base de datos
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [departamentos, setDepartamentos] = useState<any[]>([]);

    // Estado del formulario mapeado a la jerarquía
    const [formData, setFormData] = useState({
        tipo_nivel: 'SUBCARPETA', // LIBRERIA, AREA, SUBCARPETA
        libreria_id: '',
        area_id: '',
        carpeta_padre_id: '', // Para subcarpetas dentro de subcarpetas (niveles infinitos)
        
        nombre: '',
        descripcion: '',
        codigo: '',
        orden: 0,
        versionInicial: '1',
        activo: true
    });

    useEffect(() => {
        // Cargar todas las carpetas y departamentos al iniciar
        const fetchData = async () => {
            try {
                const [resCarpetas, resDeptos] = await Promise.all([
                    api.get('/carpetas'),
                    api.get('/departamentos') 
                ]);
                
                // VALIDACIÓN CRÍTICA: Nos aseguramos de que siempre guardemos un Array.
                // Si la data no es un Array, guardamos un Array vacío [] para que .map y .filter no exploten.
                setCarpetas(Array.isArray(resCarpetas?.data) ? resCarpetas.data : []);
                setDepartamentos(Array.isArray(resDeptos?.data) ? resDeptos.data : []);

            } catch (error) {
                console.error('Error cargando datos:', error);
                // Si el servidor da error (ej: 404 o 500), forzamos arrays vacíos
                setCarpetas([]);
                setDepartamentos([]);
            }
        };
        fetchData();
    }, []);

    // Lógica de filtrado en cascada
    const librerias = carpetas.filter(c => c.tipo === 'LIBRERIA');
    const areas = carpetas.filter(c => c.tipo === 'AREA' && c.carpeta_padre_id === Number(formData.libreria_id));
    const subcarpetas = carpetas.filter(c => c.tipo === 'SUBCARPETA' && c.carpeta_padre_id === Number(formData.area_id));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
            };

            // Limpiar los hijos si cambia un padre
            if (name === 'libreria_id') {
                newData.area_id = '';
                newData.carpeta_padre_id = '';
            }
            if (name === 'area_id') {
                newData.carpeta_padre_id = '';
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Determinar quién es el padre real basándose en el tipo seleccionado
        let padre_final_id = null;
        
        if (formData.tipo_nivel === 'AREA') {
            padre_final_id = Number(formData.libreria_id);
        } else if (formData.tipo_nivel === 'SUBCARPETA') {
            // Si eligió una subcarpeta específica, esa es el padre. Si no, es el área.
            padre_final_id = formData.carpeta_padre_id ? Number(formData.carpeta_padre_id) : Number(formData.area_id);
        }

        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                codigo: formData.codigo,
                orden: Number(formData.orden),
                version_inicial: formData.versionInicial,
                activo: formData.activo,
                tipo: formData.tipo_nivel,
                carpeta_padre_id: padre_final_id || undefined
            };

            await api.post('/carpetas', payload);
            navigate('/gestordocumental');
        } catch (error) {
            console.error('Error guardando carpeta', error);
            alert('Hubo un error al guardar la carpeta');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-sm">
            {/* Cabecera */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Nueva carpeta</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col max-w-4xl px-8 py-6">
                
                {/* --- SECCIÓN DE JERARQUÍA DINÁMICA --- */}
                <div className="grid grid-cols-[150px_1fr] gap-y-4 items-center mb-8 border-b border-gray-200 pb-6">
                    
                    <label className="text-gray-700 font-medium">Nivel a crear:</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="tipo_nivel" value="LIBRERIA" checked={formData.tipo_nivel === 'LIBRERIA'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            Librería (Raíz)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="tipo_nivel" value="AREA" checked={formData.tipo_nivel === 'AREA'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            Área
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="tipo_nivel" value="SUBCARPETA" checked={formData.tipo_nivel === 'SUBCARPETA'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                            Subcarpeta
                        </label>
                    </div>

                    {/* Mostrar Librería solo si creamos un Área o Subcarpeta */}
                    {formData.tipo_nivel !== 'LIBRERIA' && (
                        <>
                            <label className="text-gray-700">Librería Padre:</label>
                            <select name="libreria_id" value={formData.libreria_id} onChange={handleChange} required className="border border-gray-300 rounded px-3 py-1.5 w-full md:w-3/4 outline-none focus:border-blue-500">
                                <option value="">-- Seleccione la Librería --</option>
                                {librerias.map(lib => (
                                    <option key={lib.id} value={lib.id}>{lib.nombre}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {/* Mostrar Área solo si creamos una Subcarpeta */}
                    {formData.tipo_nivel === 'SUBCARPETA' && (
                        <>
                            <label className="text-gray-700">Área Padre:</label>
                            <select name="area_id" value={formData.area_id} onChange={handleChange} required className="border border-gray-300 rounded px-3 py-1.5 w-full md:w-3/4 outline-none focus:border-blue-500">
                                <option value="">-- Seleccione el Área --</option>
                                {areas.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre}</option>
                                ))}
                            </select>
                            
                            <label className="text-gray-700">Subcarpeta Interna (Opcional):</label>
                            <select name="carpeta_padre_id" value={formData.carpeta_padre_id} onChange={handleChange} className="border border-gray-300 rounded px-3 py-1.5 w-full md:w-3/4 outline-none focus:border-blue-500">
                                <option value="">-- Ubicar directamente en el Área --</option>
                                {subcarpetas.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                {/* --- SECCIÓN DE FORMULARIO DE CARPETA --- */}
                <div className="grid grid-cols-[150px_1fr] gap-y-4 items-center mb-8">
                    <label className="text-gray-700 font-bold">Nombre:</label>
                    <input 
                        type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                        className="border-2 border-gray-800 rounded px-3 py-1.5 w-full outline-none focus:border-blue-600 font-semibold"
                    />

                    <label className="text-gray-700">Descripción:</label>
                    <input 
                        type="text" name="descripcion" value={formData.descripcion} onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-1.5 w-full outline-none focus:border-blue-500"
                    />

                    <label className="text-gray-700">Código:</label>
                    <input 
                        type="text" name="codigo" value={formData.codigo} onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-1.5 w-48 outline-none focus:border-blue-500"
                    />

                    <label className="text-gray-700">Orden:</label>
                    <input 
                        type="number" name="orden" value={formData.orden} onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-1.5 w-24 outline-none focus:border-blue-500"
                    />

                    <label className="text-gray-700">Versión inicial:</label>
                    <input 
                        type="text" name="versionInicial" value={formData.versionInicial} onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-1.5 w-24 outline-none focus:border-blue-500"
                    />

                    <label className="text-gray-700">Estado:</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" name="activo" checked={formData.activo} onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        Activa
                    </label>
                </div>

                {/* --- SECCIÓN DE PERMISOS (Visual) --- */}
                <div className="mt-2 border-t border-gray-200 pt-6">
                    <h3 className="text-black font-bold mb-4 underline">Permisos de Acceso:</h3>

                    <div className="w-full max-w-4xl text-sm border border-gray-200 rounded p-4 bg-gray-50">
                        {/* Cabecera de permisos (Iconos) */}
                        <div className="flex justify-end gap-4 mb-3 pr-2 border-b border-gray-200 pb-2">
                            <div title="Crear Documentos" className="cursor-help"><FileText className="w-4 h-4 text-blue-800" /></div>
                            <div title="Crear Carpetas" className="cursor-help"><Folder className="w-4 h-4 text-yellow-600" /></div>
                            <div title="Permisos Extra" className="cursor-help"><Plus className="w-4 h-4 text-green-600" /></div>
                        </div>

                        {/* Listado de Departamentos traídos de la BD */}
                        {departamentos.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-2">No hay departamentos cargados.</p>
                        ) : (
                            departamentos.map(depto => (
                                <div key={depto.id} className="flex items-center justify-between hover:bg-white p-2 rounded transition-colors border-b border-gray-100 last:border-0">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 w-1/2">
                                        <input type="checkbox" className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300" />
                                        {depto.nombre}
                                    </label>
                                    <div className="flex items-center gap-5">
                                        <select className="border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500">
                                            <option>Ver y Descargar</option>
                                            <option>Todos los privilegios</option>
                                        </select>
                                        <div className="flex gap-5">
                                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mt-8">
                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow hover:bg-blue-700 transition-colors">
                        Guardar carpeta
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};