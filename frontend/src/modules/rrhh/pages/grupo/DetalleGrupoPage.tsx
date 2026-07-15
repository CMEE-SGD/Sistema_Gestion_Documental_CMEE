import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrintHeader from '../../../../shared/components/organisms/PrintHeader';
import { Button } from '../../../../shared/components/atoms/button';
import api from '../../../../core/api/axios';
import { FichaGrupo } from '../../components/FichaGrupo';
import { tienePermiso } from '../../../../shared/utils/auth';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const DetalleGrupoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [departamento, setDepartamento] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const response = await api.get(`/departamentos/${id}`);
                setDepartamento(response.data);
            } catch (error) {
                console.error('Error al cargar detalle:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetalle();
    }, [id]);

    const handleEliminar = async () => {
        const ok = await confirm({ message: '¿Está seguro de que desea eliminar (desactivar) este recurso?' });
        if (!ok) return;
        try {
            await api.delete(`/departamentos/${id}`);
            toast({ message: 'Inactivado correctamente.' });
            navigate('/rrhh/grupos'); 
        } catch (error) {
            await alert({ message: 'No se pudo desactivar el recurso.' });
        }
    };

    if (loading) return <div className="p-4 text-sm text-gray-500">Cargando...</div>;
    if (!departamento) return <div className="p-4 text-sm text-red-500">Grupo no encontrado.</div>;

    return (
        <div className="flex flex-col gap-4 print:bg-white print:m-0">
            <PrintHeader subtitulo={`Ficha técnica de: ${departamento?.nombre}`} />
            
            <div className="font-bold text-gray-800 text-sm border-b pb-2 print:hidden">
                Grupo {departamento.nombre}
            </div>

            <div className="flex gap-2 mb-2 print:hidden">
                <Button variant="cancelar" onClick={() => navigate('/rrhh/grupos')}>Atrás</Button>
                
                {/* 👇 Ocultamos Editar (Nivel 4) */}
                {tienePermiso('Recursos Humanos', 4) && (
                    <Button onClick={() => navigate(`/rrhh/grupos/editar/${departamento.id}`)} variant="clasico">Editar</Button>
                )}
                
                {/* 👇 Ocultamos Eliminar (Nivel 5) */}
                {tienePermiso('Recursos Humanos', 5) && (
                    <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                )}
                
                <Button variant="imprimir" />
            </div>

            <FichaGrupo departamento={departamento} />
        </div>
    );
};