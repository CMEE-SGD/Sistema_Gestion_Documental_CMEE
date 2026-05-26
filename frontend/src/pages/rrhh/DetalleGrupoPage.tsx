import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            // Llama al método DELETE del controlador que ejecuta el soft delete (activo: false)
            await api.delete(`/departamentos/${id}`);
            alert('El recurso ha sido inactivado correctamente.');
            navigate('/rrhh/grupos'); // Redirige de vuelta al listado principal
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            alert('No se pudo desactivar el recurso. Inténtelo de nuevo.');
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;
    if (!departamento) return <div className="p-4">Grupo no encontrado.</div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="font-bold text-gray-800 text-sm border-b pb-2">
                Grupo {departamento.nombre}
            </div>

            {/* Botonera superior */}
            <div className="flex gap-2 mb-2">
                <button onClick={() => navigate('/rrhh/grupos')} className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                    Atrás
                </button>
                <button onClick={() => navigate(`/rrhh/grupos/editar/${departamento.id}`)} className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                    Editar
                </button>
                <button onClick={handleEliminar} className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                    Eliminar
                </button>
                <button className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Imprimir</button>
                <button className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Documentos</button>
            </div>

            {/* Tabla de detalle */}
            <div className="border border-gray-300 shadow-sm text-sm bg-white">
                <div className="bg-[#8eb8d5] px-4 py-2 text-white font-bold text-lg">
                    Editar grupo de organización {departamento.nombre}
                </div>
                
                <div className="bg-gray-50">
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Nombre:</span>
                        <span>{departamento.nombre}</span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Descripción:</span>
                        <span>{departamento.descripcion}</span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Código:</span>
                        <span>{departamento.codigo}</span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Orden:</span>
                        <span>{departamento.orden}</span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Tipo:</span>
                        <span>{departamento.tipo || 'Departamento'}</span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Grupo enlazado:</span>
                        <span>{departamento.padre?.nombre || ''}</span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Responsable:</span>
                        <span>
                        {departamento.responsable ? `${departamento.responsable.nombre} ${departamento.responsable.apellidos}` : ''}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] border-b border-gray-300 p-2 items-center">
                        <span className="font-bold">Estado:</span>
                        <span>{departamento.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    
                    <div className="grid grid-cols-[180px_1fr] p-2 items-start">
                        <span className="font-bold pt-1">Recursos:</span>
                        <div className="flex flex-col">
                        {departamento.puestos_asignados?.length > 0 ? (
                            departamento.puestos_asignados.map((asignacion: any, index: number) => (
                            <span key={index}>
                                {asignacion.persona.nombre} {asignacion.persona.apellidos} ({asignacion.puesto.nombre})
                            </span>
                            ))
                        ) : (
                            <span className="text-gray-500 italic">Sin recursos asignados</span>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};