import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, FileText, Contact, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import { Persona } from '../../data/users';

interface DocumentoAdjunto {
    id: number;
    nombre: string;
    url: string;
}

export const DetallePersonaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [persona, setPersona] = useState<Persona | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [documentos, setDocumentos] = useState<DocumentoAdjunto[]>([
        { id: 1, nombre: 'Curriculum Vitae Apolo_J_2025_signed.pdf', url: '#' },
        { id: 2, nombre: 'Declaracion de Salvaguardia Conf Etica Apolo_J.PDF', url: '#' },
        { id: 3, nombre: 'HOJA_DE_VIDA.pdf', url: '#' },
        { id: 4, nombre: 'Memorando Nro. FT-CMEE-CME-DO-2024-0068-M cambio de funcion de PEC a RET. sqgs. Apolo J. LBF.pdf', url: '#' },
    ]);

    useEffect(() => {
        const fetchPersonaDetalle = async () => {
            try {
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

    // Función para manejar el Soft Delete (cambio de estado de activo a inactivo)
    const handleEliminar = async () => {
        const confirmar = window.confirm('¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?');
        if (!confirmar) return;

        try {
            // Llama al método DELETE del controlador que ejecuta el soft delete (activo: false)
            await api.delete(`/personas/${id}`);
            alert('El recurso ha sido inactivado correctamente.');
            navigate('/rrhh/personas'); // Redirige de vuelta al listado principal
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            alert('No se pudo desactivar el recurso. Inténtelo de nuevo.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-[11px] text-gray-500 font-sans">Cargando ficha del recurso...</div>;
    }

    if (!persona) {
        return <div className="p-8 text-center text-[11px] text-red-500 font-sans">No se encontró la persona solicitada.</div>;
    }

    const DataRow = ({ label, value, isLink = false, children }: { label: string, value?: string | React.ReactNode, isLink?: boolean, children?: React.ReactNode }) => (
        <div className="flex items-start mb-2.5 text-[11px]">
            <div className="w-40 font-bold text-gray-900 shrink-0">{label}</div>
            <div className={`flex-1 ${isLink ? 'text-blue-600 underline cursor-pointer' : 'text-gray-800'}`}>
                {value !== undefined ? value : children || '-'}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col bg-white min-h-screen font-sans">
            
            {/* Título de la vista */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300">
                <User className="w-5 h-5 text-blue-600" />
                <h1 className="text-sm font-bold text-gray-800">
                    Ficha del recurso {persona.nombre} {persona.apellidos}
                </h1>
            </div>

            {/* Barra de herramientas y botones */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-300 bg-gray-50">
                <button onClick={() => navigate('/rrhh/personas')} className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Atrás</button>
                <button onClick={() => navigate(`/rrhh/personas/editar/${id}`)} className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Editar</button>
                <button onClick={handleEliminar} className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">
                  Eliminar
                </button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Plan de Capacitación</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Evaluaciones</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Documentos</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Aplicar perfil</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Imprimir</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Log</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Procesos</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Acceso</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Historial</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Historial puestos</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Permisos</button>
            </div>

            <div className="p-4">
                <div className="border border-gray-300 bg-white">
                    
                    {/* Cabecera Verde */}
                    <div className="bg-[#006400] text-white font-bold px-4 py-2 text-xs">
                        Usuario del sistema
                    </div>

                    {/* Cuerpo con fondo gris y borde verde a la izquierda */}
                    <div className="bg-[#f2f2f2] border-l-[6px] border-[#006400] text-[11px] p-6">
                        
                        {/* SECCIÓN SUPERIOR: Foto y Datos Básicos */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            <div className="w-32 h-40 shrink-0 border border-gray-400 bg-gray-200 flex items-center justify-center overflow-hidden">
                                {persona.foto_ruta ? (
                                    <img src={persona.foto_ruta} alt="Foto perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>

                            <div className="flex-1 flex flex-col pt-1">
                                <DataRow label="Código" value={persona.codigo} />
                                <DataRow label="Saludo" value={persona.saludo} />
                                <DataRow label="Nombre" value={persona.nombre} />
                                <DataRow label="Apellidos" value={persona.apellidos} />
                                <DataRow label="Puesto">
                                    {persona.puestos && persona.puestos.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {persona.puestos.map((puesto: any, i: number) => (
                                                <span key={i}>
                                                    <span className="text-blue-600 underline cursor-pointer">{puesto?.puesto?.nombre}</span> 
                                                    {' en el departamento '} 
                                                    <span className="text-blue-600 underline cursor-pointer">{puesto?.departamento?.nombre}</span>
                                                </span>
                                            ))}
                                        </div>
                                    ) : '-'}
                                </DataRow>
                                <DataRow label="Roles" value={persona.roles && persona.roles.length > 0 ? persona.roles.map((r: any) => r.nombre).join(', ') : '-'} />
                            </div>
                        </div>

                        {/* ESTADOS DEL SISTEMA */}
                        <div className="mb-8">
                            <DataRow label="Fecha de alta" value={persona.fecha_alta ? persona.fecha_alta.split('T')[0].split('-').reverse().join('/') : '-'} />
                            <DataRow label="Tipo de recurso" value={persona.tipo_recurso || 'Usuario del sistema'} />
                            <DataRow label="Estado" value={persona.activo ? 'Activo' : 'Inactivo'} />
                        </div>

                        {/* SECCIÓN: Información Personal */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Contact className="w-4 h-4 text-gray-700" />
                                <h3 className="font-bold text-[12px] text-gray-900">Información Personal</h3>
                            </div>
                            <DataRow label="C.I." value={persona.cedula_identidad} />
                            <DataRow label="Fecha de nacimiento" value={persona.fecha_nacimiento ? persona.fecha_nacimiento.split('T')[0].split('-').reverse().join('/') : '-'} />
                            <DataRow label="Domicilio" value={persona.domicilio} />
                            <DataRow label="Ciudad" value={persona.ciudad} />
                            <DataRow label="Código postal" value={persona.codigo_postal} />
                            <DataRow label="Teléfono" value={persona.telefono} />
                            <DataRow label="Fax" value={persona.fax} />
                            <DataRow label="Celular" value={persona.celular} />
                            <DataRow label="E-mail 1" value={persona.email_1} />
                            <DataRow label="E-mail 2" value={persona.email_2} />
                        </div>

                        {/* SECCIÓN: Curriculum Vitae */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-4 h-4 text-green-700" />
                                <h3 className="font-bold text-[12px] text-gray-900">Curriculum Vitae</h3>
                            </div>
                            
                            <DataRow label="Documentos">
                                <div className="flex flex-col gap-2 w-full max-w-2xl">
                                    {documentos.map((doc) => (
                                        <div key={doc.id} className="flex justify-between items-center border border-gray-300 p-2 rounded-sm bg-white">
                                            <a href={doc.url} className="text-blue-600 underline text-[11px] hover:text-blue-800">{doc.nombre}</a>
                                            <button className="text-[10px] text-blue-600 border border-gray-300 px-2 py-0.5 rounded hover:bg-gray-100">
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </DataRow>
                            <DataRow label="Hoja de Vida:" value="Ver adjunto" />
                        </div>

                        {/* SECCIÓN: Datos de usuario */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-4 h-4 text-red-600" />
                                <h3 className="font-bold text-[12px] text-gray-900">Datos de usuario</h3>
                            </div>
                            <DataRow label="Nombre de usuario" value={persona.usuario?.nombre_usuario || '-'} />
                            <DataRow label="Perfil" value="Responsable de proceso" />
                            <DataRow label="Interfaz" value="ISOTools 2007" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};