import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import PrintHeader  from '../../../../shared/components/organisms/PrintHeader';
import api from '../../../../core/api/axios';
import FichaRol from '../../components/FichaRol';
import { tienePermiso } from '../../../../shared/utils/auth';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../../shared/utils/ids';

export const DetalleRolPage = () => {
    const { id: rawId } = useParams<{ id: string }>(); const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [rol, setRol] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [mostrarLogs, setMostrarLogs] = useState(false);
    const [logsRol, setLogsRol] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        const fetchRol = async () => {
            try {
                const response = await api.get(`/roles/${id}`);
                setRol(response.data);
            } catch (error) {
                console.error('Error al cargar', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRol();
    }, [id]);

    const handleToggleLogs = async () => {
        setMostrarLogs(!mostrarLogs);
        if (!mostrarLogs && logsRol.length === 0) {
            setLoadingLogs(true);
            try {
                const response = await api.get(`/auditoria/rol/${id}`);
                setLogsRol(response.data);
            } catch (error) {
                console.error('Error al cargar logs', error);
            } finally {
                setLoadingLogs(false);
            }
        }
    };

    const handleEliminar = async () => {
        const ok = await confirm({ message: '¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?' });
        if (!ok) return;
        try {
            await api.delete(`/roles/${id}`);
            toast({ message: 'El recurso ha sido inactivado correctamente.' });
            navigate('/rrhh/roles');
        } catch (error) {
            console.error('Error al inactivar', error);
            await alert({ message: 'No se pudo desactivar el recurso. Inténtelo de nuevo.' });
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;
    if (!rol) return <div className="p-4">Rol no encontrado.</div>;

    return (
        <div className="flex flex-col gap-4">
            <PrintHeader subtitulo={`Ficha técnica del Rol: ${rol?.nombre}`} />
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50 print:hidden">
                <div className="flex flex-wrap gap-2 mb-2">
                    <Button variant="cancelar">Atrás</Button>
                    
                    {/* 👇 Ocultamos Eliminar (Nivel 5) */}
                    {tienePermiso('Recursos Humanos', 5) && (
                        <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                    )}
                    
                    <Button variant="clasico">Competencias</Button>
                    <Button variant="imprimir" />
                    <Button onClick={handleToggleLogs} variant="clasico">Log</Button>
                    <Button variant="clasico">Documentos</Button>
                    <Button variant="clasico">Procesos</Button>
                    
                    {/* 👇 Ocultamos Editar (Nivel 4) */}
                    {tienePermiso('Recursos Humanos', 4) && (
                        <Button onClick={() => navigate(`/rrhh/roles/editar/${encodeId(id)}`)} variant="clasico">Editar</Button>
                    )}
                </div>
            </div>
            <FichaRol rol={rol} mostrarLogs={mostrarLogs} logsRol={logsRol} loadingLogs={loadingLogs} />
        </div>
    );
};