import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PrintHeader } from '../../components/shared/PrintHeader';
import { Button } from '../../components/ui/button';
import api from '../../lib/axios';

export const DetalleGrupoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
        const confirmar = window.confirm('¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?');
        if (!confirmar) return;

        try {
            await api.delete(`/departamentos/${id}`);
            alert('El recurso ha sido inactivado correctamente.');
            navigate('/rrhh/grupos'); 
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            alert('No se pudo desactivar el recurso. Inténtelo de nuevo.');
        }
    };

    if (loading) return <div className="p-4 text-sm text-gray-500">Cargando...</div>;
    if (!departamento) return <div className="p-4 text-sm text-red-500">Grupo no encontrado.</div>;

    return (
        <div className="flex flex-col gap-4 print:bg-white print:m-0">
            
            {/* CABECERA DE IMPRESIÓN */}
            <PrintHeader
                subtitulo={`Ficha técnica de: ${departamento?.nombre}`}
            />
            
            {/* Título web (oculto en impresión) */}
            <div className="font-bold text-gray-800 text-sm border-b pb-2 print:hidden">
                Grupo {departamento.nombre}
            </div>

            {/* BOTONERA (Oculta en impresión) */}
            <div className="flex gap-2 mb-2 print:hidden">
                <Button variant="cancelar">Atrás</Button>
                <Button onClick={() => navigate(`/rrhh/grupos/editar/${departamento.id}`)} variant="clasico">Editar</Button>
                <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                <Button variant="imprimir" />
            </div>

            {/* TABLA DE DETALLE */}
            {/* Agregamos padding para impresión y quitamos sombras */}
            <div className="border border-gray-300 shadow-sm text-sm bg-white print:shadow-none print:border-gray-400 print:mt-4">
                
                <div className="bg-[#8eb8d5] px-4 py-2 text-white font-bold text-lg print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
                    Información del grupo de organización
                </div>

                <div className="bg-gray-50 print:bg-white">
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                        <span className="font-bold">Nombre:</span>
                        <span>{departamento.nombre}</span>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                        <span className="font-bold">Descripción:</span>
                        <span>{departamento.descripcion || '-'}</span>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                        <span className="font-bold">Código:</span>
                        <span>{departamento.codigo || '-'}</span>
                    </div>

                    {/* Ocultamos el campo "Orden" al imprimir, como vimos antes */}
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center print:hidden">
                        <span className="font-bold">Orden:</span>
                        <span>{departamento.orden}</span>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                        <span className="font-bold">Tipo:</span>
                        <span>{departamento.tipo || 'Departamento'}</span>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                        <span className="font-bold">Grupo enlazado:</span>
                        <span>{departamento.padre?.nombre || '-'}</span>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                        <span className="font-bold">Responsable:</span>
                        <span>
                            {departamento.responsable ? `${departamento.responsable.nombre} ${departamento.responsable.apellidos}` : '-'}
                        </span>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 print:border-gray-400 p-2 items-center">
                        <span className="font-bold">Estado:</span>
                        <span className={departamento.activo ? 'text-green-700 print:text-black font-medium' : 'text-red-600 print:text-black font-medium'}>
                            {departamento.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    {/* FILA CORREGIDA PARA RECURSOS / PERSONAL ASIGNADO */}
                    <div className="grid grid-cols-[180px_1fr] p-3 items-start">
                        <span className="font-bold mt-1">Recursos asignados:</span>
                        <div>
                            {departamento.puestos_asignados && departamento.puestos_asignados.length > 0 ? (
                                <ul className="flex flex-col gap-1.5">
                                    {departamento.puestos_asignados.map((asignacion: any, i: number) => (
                                        <li key={i} className="text-gray-800 print:text-black leading-tight flex flex-col sm:flex-row sm:items-center gap-1">
                                            <span className="font-medium">
                                                • {asignacion.persona?.apellidos} {asignacion.persona?.nombre}
                                            </span>
                                            <span className="text-gray-500 print:text-gray-700 text-xs">
                                                - {asignacion.puesto?.nombre || 'Sin cargo asignado'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-gray-500 italic text-sm">No hay personal asignado a este grupo.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};