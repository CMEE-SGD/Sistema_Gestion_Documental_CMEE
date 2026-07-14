import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import api from '../../../../core/api/axios';
import { Persona } from '../../interfaces/persona.interface';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import { Button } from '../../../../shared/components/atoms/button';
import FichaPersona from '../../components/FichaPersona';
import { tienePermiso } from '../../../../shared/utils/auth';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

interface DocumentoAdjunto {
    id: number;
    nombre_archivo: string;
    ruta: string;
}

export const DetallePersonaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [persona, setPersona] = useState<Persona | null>(null);
    const [loading, setLoading] = useState(true);

    const [mostrarLogs, setMostrarLogs] = useState(false);
    const [logsPersona, setLogsPersona] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [documentos, setDocumentos] = useState<DocumentoAdjunto[]>([]);

    useEffect(() => {
        const fetchPersonaDetalle = async () => {
            try {
                const response = await api.get(`/personas/${id}`);
                setPersona(response.data);
                if (response.data.documentos) setDocumentos(response.data.documentos);
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
        const ok = await confirm({ message: '¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?' });
        if (!ok) return;
        try {
            await api.delete(`/personas/${id}`);
            toast({ message: 'El recurso ha sido inactivado correctamente.' });
            navigate('/rrhh/personas');
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            await alert({ message: 'No se pudo desactivar el recurso. Inténtelo de nuevo.' });
        }
    };

    if (loading) return <div className="p-8 text-center text-[11px] text-gray-500 font-sans">Cargando ficha del recurso...</div>;
    if (!persona) return <div className="p-8 text-center text-[11px] text-red-500 font-sans">No se encontró la persona solicitada.</div>;

    return (
        <div className="flex flex-col bg-white min-h-screen font-sans">
            <PrintHeader subtitulo={`Ficha técnica de: ${persona?.nombre} ${persona?.apellidos}`} />
            
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-300 print:hidden">
                <User className="w-5 h-5 text-blue-600" />
                <h1 className="text-sm font-bold text-gray-800">
                    Ficha del recurso {persona.nombre} {persona.apellidos}
                </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-300 bg-gray-50 print:hidden">
                <Button variant="clasico" onClick={() => navigate('/rrhh/personas')}> Atrás</Button>
                
                {/* 👇 Ocultamos Editar (Nivel 4) */}
                {tienePermiso('Recursos Humanos', 4) && (
                    <Button onClick={() => navigate(`/rrhh/personas/editar/${id}`)} variant="clasico">Editar</Button>
                )}
                
                {/* 👇 Ocultamos Eliminar (Nivel 5) */}
                {tienePermiso('Recursos Humanos', 5) && (
                    <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                )}
                
                <Button onClick={() => navigate(`/rrhh/personas/${id}/documentos`)} variant="clasico">Documentos</Button>
                <Button variant="imprimir" />
                <Button onClick={handleToggleLogs} variant="clasico">Log</Button>
            </div>

            <div className="p-4 print:p-0 print:my-6">
                <FichaPersona 
                    persona={persona} 
                    documentos={documentos}
                    mostrarLogs={mostrarLogs}
                    logsPersona={logsPersona}
                    loadingLogs={loadingLogs}
                />
            </div>
        </div>
    );
};