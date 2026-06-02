import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, FileText, Contact, ShieldAlert } from 'lucide-react';
import api from '../../lib/axios';
import { Persona } from '../../data/users';
import { TablaHistorial } from '../../components/shared/TablaHistorial';

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

    const [documentos] = useState<DocumentoAdjunto[]>([
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
            } catch (error) {
                console.error('Error cargando los detalles de la persona', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPersonaDetalle();
    }, [id]);

    // Lógica para traer los logs solo cuando el usuario decide verlos
    const handleToggleLogs = async () => {
        setMostrarLogs(!mostrarLogs);
        
        // Si ya hay logs cargados, no vuelve a consultar a la API
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

    if (loading) return <div className="p-8 text-center text-[11px] text-gray-500 font-sans">Cargando ficha del recurso...</div>;
    if (!persona) return <div className="p-8 text-center text-[11px] text-red-500 font-sans">No se encontró la persona solicitada.</div>;

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
            
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300">
                <User className="w-5 h-5 text-blue-600" />
                <h1 className="text-sm font-bold text-gray-800">
                    Ficha del recurso {persona.nombre} {persona.apellidos}
                </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-300 bg-gray-50">
                <button onClick={() => navigate('/rrhh/personas')} className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Atrás</button>
                <button onClick={() => navigate(`/rrhh/personas/editar/${id}`)} className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Editar</button>
                <button onClick={handleEliminar} className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Eliminar</button>
                <button className="px-2.5 py-1 text-[10px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm">Imprimir</button>
                
                {/* 👇 Botón Log ahora activa el despliegue */}
                <button 
                    onClick={handleToggleLogs} 
                    className={`px-2.5 py-1 text-[10px] font-medium border rounded shadow-sm transition-colors ${mostrarLogs ? 'bg-[#006400] text-white border-[#006400]' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                >
                    Log
                </button>
            </div>

            <div className="p-4">
                <div className="border border-gray-300 bg-white">
                    
                    <div className="bg-[#006400] text-white font-bold px-4 py-2 text-xs">
                        Usuario del sistema
                    </div>

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
                                <DataRow label="Nombre completo" value={`${persona.nombre} ${persona.apellidos}`} />
                                <DataRow label="Tipo de recurso" value={persona.tipo_recurso || 'Usuario del sistema'} />
                                <DataRow label="Estado" value={persona.activo ? 'Activo' : 'Inactivo'} />
                            </div>
                        </div>

                        {/* SECCIÓN: Información Personal */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Contact className="w-4 h-4 text-gray-700" />
                                <h3 className="font-bold text-[12px] text-gray-900">Información Personal</h3>
                            </div>
                            <DataRow label="C.I." value={persona.cedula_identidad} />
                            <DataRow label="Domicilio" value={persona.domicilio} />
                            <DataRow label="Ciudad" value={persona.ciudad} />
                            <DataRow label="Teléfono" value={persona.telefono} />
                            <DataRow label="E-mail 1" value={persona.email_1} />
                        </div>

                        {/* 👇 NUEVA SECCIÓN: Log de actividades (Oculta por defecto) */}
                        {mostrarLogs && (
                            <div className="mt-8 border-t-2 border-gray-300 pt-6 animate-fade-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldAlert className="w-4 h-4 text-[#006400]" />
                                    <h3 className="font-bold text-[12px] text-gray-900">Log de actividades del recurso</h3>
                                </div>
                                {/* Llamamos a la tabla en Modo Local */}
                                <TablaHistorial logs={logsPersona} loading={loadingLogs} esGlobal={false} />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};