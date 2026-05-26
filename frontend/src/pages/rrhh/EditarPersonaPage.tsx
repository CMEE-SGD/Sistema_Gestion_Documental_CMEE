import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Info } from 'lucide-react';
import api from '../../lib/axios';
import { Persona } from '../../data/users'; // Ajusta la ruta a tu interfaz

export const EditarPersonaPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado inicial basado en los campos de la tabla 'persona'
    const [formData, setFormData] = useState<Partial<Persona>>({
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
        activo: true,
        tipo_recurso: 'Usuario del sistema'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ajusta la ruta de tu API
            await api.post('/personas', formData);
            navigate('/rrhh/personas'); // Redirige al listado después de guardar
        } catch (error) {
            console.error('Error al crear la persona', error);
            // Aquí puedes agregar una notificación de error (ej. react-toastify)
        } finally {
            setLoading(false);
        }
    };

    // Componente auxiliar para renderizar las etiquetas con el ícono 'i'
    const LabelConIcono = ({ label, requerido = false }: { label: string, requerido?: boolean }) => (
        <div className="w-48 flex items-center gap-2 text-xs text-gray-700 font-medium shrink-0">
            <div className="w-3 h-3 rounded-full border border-green-600 text-green-600 flex items-center justify-center text-[8px] font-bold">
                i
            </div>
            <label>
                {label} {requerido && <span className="text-red-500">*</span>}
            </label>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 bg-white min-h-screen">
            
            {/* Cabecera de la vista */}
            <div className="flex items-center justify-between border-b border-green-600 pb-2 pt-2 px-4">
                <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-gray-700" />
                    <span className="font-bold text-sm text-gray-800">Nuevo recurso</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        onClick={() => navigate('/rrhh/personas')}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-1.5 text-sm bg-[#007b00] text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            {/* Contenedor Principal del Formulario */}
            <div className="px-4">
                <div className="border border-gray-300 shadow-sm">
                    {/* Barra verde superior */}
                    <div className="bg-[#007b00] text-white font-bold px-3 py-1.5 text-xs">
                        Nuevo recurso
                    </div>

                    {/* Cuerpo gris con borde izquierdo verde */}
                    <div className="bg-[#f0f0f0] border-l-4 border-[#007b00] p-6 flex flex-col gap-6">
                        
                        {/* SECCIÓN: DATOS PERSONALES */}
                        <div>
                            <h3 className="font-bold text-sm mb-4 border-b border-gray-300 pb-1 text-gray-800 underline">Datos personales</h3>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center">
                                    <LabelConIcono label="Código:" />
                                    <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none" />
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

                                <div className="flex items-center">
                                    <LabelConIcono label="Nombre:" requerido />
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="border-2 border-gray-400 px-2 py-1 text-xs w-64 focus:border-blue-500 outline-none" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Apellidos:" requerido />
                                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="border border-gray-300 px-2 py-1 text-xs w-64 focus:border-blue-500 outline-none" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="C.I.:" />
                                    <input type="text" name="cedula_identidad" value={formData.cedula_identidad} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none" />
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
                                    <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-80 focus:border-blue-500 outline-none" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Ciudad:" />
                                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-48 focus:border-blue-500 outline-none" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Código postal:" />
                                    <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-24 focus:border-blue-500 outline-none" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="Provincia:" />
                                    <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-64 focus:border-blue-500 outline-none" />
                                </div>

                                {/* Teléfono, Fax, Celular en una fila */}
                                <div className="flex items-center">
                                    <LabelConIcono label="Teléfono:" />
                                    <div className="flex items-center gap-4">
                                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-32 focus:border-blue-500 outline-none" />
                                        
                                        <span className="text-xs text-gray-700">Fax:</span>
                                        <input type="text" name="fax" value={formData.fax} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-32 focus:border-blue-500 outline-none" />
                                        
                                        <span className="text-xs text-gray-700">Celular:</span>
                                        <input type="text" name="celular" value={formData.celular} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-32 focus:border-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div className="flex items-center mt-2">
                                    <LabelConIcono label="E-mail 1:" />
                                    <input type="email" name="email_1" value={formData.email_1} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-80 focus:border-blue-500 outline-none" />
                                </div>

                                <div className="flex items-center">
                                    <LabelConIcono label="E-mail 2:" />
                                    <input type="email" name="email_2" value={formData.email_2} onChange={handleChange} className="border border-gray-300 px-2 py-1 text-xs w-80 focus:border-blue-500 outline-none" />
                                </div>

                                {/* Fotografía y Archivos */}
                                <div className="flex items-start mt-4">
                                    <LabelConIcono label="Fotografía:" />
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-xs text-gray-700">
                                            <input type="checkbox" /> Mostrar ampliación en listado
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <LabelConIcono label="Fichero:" />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <input type="file" className="text-xs" />
                                        </div>
                                        <span className="text-[10px] text-gray-500">dimensiones recomendadas 61px x 84px</span>
                                    </div>
                                </div>

                                <div className="flex items-center border-t border-b border-gray-300 py-3 my-2">
                                    <div className="w-48 text-xs text-gray-700">Hoja de Vida:</div>
                                    <input type="file" className="text-xs bg-white border border-gray-300 px-2 py-1 w-80" />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: PUESTOS */}
                        <div>
                            <h3 className="font-bold text-sm mb-4 border-b border-gray-300 pb-1 text-gray-800 underline">Puestos</h3>
                            
                            <div className="flex flex-col gap-2 pl-4">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="flex items-center gap-4 mb-1">
                                        <div className="flex items-center gap-2 w-24">
                                            <UserPlus className="w-4 h-4 text-gray-500" />
                                            <span className="text-xs text-gray-700">Puesto {num}:</span>
                                        </div>
                                        <select className="border border-gray-300 px-2 py-1 text-xs w-48 bg-white outline-none focus:border-blue-500">
                                            <option>Seleccione un departamento</option>
                                        </select>
                                        <select className="border border-gray-300 px-2 py-1 text-xs w-48 bg-white outline-none focus:border-blue-500">
                                            <option>Seleccione cargo</option>
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