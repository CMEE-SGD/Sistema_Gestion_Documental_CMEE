import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

export const DetalleRolPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rol, setRol] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-4">Cargando...</div>;
    if (!rol) return <div className="p-4">Rol no encontrado.</div>;

    const handleEliminar = async () => {
        const confirmar = window.confirm('¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?');
        if (!confirmar) return;

        try {
            // Llama al método DELETE del controlador que ejecuta el soft delete (activo: false)
            await api.delete(`/roles/${id}`);
            alert('El recurso ha sido inactivado correctamente.');
            navigate('/rrhh/roles'); // Redirige de vuelta al listado principal
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            alert('No se pudo desactivar el recurso. Inténtelo de nuevo.');
        }
    };

    const DataRow = ({ label, value }: { label: string, value: string }) => (
        <div className="grid grid-cols-[250px_1fr] border-b border-gray-200 p-3 items-start">
            <span className="font-bold text-gray-800">{label}:</span>
            <span className="whitespace-pre-wrap text-gray-700">{value || ''}</span>
        </div>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="bg-blue-50 text-[#8eb8d5] px-3 py-2 font-bold text-sm uppercase tracking-wider border-b border-gray-200">
            {title}
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 mb-2">
                <button onClick={() => navigate('/rrhh/roles')} className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Atrás</button>
                <button onClick={handleEliminar} className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                    Eliminar
                </button>
                <button className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Competencias</button>
                <button className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Imprimir</button>
                <button className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Log</button>
                <button className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Documentos</button>
                <button className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Procesos</button>
                <button onClick={() => navigate(`/rrhh/roles/editar/${id}`)} className="px-4 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">Editar</button>
            </div>

            <div className="border border-gray-300 shadow-sm text-sm bg-white">
                <div className="bg-[#8eb8d5] px-4 py-2 text-white font-bold text-lg">
                    Ver rol
                </div>
                
                <div className="bg-gray-50">
                    <DataRow label="Código" value={rol.codigo} />
                    <DataRow label="Nombre" value={rol.nombre} />
                    <DataRow label="Fecha última mod." value={new Date(rol.updatedAt).toLocaleDateString()} />
                    <DataRow label="Funciones" value={rol.funciones} />

                    <SectionHeader title="Educación" />
                    <DataRow label="Indispensable" value={rol.educacion_indispensable} />
                    <DataRow label="Deseable" value={rol.educacion_deseable} />

                    <SectionHeader title="Formación" />
                    <DataRow label="Indispensable" value={rol.formacion_indispensable} />
                    <DataRow label="Deseable" value={rol.formacion_deseable} />

                    <SectionHeader title="Capacidades y Competencias Personales" />
                    <DataRow label="Indispensable" value={rol.capacidades_indispensable} />
                    <DataRow label="Deseable" value={rol.capacidades_deseable} />

                    <SectionHeader title="Experiencia de Trabajo" />
                    <DataRow label="Indispensable" value={rol.experiencia_indispensable} />
                    <DataRow label="Deseable" value={rol.experiencia_deseable} />

                    <DataRow label="Orden" value={rol.orden?.toString()} />
                    <DataRow label="Estado" value={rol.activo ? 'Activo' : 'Inactivo'} />
                </div>
            </div>
        </div>
    );
};