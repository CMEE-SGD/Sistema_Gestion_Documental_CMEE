import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../../lib/axios';
import { Persona } from '../../data/users';

// Interfaces para los catálogos basados en tu diagrama
interface Departamento {
    id: number | string;
    nombre: string;
}

interface Puesto {
    id: number | string;
    nombre: string;
}

interface Rol {
    id: number | string;
    nombre: string;
}

export const NuevaPersonaPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Estados para los catálogos obtenidos de la BD
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [puestosLista, setPuestosLista] = useState<Puesto[]>([]);
    const [rolesLista, setRolesLista] = useState<Rol[]>([]);

    // Estado inicial completo del formulario
    const [formData, setFormData] = useState<Partial<Persona> & { rol_id: string, puestos_asignados: any[] }>({
        codigo: '',
        saludo: '',
        nombre: '',
        apellidos: '',
        cedula_identidad: '',
        fecha_nacimiento: '',
        sexo: 'Hombre',
        domicilio: '',
        ciudad: '',
        codigo_postal: '',
        provincia: '',
        telefono: '',
        fax: '',
        celular: '',
        email_1: '',
        email_2: '',
        activo: true, // Por defecto el recurso está activo
        tipo_recurso: 'Usuario del sistema',
        rol_id: '',
        puestos_asignados: [
            { departamento_id: '', puesto_id: '' },
            { departamento_id: '', puesto_id: '' },
            { departamento_id: '', puesto_id: '' }
        ]
    });

    // Cargar los catálogos al iniciar la página
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [resDeptos, resPuestos, resRoles] = await Promise.all([
                    api.get('/departamentos'),
                    api.get('/puestos'),
                    api.get('/roles')
                ]);
                
                setDepartamentos(resDeptos.data);
                setPuestosLista(resPuestos.data);
                setRolesLista(resRoles.data);
            } catch (error) {
                console.error('Error al cargar los catálogos', error);
            }
        };
        fetchCatalogos();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Manejo especial para checkboxes
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePuestoChange = (index: number, campo: 'departamento_id' | 'puesto_id', valor: string) => {
        const nuevosPuestos = [...formData.puestos_asignados];
        nuevosPuestos[index][campo] = valor;
        setFormData({ ...formData, puestos_asignados: nuevosPuestos });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Nota: Si vas a enviar archivos (foto, hoja de vida), deberás convertir
            // formData a un objeto FormData real de JavaScript (multipart/form-data) antes de enviarlo.
            await api.post('/personas', formData);
            navigate('/rrhh/personas'); 
        } catch (error) {
            console.error('Error al crear la persona', error);
        } finally {
            setLoading(false);
        }
    };

    // Componente auxiliar para las etiquetas con el ícono 'i'
    const LabelConIcono = ({ label, requerido = false }: { label: string, requerido?: boolean }) => (
        <div className="w-48 flex items-center gap-2 text-xs text-gray-700 font-medium shrink-0">
            <div className="w-3 h-3 rounded-full border border-green-600 text-green-600 flex items-center justify-center text-[8px] font-bold">i</div>
            <label>{label} {requerido && <span className="text-red-500">*</span>}</label>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 bg-white min-h-screen">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-green-600 pb-2 pt-2 px-4">
                <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-gray-700" />
                    <span className="font-bold text-sm text-gray-800">Nuevo recurso</span>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => navigate('/rrhh/personas')} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-4 py-1.5 text-sm bg-[#007b00] text-white rounded hover:bg-green-700 disabled:opacity-50">
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            {/* Contenedor Principal */}
            <div className="px-4 pb-8">
                <div className="border border-gray-300 shadow-sm">
                    <div className="bg-[#007b00] text-white font-bold px-3 py-1.5 text-xs">
                        Nuevo recurso
                    </div>

                    <div className="bg-[#f0f0f0] border-l-4 border-[#007b00] p-6 flex flex-col gap-6">
                        
                        {/* SECCIÓN: DATOS PERSONALES */}
                        <div>
                            <h3 className="font-bold text-sm mb-4 border-b border-gray-300 pb-1 text-gray-800 underline">Datos personales</h3>
                            <div className="flex flex-col gap-3">
                                
                                <div className="flex items-center">
                                    <LabelConIcono label="Código:" />
                                    <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Saludo:" />
                                    <select name="saludo" value={formData.saludo} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none bg-white">
                                        <option value="">Seleccione un saludo</option>
                                        <option value="Sr.">Sr.</option>
                                        <option value="Sra.">Sra.</option>
                                        <option value="Ing.">Ing.</option>
                                        <option value="Lic.">Lic.</option>
                                    </select>
                                </div>

                                {/* Select Dinámico de Rol */}
                                <div className="flex items-center">
                                    <LabelConIcono label="Rol de usuario:" requerido />
                                    <select 
                                        name="rol_id" 
                                        value={formData.rol_id} 
                                        onChange={handleChange} 
                                        required
                                        className="border-2 border-gray-400 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none bg-white"
                                    >
                                        <option value="">Seleccione un rol</option>
                                        {rolesLista.map((rol) => (
                                            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Nombre:" requerido />
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="border-2 border-gray-400 px-2 py-1 text-xs w-64 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Apellidos:" requerido />
                                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="border border-gray-300 px-2 py-1 text-xs w-64 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="C.I.:" />
                                    <input type="text" name="cedula_identidad" value={formData.cedula_identidad} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Fecha de nacimiento:" />
                                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-32 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Sexo:" />
                                    <div className="flex items-center gap-4 text-xs">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input type="radio" name="sexo" value="Hombre" checked={formData.sexo === 'Hombre'} onChange={handleChange} /> Hombre
                                        </label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input type="radio" name="sexo" value="Mujer" checked={formData.sexo === 'Mujer'} onChange={handleChange} /> Mujer
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Domicilio:" />
                                    <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-80 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Ciudad:" />
                                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Código postal:" />
                                    <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-24 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Provincia:" />
                                    <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-64 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Teléfono:" />
                                    <div className="flex items-center gap-4">
                                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-32 focus:border-blue-500 outline-none bg-white" />
                                        
                                        <span className="text-xs text-gray-700">Fax:</span>
                                        <input type="text" name="fax" value={formData.fax} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-32 focus:border-blue-500 outline-none bg-white" />
                                        
                                        <span className="text-xs text-gray-700">Celular:</span>
                                        <input type="text" name="celular" value={formData.celular} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-32 focus:border-blue-500 outline-none bg-white" />
                                    </div>
                                </div>

                                <div className="flex items-center mt-2">
                                    <LabelConIcono label="E-mail 1:" />
                                    <input type="email" name="email_1" value={formData.email_1} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-80 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="E-mail 2:" />
                                    <input type="email" name="email_2" value={formData.email_2} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-80 focus:border-blue-500 outline-none bg-white" />
                                </div>

                                {/* Fotografía */}
                                <div className="flex items-start mt-4">
                                    <LabelConIcono label="Fotografía:" />
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                            <input type="checkbox" /> Mostrar ampliación en listado
                                        </label>
                                    </div>
                                </div>

                                {/* Carga de Ficheros de Imagen */}
                                <div className="flex items-start">
                                    <LabelConIcono label="Fichero:" />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <input type="file" accept="image/*" className="text-xs" />
                                        </div>
                                        <span className="text-[10px] text-gray-500">dimensiones recomendadas 61px x 84px</span>
                                    </div>
                                </div>

                                {/* Estado Activo */}
                                <div className="flex items-center mt-2">
                                    <LabelConIcono label="Estado del recurso:" />
                                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="activo" 
                                            checked={formData.activo} 
                                            onChange={handleChange} 
                                        /> 
                                        Recurso Activo en el sistema
                                    </label>
                                </div>

                                {/* Hoja de Vida (Archivo PDF/Word) */}
                                <div className="flex items-center border-t border-b border-gray-300 py-3 my-2">
                                    <div className="w-48 text-xs text-gray-700 pl-4 font-medium">Hoja de Vida:</div>
                                    <input type="file" accept=".pdf,.doc,.docx" className="text-xs bg-white border border-gray-300 px-2 py-1 w-80" />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: PUESTOS */}
                        <div>
                            <h3 className="font-bold text-sm mb-4 border-b border-gray-300 pb-1 text-gray-800 underline">Puestos</h3>
                            <div className="flex flex-col gap-2 pl-4">
                                {formData.puestos_asignados.map((asignacion, index) => (
                                    <div key={index} className="flex items-center gap-4 mb-1">
                                        <div className="flex items-center gap-2 w-24">
                                            <span className="text-xs text-gray-700">Puesto {index + 1}:</span>
                                        </div>
                                        
                                        {/* Select Dinámico de Departamento */}
                                        <select 
                                            value={asignacion.departamento_id}
                                            onChange={(e) => handlePuestoChange(index, 'departamento_id', e.target.value)}
                                            className="border border-gray-300 px-2 py-1 text-xs w-48 bg-white outline-none focus:border-blue-500"
                                        >
                                            <option value="">Seleccione un departamento</option>
                                            {departamentos.map((dep) => (
                                                <option key={dep.id} value={dep.id}>
                                                    {dep.nombre}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Select Dinámico de Puesto */}
                                        <select 
                                            value={asignacion.puesto_id}
                                            onChange={(e) => handlePuestoChange(index, 'puesto_id', e.target.value)}
                                            className="border border-gray-300 px-2 py-1 text-xs w-48 bg-white outline-none focus:border-blue-500"
                                        >
                                            <option value="">Seleccione un puesto</option>
                                            {puestosLista.map((puesto) => (
                                                <option key={puesto.id} value={puesto.id}>
                                                    {puesto.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};