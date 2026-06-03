import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Contact, ShieldAlert, BookOpen, UserCog } from 'lucide-react'; // Añadidos nuevos iconos
import api from '../../lib/axios';
import { Persona } from '../../data/users';
import { TablaHistorial } from '../../components/shared/TablaHistorial';
import { PrintHeader } from '../../components/shared/PrintHeader';
import { Button } from '../../components/ui/button';


// Interfaz para los documentos adjuntos
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

    // Estados para el Log Individual
    const [mostrarLogs, setMostrarLogs] = useState(false);
    const [logsPersona, setLogsPersona] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Estado dinámico para los documentos
    const [documentos, setDocumentos] = useState<DocumentoAdjunto[]>([
        { id: 1, nombre: 'Curriculum Vitae Apolo_J_2025_signed.pdf', url: '#' },
        { id: 2, nombre: 'Declaracion de Salvaguardia Conf Etica Apolo_J.PDF', url: '#' },
        { id: 3, nombre: 'HOJA_DE_VIDA.pdf', url: '#' },
        { id: 4, nombre: 'Memorando Nro. FT-CMEE-CME-DO-2024-0068-M.pdf', url: '#' },
    ]);

    useEffect(() => {
        const fetchPersonaDetalle = async () => {
            try {
                const response = await api.get(`/personas/${id}`);
                setPersona(response.data);

                // NOTA: Si tu API devuelve los documentos en response.data.documentos, 
                // puedes actualizar el estado aquí:
                // if(response.data.documentos) setDocumentos(response.data.documentos);

            } catch (error) {
                console.error('Error cargando los detalles de la persona', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPersonaDetalle();
    }, [id]);

    const handleToggleLogs = async () => {
        setMostrarLogs(!mostrarLogs);
        if (!mostrarLogs && logsPersona.length === 0) {
            setLoadingLogs(true);
            try {
                const response = await api.get(`/auditoria/persona/${id}`);
                setLogsPersona(response.data);
            } catch (error) {
                console.error('Error al cargar logs de la persona', error);
            } finally {
                setLoadingLogs(false);
            }
        }
    };

    const handleEliminar = async () => {
        const confirmar = window.confirm('¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?');
        if (!confirmar) return;

        try {
            await api.delete(`/personas/${id}`);
            alert('El recurso ha sido inactivado correctamente.');
            navigate('/rrhh/personas');
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            alert('No se pudo desactivar el recurso. Inténtelo de nuevo.');
        }
    };

    // Función para manejar la eliminación dinámica de un documento
    const handleEliminarDocumento = async (docId: number) => {
        const confirmar = window.confirm('¿Desea eliminar este documento adjunto?');
        if (!confirmar) return;

        try {
            // Aquí iría tu llamada a la API para borrar el documento, ej:
            // await api.delete(`/documentos/${docId}`);

            // Actualizamos el estado para quitarlo de la vista al instante
            setDocumentos(prevDocs => prevDocs.filter(doc => doc.id !== docId));
        } catch (error) {
            console.error('Error al eliminar documento', error);
            alert('Error al eliminar el documento.');
        }
    };

    const formatFecha = (fecha?: string) => {
        if (!fecha) return '-';
        if (fecha.includes('T')) {
            const [year, month, day] = fecha.split('T')[0].split('-');
            return `${day}/${month}/${year}`;
        }
        return fecha;
    };

    if (loading) return <div className="p-8 text-center text-[11px] text-gray-500 font-sans">Cargando ficha del recurso...</div>;
    if (!persona) return <div className="p-8 text-center text-[11px] text-red-500 font-sans">No se encontró la persona solicitada.</div>;

    const DataRow = ({ label, value, isLink = false, children, mb = "mb-3" }: { label: string, value?: string | React.ReactNode, isLink?: boolean, children?: React.ReactNode, mb?: string }) => (
        <div className={`flex items-start ${mb} text-[11px]`}>
            <div className="w-[180px] font-bold text-gray-900 shrink-0 mt-1">{label}</div>
            <div className={`flex-1 ${isLink ? 'text-blue-600 underline cursor-pointer' : 'text-gray-800'}`}>
                {value !== undefined && value !== null && value !== '' ? value : children || '-'}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col bg-white min-h-screen font-sans">
            <PrintHeader
                subtitulo={`Ficha técnica de: ${persona?.nombre} ${persona?.apellidos}`}
            />
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 print:hidden">
                <User className="w-5 h-5 text-blue-600" />
                <h1 className="text-sm font-bold text-gray-800">
                    Ficha del recurso {persona.nombre} {persona.apellidos}
                </h1>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-300 bg-gray-50 print:hidden">
                <Button variant="cancelar">Atrás</Button>
                <Button onClick={() => navigate(`/rrhh/personas/editar/${id}`)} variant="clasico">Editar</Button>
                <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                <Button variant="imprimir" />
                <Button onClick={handleToggleLogs} variant="clasico">Log</Button>
            </div>

            {/* 1. CONTENEDOR EXTERNO: Le damos print:my-6 para que tenga margen arriba y ABAJO */}
            <div className="p-4 print:p-0 print:my-6">

                {/* 2. RECUADRO PRINCIPAL: Añadimos rounded para que las esquinas se vean suaves */}
                <div className="border border-gray-300 bg-white shadow-sm print:shadow-none print:border print:border-gray-400 rounded-sm">

                    <div className="bg-[#006400] text-white font-bold px-4 py-2 text-xs print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
                        Usuario del sistema
                    </div>

                    {/* 3. CUERPO DE DATOS: Aumentamos el padding vertical en impresión (print:py-8) para que no quede pegado al borde inferior */}
                    <div className="bg-[#f2f2f2] border-l-[6px] border-[#006400] text-[11px] p-8 print:bg-white print:border-none print:px-6 print:py-8">

                        {/* 4. SOLUCIÓN AL APILAMIENTO: Forzamos 'print:flex-row' para que la foto y los datos siempre estén lado a lado */}
                        <div className="flex flex-col md:flex-row print:flex-row gap-8 mb-8">

                            <div className="w-[130px] h-[160px] shrink-0 border border-gray-300 print:border-gray-400 bg-[#e2e6ea] print:bg-transparent flex items-center justify-center overflow-hidden">
                                {persona.foto_ruta ? (
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}${persona.foto_ruta}`}
                                        alt="Foto perfil"
                                        className="w-full h-full object-cover"
                                    />) : (
                                    <User className="w-16 h-16 text-gray-400 stroke-[1.5]" />
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-start pt-1">
                                <DataRow label="Código" value={persona.codigo} />
                                <DataRow label="Saludo" value={persona.saludo} />
                                <DataRow label="Nombre" value={persona.nombre} />
                                <DataRow label="Apellidos" value={persona.apellidos} />

                                <DataRow label="Puesto">
                                    {persona.puestos && persona.puestos.length > 0 ? (
                                        <div className="flex flex-col gap-1.5">
                                            {persona.puestos.map((p, idx) => (
                                                <div key={idx} className="text-[11px] leading-tight">
                                                    {p.puesto?.nombre && (
                                                        <span className="text-blue-600 underline cursor-pointer font-medium mr-1 hover:text-blue-800">
                                                            {p.puesto.nombre}
                                                        </span>
                                                    )}
                                                    {p.puesto?.nombre && p.departamento?.nombre && <span className="text-gray-600"> en </span>}
                                                    {p.departamento?.nombre && (
                                                        <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                                                            el departamento {p.departamento.nombre}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : '-'}
                                </DataRow>

                                <DataRow label="Roles">
                                    {persona.roles && persona.roles.length > 0 ? persona.roles.map(r => r.nombre).join(', ') : '-'}
                                </DataRow>
                            </div>
                        </div>

                        <div className="mb-10">
                            <DataRow label="Fecha de alta" value={formatFecha(persona.fecha_alta)} />
                            <DataRow label="Tipo de recurso" value={persona.tipo_recurso || 'Usuario del sistema'} />
                            <DataRow label="Estado" value={persona.activo ? 'Activo' : 'Inactivo'} />
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Contact className="w-4 h-4 text-gray-700" />
                                <h3 className="font-bold text-[12px] text-gray-900">Información Personal</h3>
                            </div>

                            <DataRow label="C.I." value={persona.cedula_identidad} />
                            <DataRow label="Fecha de nacimiento" value={formatFecha(persona.fecha_nacimiento)} />
                            <DataRow label="Domicilio" value={persona.domicilio} />
                            <DataRow label="Ciudad" value={persona.ciudad} />
                            <DataRow label="Código postal" value={persona.codigo_postal} />

                            <div className="h-4"></div>

                            <DataRow label="Teléfono" value={persona.telefono} />
                            <DataRow label="Fax" value={persona.fax} />
                            <DataRow label="Celular" value={persona.celular} />

                            <div className="h-4"></div>

                            <DataRow label="E-mail 1">
                                {persona.email_1 ? <a href={`mailto:${persona.email_1}`} >{persona.email_1}</a> : '-'}
                            </DataRow>
                            {persona.email_2 && (
                                <DataRow label="E-mail 2">
                                    <a href={`mailto:${persona.email_2}`} className="text-blue-600 underline">{persona.email_2}</a>
                                </DataRow>
                            )}
                        </div>

                        {/* NUEVA SECCIÓN: Documentos (Curriculum Vitae) */}
                        <div className="mb-8 mt-10">
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen className="w-4 h-4 text-[#d9a05b]" fill="#f7e1b5" />
                                <h3 className="font-bold text-[12px] text-gray-900">Curriculum Vitae</h3>
                            </div>

                            <DataRow label="Documentos">
                                <div className="flex flex-col gap-2.5 max-w-4xl">
                                    {documentos.length > 0 ? (
                                        documentos.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-300 px-3 py-1.5 rounded-sm">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 text-[11px]">
                                                    {doc.nombre}
                                                </a>
                                                <button
                                                    onClick={() => handleEliminarDocumento(doc.id)}
                                                    className="text-blue-600 underline hover:text-blue-800 text-[11px] px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 italic">No hay documentos adjuntos.</span>
                                    )}
                                </div>
                            </DataRow>

                            <div className="h-4"></div>
                            <DataRow label="Hoja de Vida:">
                                <span className="text-gray-800">Ver adjunto</span>
                            </DataRow>
                        </div>

                        {/* NUEVA SECCIÓN: Datos de usuario */}
                        <div className="mb-8 mt-10">
                            <div className="flex items-center gap-2 mb-4">
                                <UserCog className="w-4 h-4 text-blue-700" />
                                <h3 className="font-bold text-[12px] text-gray-900">Datos de usuario</h3>
                            </div>

                            <DataRow label="Nombre de usuario" value={persona.usuario?.nombre_usuario || '-'} />
                            <DataRow label="Perfil">
                                {persona.roles && persona.roles.length > 0 ? persona.roles.map(r => r.nombre).join(', ') : 'Responsable de proceso'}
                            </DataRow>
                            <DataRow label="Interfaz" value="SGD-CMEE" />
                        </div>

                        {/* SECCIÓN: Log de actividades */}
                        {mostrarLogs && (
                            <div className="mt-10 border-t border-gray-300 pt-6 animate-fade-in print:hidden">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldAlert className="w-4 h-4 text-[#006400]" />
                                    <h3 className="font-bold text-[12px] text-gray-900">Log de actividades del recurso</h3>
                                </div>
                                <TablaHistorial logs={logsPersona} loading={loadingLogs} esGlobal={false} />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};