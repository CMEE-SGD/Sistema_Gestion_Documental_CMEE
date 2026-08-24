import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import FichaPuesto from '../../components/FichaPuesto';
import { tienePermiso } from '../../../../shared/utils/auth';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';
import { encodeId, decodeId } from '../../../../shared/utils/ids';

export const DetallePuestoPage = () => {
    const { id: rawId } = useParams<{ id: string }>(); const id = decodeId(rawId!);
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [puesto, setPuesto] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [mostrarLogs, setMostrarLogs] = useState(false);
    const [logsPuesto, setLogsPuesto] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        const fetchPuesto = async () => {
            try {
                const response = await api.get(`/puestos/${id}`);
                setPuesto(response.data);
            } catch (error) {
                console.error('Error al cargar', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPuesto();
    }, [id]);

    const handleToggleLogs = async () => {
        setMostrarLogs(!mostrarLogs);
        if (!mostrarLogs && logsPuesto.length === 0) {
            setLoadingLogs(true);
            try {
                const response = await api.get(`/auditoria/puesto/${id}`);
                setLogsPuesto(response.data);
            } catch (error) {
                console.error('Error al cargar logs del puesto', error);
            } finally {
                setLoadingLogs(false);
            }
        }
    };

    const handleEliminar = async () => {
        const ok = await confirm({ message: '¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?' });
        if (!ok) return;
        try {
            await api.delete(`/puestos/${id}`);
            toast({ message: 'El recurso ha sido inactivado correctamente.' });
            navigate('/rrhh/puestos');
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            await alert({ message: 'No se pudo desactivar el recurso. Inténtelo de nuevo.' });
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;
    if (!puesto) return <div className="p-4">Puesto no encontrado.</div>;

    return (
        <div className="flex flex-col gap-4">
            <PrintHeader subtitulo={`Ficha técnica del Puesto: ${puesto?.nombre}`} />
            
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50 print:hidden">
                <div className="flex flex-wrap gap-2 mb-2">
                    <Button variant="cancelar">Atrás</Button>
                    
                    {/* 👇 Ocultamos Eliminar (Nivel 5) */}
                    {tienePermiso('Recursos Humanos', 5) && (
                        <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                    )}
                    
                    <Button variant="imprimir"/>
                    <Button onClick={handleToggleLogs} variant="clasico">Log</Button>
                    
                    {/* 👇 Ocultamos Editar (Nivel 4) */}
                    {tienePermiso('Recursos Humanos', 4) && (
                        <Button onClick={() => navigate(`/rrhh/puestos/editar/${encodeId(id)}`)} variant="clasico">Editar</Button>
                    )}
                </div>
            </div>

            <FichaPuesto 
                puesto={puesto}
                mostrarLogs={mostrarLogs}
                logsPuesto={logsPuesto}
                loadingLogs={loadingLogs}
            />
        </div>
    );
};