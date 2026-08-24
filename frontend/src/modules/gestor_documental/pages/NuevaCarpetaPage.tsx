import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Folder, Plus, ArrowLeft } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAlert } from '../../../shared/components/molecules/AlertModal';

export const NuevaCarpetaPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { alert } = useAlert();
    
    // Atrapamos los datos si venimos del botón "Subcarpeta" en el gestor
    const carpetaPadreId = location.state?.carpetaPadreId;
    const carpetaPadreNombre = location.state?.carpetaPadreNombre;

    // 👉 ATRAPAMOS EL MODO FORZADO PARA LA CONFIGURACIÓN DE LIBRERÍAS
    const forzarTipo = location.state?.forzarTipo;
    const libreriaPreseleccionada = location.state?.libreriaPreseleccionada; 

    // Estados para almacenar los datos de la base de datos
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [departamentos, setDepartamentos] = useState<any[]>([]);

    const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});
    const [permisos, setPermisos] = useState<Record<string, { nivel_permiso: number; permiso_docs: boolean; permiso_carpetas: boolean; permiso_extra: boolean }>>({});

    // Estado del formulario mapeado a la jerarquía
    const [formData, setFormData] = useState({
        // Si viene forzado, arrancamos con LIBRERIA, si no, con SUBCARPETA
        tipo_nivel: forzarTipo || 'SUBCARPETA', 
        libreria_id: libreriaPreseleccionada || '',
        area_id: '',
        carpeta_padre_id: '', 
        
        nombre: '',
        descripcion: '',
        codigo: '',
        orden: 10,
        versionInicial: '1',
        activo: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resCarpetas, resDeptos] = await Promise.all([
                    api.get('/carpetas'),
                    api.get('/departamentos') 
                ]);
                
                setCarpetas(Array.isArray(resCarpetas?.data) ? resCarpetas.data : []);
                const deptos = Array.isArray(resDeptos?.data) ? resDeptos.data : [];
                setDepartamentos(deptos);

                const permisosIniciales: Record<string, any> = {};
                deptos.forEach((d: any) => {
                    const personas = (d.puestos_asignados || [])
                        .filter((pa: any) => pa.persona)
                        .map((pa: any) => pa.persona);
                    const unicos = personas.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);
                    unicos.forEach((p: any) => {
                        permisosIniciales[`p_${p.id}`] = { nivel_permiso: 5, permiso_docs: true, permiso_carpetas: true, permiso_extra: true };
                    });
                });
                setPermisos(permisosIniciales);

            } catch (error) {
                console.error('Error cargando datos:', error);
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

        // --- MAGIA CONDICIONAL AQUÍ ---
        let padre_final_id = null;
        let tipo_final = formData.tipo_nivel;
        
        if (carpetaPadreId) {
            // MODO AUTOMÁTICO: Si venimos desde una subcarpeta, forzamos estos valores
            padre_final_id = Number(carpetaPadreId);
            tipo_final = 'SUBCARPETA';
        } else {
            // MODO MANUAL: La lógica original si creamos desde cero
            if (formData.tipo_nivel === 'AREA') {
                padre_final_id = Number(formData.libreria_id);
            } else if (formData.tipo_nivel === 'SUBCARPETA') {
                padre_final_id = formData.carpeta_padre_id ? Number(formData.carpeta_padre_id) : Number(formData.area_id);
            }
        }

        try {
            const permisosPayload = Object.entries(permisos)
                .filter(([key]) => key.startsWith('p_'))
                .map(([key, val]) => ({
                    persona_id: Number(key.split('_')[1]),
                    nivel_permiso: val.nivel_permiso,
                    permiso_docs: val.permiso_docs,
                    permiso_carpetas: val.permiso_carpetas,
                    permiso_extra: val.permiso_extra,
                }));

            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                codigo: formData.codigo,
                orden: Number(formData.orden),
                version_inicial: formData.versionInicial,
                activo: formData.activo,
                tipo: tipo_final,
                carpeta_padre_id: padre_final_id || undefined,
                permisos: permisosPayload,
            };

            await api.post('/carpetas', payload);
            window.dispatchEvent(new Event('refreshCarpetas'));
            
            // Regresamos a la vista donde estábamos
            navigate(-1);
        } catch (error) {
            console.error('Error guardando carpeta', error);
            await alert({ message: 'Hubo un error al guardar la carpeta' });
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
                
                {/* --- SECCIÓN DE JERARQUÍA CONDICIONAL --- */}
                {carpetaPadreId ? (
                    // VISTA AUTOMÁTICA (Si se hizo clic desde una subcarpeta)
                    <div className="mb-8 border-b border-gray-200 pb-6">
                        <label className="block text-gray-700 font-bold mb-2">Ubicación de destino:</label>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-gray-700 flex items-center gap-2">
                            Se creará automáticamente dentro de: 
                            <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                                {carpetaPadreNombre}
                            </span>
                        </div>
                    </div>
                ) : (
                    // VISTA MANUAL ORIGINAL
                    <div className="grid grid-cols-[150px_1fr] gap-y-4 items-center mb-8 border-b border-gray-200 pb-6">
                        
                        <label className="text-gray-700 font-medium">Nivel a crear:</label>

                        {/* 👉 ADAPTAMOS EL LETRERO AL MODO FORZADO */}
                        {forzarTipo ? (
                            <div className="font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded border border-blue-200 w-max text-xs uppercase">
                                {forzarTipo === 'LIBRERIA' ? 'Creando nueva Librería Raíz' : `Creando nueva ${forzarTipo}`}
                            </div>
                        ) : (
                            // Los radio buttons originales
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
                        )}

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

                        {formData.tipo_nivel === 'SUBCARPETA' && (
                            <>
                                <label className="text-gray-700">Área Padre:</label>
                                <select name="area_id" value={formData.area_id} onChange={handleChange} required className="border border-gray-300 rounded px-3 py-1.5 w-full md:w-3/4 outline-none focus:border-blue-500">
                                    <option value="">-- Seleccione el Área --</option>
                                    {areas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                )}

                {/* --- SECCIÓN DE FORMULARIO DE CARPETA (INTACTA) --- */}
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

                {/* --- SECCIÓN DE PERMISOS --- */}
                <div className="mt-2 border-t border-gray-200 pt-6">
                    <h3 className="text-black font-bold mb-4 underline">Permisos de Acceso:</h3>

                    <div className="w-full max-w-4xl text-sm">
                        {/* Cabecera */}
                        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-t px-3 py-2 font-semibold text-gray-700 text-xs">
                            <div className="w-1/3">Departamento / Usuario</div>
                            <div className="w-1/4 text-center">Nivel</div>
                            <div className="flex-1 flex justify-around">
                                <span title="Crear Documentos"><FileText className="w-4 h-4 text-blue-800" /></span>
                                <span title="Crear Carpetas"><Folder className="w-4 h-4 text-yellow-600" /></span>
                                <span title="Permisos Extra"><Plus className="w-4 h-4 text-green-600" /></span>
                            </div>
                        </div>

                        {departamentos.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-3 border border-t-0 border-gray-200 rounded-b">No hay departamentos cargados.</p>
                        ) : (
                            <div className="border border-t-0 border-gray-200 rounded-b divide-y divide-gray-100">
                                {departamentos.filter((d: any) => d.puestos_asignados?.some((pa: any) => pa.persona)).map(depto => {
                                    const usuarios = depto.puestos_asignados?.filter((pa: any) => pa.persona).map((pa: any) => pa.persona) || [];
                                    const unicos = usuarios.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);
                                    const todosSeleccionados = unicos.every((p: any) => !!permisos[`p_${p.id}`]);

                                    return (
                                        <div key={depto.id}>
                                            <div className="flex items-center px-3 py-2 hover:bg-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandidos(prev => ({ ...prev, [depto.id]: !prev[depto.id] }))}
                                                        className={`transform transition-transform ${expandidos[depto.id] ? 'rotate-90' : ''} text-gray-400`}
                                                    >
                                                        ▶
                                                    </button>
                                                    <input
                                                        type="checkbox"
                                                        checked={todosSeleccionados}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                const nuevos: Record<string, any> = {};
                                                                unicos.forEach((p: any) => { nuevos[`p_${p.id}`] = { nivel_permiso: 5, permiso_docs: true, permiso_carpetas: true, permiso_extra: true }; });
                                                                setPermisos(prev => ({ ...prev, ...nuevos }));
                                                            } else {
                                                                const rest = { ...permisos };
                                                                unicos.forEach((p: any) => delete rest[`p_${p.id}`]);
                                                                setPermisos(rest);
                                                            }
                                                        }}
                                                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                                                    />
                                                    <span className="font-bold text-gray-800">{depto.nombre}</span>
                                                </div>
                                            </div>

                                            {expandidos[depto.id] && unicos.length > 0 && (
                                                <div className="bg-gray-50 border-t border-gray-100">
                                                    {unicos.map((persona: any) => {
                                                        const userKey = `p_${persona.id}`;
                                                        const userPerm = permisos[userKey] || { nivel_permiso: 5, permiso_docs: true, permiso_carpetas: true, permiso_extra: true };
                                                        return (
                                                            <div key={persona.id} className="flex items-center px-10 py-1.5 hover:bg-white text-xs">
                                                                <div className="w-1/3 flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!permisos[userKey]}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setPermisos(prev => ({ ...prev, [userKey]: userPerm }));
                                                                            } else {
                                                                                const { [userKey]: _, ...rest } = permisos;
                                                                                setPermisos(rest);
                                                                            }
                                                                        }}
                                                                        className="w-3 h-3 text-blue-600 rounded border-gray-300"
                                                                    />
                                                                    <span className="text-gray-700">{persona.nombre} {persona.apellidos}</span>
                                                                </div>
                                                                <div className="w-1/4 flex justify-center">
                                                                    <select
                                                                        value={userPerm.nivel_permiso}
                                                                        onChange={(e) => setPermisos(prev => ({
                                                                            ...prev,
                                                                            [userKey]: { ...userPerm, nivel_permiso: Number(e.target.value) }
                                                                        }))}
                                                                        disabled={!permisos[userKey]}
                                                                        className="border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 disabled:opacity-40"
                                                                    >
                                                                        <option value={1}>Nivel 1: Ver</option>
                                                                        <option value={2}>Nivel 2: Ver y Descargar</option>
                                                                        <option value={3}>Nivel 3: Ver, Descargar y Editar</option>
                                                                        <option value={4}>Nivel 4: Ver, Descargar, Editar y Mover</option>
                                                                        <option value={5}>Nivel 5: Todos los privilegios</option>
                                                                    </select>
                                                                </div>
                                                                <div className="flex-1 flex justify-around">
                                                                    <input type="checkbox" checked={userPerm.permiso_docs} onChange={(e) => setPermisos(prev => ({ ...prev, [userKey]: { ...userPerm, permiso_docs: e.target.checked } }))} disabled={!permisos[userKey]} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40" />
                                                                    <input type="checkbox" checked={userPerm.permiso_carpetas} onChange={(e) => setPermisos(prev => ({ ...prev, [userKey]: { ...userPerm, permiso_carpetas: e.target.checked } }))} disabled={!permisos[userKey]} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40" />
                                                                    <input type="checkbox" checked={userPerm.permiso_extra} onChange={(e) => setPermisos(prev => ({ ...prev, [userKey]: { ...userPerm, permiso_extra: e.target.checked } }))} disabled={!permisos[userKey]} className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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