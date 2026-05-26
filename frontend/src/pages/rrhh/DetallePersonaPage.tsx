import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, FileText, Contact, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import { Persona } from '../../data/users';

// Interfaz extendida para manejar los documentos (opcional según tu BD real)
interface DocumentoAdjunto {
    id: number;
    nombre: string;
    url: string;
}

export const PersonaDetallesPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [persona, setPersona] = useState<Persona | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Estado simulado para los documentos de la sección CV
    const [documentos, setDocumentos] = useState<DocumentoAdjunto[]>([
        { id: 1, nombre: 'Curriculum Vitae Apolo_J_2025_signed.pdf', url: '#' },
        { id: 2, nombre: 'Declaracion de Salvaguardia Conf Etica Apolo_J.PDF', url: '#' },
        { id: 3, nombre: 'HOJA_DE_VIDA.pdf', url: '#' },
        { id: 4, nombre: 'Memorando Nro. FT-CMEE-CME-DO-2024-0068-M cambio de funcion de PEC a RET. sqgs. Apolo J. LBF.pdf', url: '#' },
    ]);

    useEffect(() => {
        const fetchPersonaDetalle = async () => {
            try {
                // Ajusta la ruta a tu API real para obtener un registro por ID
                const response = await api.get(`/personas/${id}`);
                setPersona(response.data);
            } catch (error) {
                console.error('Error cargando los detalles de la persona', error);
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchPersonaDetalle();
        }
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando ficha del recurso...</div>;
    }

    if (!persona) {
        return <div className="p-8 text-center text-red-500">No se encontró la persona solicitada.</div>;
    }

    // Componente reutilizable para las filas de datos (Etiqueta : Valor)
    const DataRow = ({ label, value, isLink = false }: { label: string, value?: string | React.ReactNode, isLink?: boolean }) => (
        <div className="flex mb-2 text-sm">
            <div className="w-1/4 font-semibold text-gray-800">{label}</div>
            <div className={`w-3/4 ${isLink ? 'text-blue-600 underline cursor-pointer' : 'text-gray-700'}`}>
                {value || '-'}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 bg-gray-50 min-h-screen p-4">
            
            {/* Título de la vista */}
            <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-bold text-gray-800">
                    Ficha del recurso {persona.nombre} {persona.apellidos}
                </h1>
            </div>

            {/* Barra de herramientas y botones */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-300 pb-4">
                <button onClick={() => navigate('/rrhh/personas')} className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Atrás</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Editar</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Plan de Capacitación</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Evaluaciones</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Documentos</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Aplicar perfil</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Imprimir</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Log</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Procesos</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Acceso</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Historial</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Historial puestos</button>
                <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Permisos</button>
            </div>

            {/* Contenedor principal de la ficha */}
            <div className="border-2 border-[#007b00] bg-white mt-2">
                {/* Cabecera Verde */}
                <div className="bg-[#007b00] text-white font-bold px-3 py-1 text-sm">
                    Usuario del sistema
                </div>

                <div className="flex flex-col md:flex-row p-4 gap-6">
                    
                    {/* COLUMNA IZQUIERDA (Foto y Estados) */}
                    <div className="w-full md:w-1/4 flex flex-col gap-4">
                        <div className="border border-gray-300 p-1 w-32 h-40 bg-gray-100 flex items-center justify-center mx-auto md:mx-0">
                            {persona.foto_ruta ? (
                                <img src={persona.foto_ruta} alt="Foto perfil" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-2 text-sm mt-4">
                            <div className="flex justify-between">
                                <span className="font-semibold">Fecha de alta</span>
                                <span>{persona.fecha_alta}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Tipo de recurso</span>
                                <span>{persona.tipo_recurso || 'Usuario del sistema'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Estado</span>
                                <span>{persona.activo ? 'Activo' : 'Inactivo'}</span>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA (Información Detallada) */}
                    <div className="w-full md:w-3/4 flex flex-col gap-6">
                        
                        {/* Datos Básicos */}
                        <div>
                            <DataRow label="Código" value={persona.codigo} />
                            <DataRow label="Saludo" value={persona.saludo} />
                            <DataRow label="Nombre" value={persona.nombre} />
                            <DataRow label="Apellidos" value={persona.apellidos} />
                            <DataRow 
                                label="Puesto" 
                                value={
                                    <span>
                                        <span className="text-blue-600 underline cursor-pointer">Responsable Técnico</span> En el departamento <span className="text-blue-600 underline cursor-pointer">Laboratorio de Magnitudes Eléctricas</span>
                                    </span>
                                } 
                            />
                            <DataRow label="Roles" value={""} />
                        </div>

                        {/* Sección Información Personal */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Contact className="w-4 h-4 text-gray-600" />
                                <h3 className="font-bold text-gray-800 text-sm">Información Personal</h3>
                            </div>
                            <DataRow label="C.I." value={persona.cedula_identidad} />
                            <DataRow label="Fecha de nacimiento" value={persona.fecha_nacimiento} />
                            <DataRow label="Domicilio" value={persona.domicilio} />
                            <DataRow label="Ciudad" value={persona.ciudad} />
                            <DataRow label="Código postal" value={persona.codigo_postal} />
                            <DataRow label="Teléfono" value={persona.telefono} />
                            <DataRow label="Fax" value={persona.fax} />
                            <DataRow label="Celular" value={persona.celular} />
                            <DataRow label="E-mail 1" value={persona.email_1} />
                            <DataRow label="E-mail 2" value={persona.email_2} />
                        </div>

                        {/* Sección Curriculum Vitae */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <h3 className="font-bold text-gray-800 text-sm">Curriculum Vitae</h3>
                            </div>
                            
                            <div className="flex mb-2 text-sm">
                                <div className="w-1/4 font-semibold text-gray-800">Documentos</div>
                                <div className="w-3/4 flex flex-col gap-2">
                                    {documentos.map((doc) => (
                                        <div key={doc.id} className="flex justify-between items-center border border-gray-200 p-2 rounded bg-white">
                                            <a href={doc.url} className="text-blue-600 underline text-xs">{doc.nombre}</a>
                                            <button className="text-xs text-blue-600 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100">
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <DataRow label="Hoja de Vida:" value="Ver adjunto" />
                        </div>

                        {/* Sección Datos de usuario */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-red-600" />
                                <h3 className="font-bold text-gray-800 text-sm">Datos de usuario</h3>
                            </div>
                            <DataRow label="Nombre de usuario" value={persona.usuario} />
                            {/* Estos datos asumo que vienen combinados o de tablas relacionadas */}
                            <DataRow label="Perfil" value="Responsable de proceso" />
                            <DataRow label="Interfaz" value="ISOTools 2007" />
                        </div>

                    </div>
                </div>
                {/* Borde inferior verde para cerrar la caja como en la imagen */}
                <div className="h-1 bg-[#007b00] w-full"></div>
            </div>
        </div>
    );
};