import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import PrintHeader  from '../../../../shared/components/organisms/PrintHeader';
import { ShieldAlert } from 'lucide-react';
import api from '../../../../core/api/axios';
import { TablaHistorial } from '../../../../shared/components/organisms/TablaHistorial';

export const DetalleRolPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rol, setRol] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Estados para el Log
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

    // Función para manejar el despliegue de la tabla de auditoría
    const handleToggleLogs = async () => {
        setMostrarLogs(!mostrarLogs);
        if (!mostrarLogs && logsRol.length === 0) {
            setLoadingLogs(true);
            try {
                const response = await api.get(`/auditoria/rol/${id}`);
                setLogsRol(response.data);
            } catch (error) {
                console.error('Error al cargar logs del rol', error);
            } finally {
                setLoadingLogs(false);
            }
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;
    if (!rol) return <div className="p-4">Rol no encontrado.</div>;

    const handleEliminar = async () => {
        const confirmar = window.confirm('¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?');
        if (!confirmar) return;

        try {
            await api.delete(`/roles/${id}`);
            alert('El recurso ha sido inactivado correctamente.');
            navigate('/rrhh/roles');
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            alert('No se pudo desactivar el recurso. Inténtelo de nuevo.');
        }
    };

    const DataRow = ({ label, value, className = "" }: { label: string, value?: string, className?: string }) => (
    <div className={`grid grid-cols-[250px_1fr] border-b border-gray-200 p-3 items-start ${className}`}>
        <span className="font-bold text-gray-800">{label}:</span>
        <span className="whitespace-pre-wrap text-gray-700">{value || '-'}</span>
    </div>
);

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="bg-blue-50 text-[#8eb8d5] px-3 py-2 font-bold text-sm uppercase tracking-wider border-b border-gray-200">
            {title}
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <PrintHeader
                subtitulo={`Ficha técnica del Rol: ${rol?.nombre}`}
            />
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50 print:hidden">
                <div className="flex flex-wrap gap-2 mb-2">
                    <Button variant="cancelar">Atrás</Button>
                    <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                    <Button variant="clasico">Competencias</Button>
                    <Button variant="imprimir" />
                    <Button onClick={handleToggleLogs} variant="clasico">Log</Button>
                    <Button variant="clasico">Documentos</Button>
                    <Button variant="clasico">Procesos</Button>
                    <Button onClick={() => navigate(`/rrhh/roles/editar/${id}`)} variant="clasico">Editar</Button>
                </div>
            </div>

            <div className="border border-gray-300 shadow-sm text-sm bg-white">
                <div className="bg-[#8eb8d5] px-4 py-2 text-white font-bold text-lg">
                    Información
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

                    <DataRow label="Orden" value={rol.orden?.toString()} className="print:hidden" />
                    <DataRow label="Estado" value={rol.activo ? 'Activo' : 'Inactivo'} />
                </div>
            </div>


            {/* Renderizado condicional de la tabla de auditoría */}
            {mostrarLogs && (
                <div className="border border-gray-300 shadow-sm bg-white mt-2 p-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <ShieldAlert className="w-5 h-5 text-[#006400]" />
                        <h3 className="font-bold text-sm text-gray-900 uppercase">Log de actividades del rol</h3>
                    </div>
                    <TablaHistorial logs={logsRol} loading={loadingLogs} esGlobal={false} />
                </div>
            )}
        </div>
    );
};