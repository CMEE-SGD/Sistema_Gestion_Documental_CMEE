import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/atoms/button';
import { ShieldAlert } from 'lucide-react';
import api from '../../../../core/api/axios';
import { TablaHistorial } from '../../../../shared/components/organisms/TablaHistorial';
import PrintHeader  from '../../../../shared/components/organisms/PrintHeader';


export const DetallePuestoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [puesto, setPuesto] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Estados para el Log
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

    // Función para manejar el despliegue de la tabla de auditoría
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

    if (loading) return <div className="p-4">Cargando...</div>;
    if (!puesto) return <div className="p-4">Puesto no encontrado.</div>;

    const handleEliminar = async () => {
        const confirmar = window.confirm('¿Está seguro de que desea eliminar (desactivar) este recurso del sistema?');
        if (!confirmar) return;

        try {
            await api.delete(`/puestos/${id}`);
            alert('El recurso ha sido inactivado correctamente.');
            navigate('/rrhh/puestos');
        } catch (error) {
            console.error('Error al inactivar el recurso', error);
            alert('No se pudo desactivar el recurso. Inténtelo de nuevo.');
        }
    };

    const HTMLRow = ({ label, htmlContent }: { label: string, htmlContent: string }) => (
        <div className="grid grid-cols-[250px_1fr] border-b border-gray-200 p-3 items-start min-h-[48px]">
            <span className="font-bold text-gray-800">{label}:</span>
            <div
                className="text-gray-700 max-w-none [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2"
                dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
            />
        </div>
    );

    const TextRow = ({ label, value }: { label: string, value: string }) => (
        <div className="grid grid-cols-[250px_1fr] border-b border-gray-200 p-3 items-start min-h-[48px]">
            <span className="font-bold text-gray-800">{label}:</span>
            <span className="text-gray-700 whitespace-pre-wrap">{value || ''}</span>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <PrintHeader
                subtitulo={`Ficha técnica del Puesto: ${puesto?.nombre}`}
            />
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-gray-300 bg-gray-50 print:hidden">
                <div className="flex flex-wrap gap-2 mb-2">
                    <Button variant="cancelar">Atrás</Button>
                    <Button onClick={handleEliminar} variant="clasico">Eliminar</Button>
                    <Button variant="imprimir"/>
                    <Button onClick={handleToggleLogs} variant="clasico">Log</Button>
                    <Button onClick={() => navigate(`/rrhh/puestos/editar/${id}`)} variant="clasico">
                        Editar
                    </Button>
                </div>
            </div>

            <div className="border border-gray-300 shadow-sm text-sm bg-white max-w-6xl">
                <div className="bg-[#8eb8d5] px-4 py-2 text-white font-bold text-lg">
                    Puesto {puesto.nombre}
                </div>

                <div className="bg-gray-50">
                    <TextRow label="Código" value={puesto.codigo} />
                    <TextRow label="Nombre" value={puesto.nombre} />
                    <TextRow label="Fecha última mod." value={new Date(puesto.fecha_ultima_mod || puesto.updatedAt).toLocaleDateString()} />

                    <HTMLRow label="Educación" htmlContent={puesto.educacion} />
                    <HTMLRow label="Formación" htmlContent={puesto.formacion} />
                    <HTMLRow label="Habilidad" htmlContent={puesto.habilidad} />
                    <HTMLRow label="Experiencia" htmlContent={puesto.experiencia} />
                    <HTMLRow label="ConocimientoTécnico" htmlContent={puesto.conocimiento_tecnico} />
                    <HTMLRow label="Calificación" htmlContent={puesto.calificacion} />
                    <HTMLRow label="Autoridad" htmlContent={puesto.autoridad} />
                    <HTMLRow label="Responsabilidades" htmlContent={puesto.responsabilidades} />
                    <HTMLRow label="Función principal" htmlContent={puesto.funcion_principal} />
                    <HTMLRow label="Funciones alternas" htmlContent={puesto.funciones_alternas} />
                    <HTMLRow label="Funciones" htmlContent={puesto.funciones} />

                    <div className="bg-blue-50 text-[#8eb8d5] px-3 py-2 font-bold text-sm uppercase tracking-wider border-b border-gray-200">
                        PERFIL PROFESIONAL
                    </div>

                    <div className="px-3 py-2 font-bold text-gray-700 bg-white border-b border-gray-100">Educación</div>
                    <TextRow label="Indispensable" value={puesto.perfil_educacion_indispensable} />

                    <div className="px-3 py-2 font-bold text-gray-700 bg-white border-b border-gray-100 border-t">Formación</div>
                    <TextRow label="Deseable" value={puesto.perfil_formacion_deseable} />

                    <div className="px-3 py-2 font-bold text-gray-700 bg-white border-b border-gray-100 border-t">Capacidades y Competencias Personales</div>
                    <TextRow label="Deseable" value={puesto.perfil_capacidades_deseable} />

                    <div className="px-3 py-2 font-bold text-gray-700 bg-white border-b border-gray-100 border-t">Experiencia de Trabajo</div>
                    <TextRow label="Deseable" value={puesto.perfil_experiencia_deseable} />

                    <TextRow label="Orden" value={puesto.orden?.toString()} />
                    <TextRow label="Estado" value={puesto.activo ? 'Activo' : 'Inactivo'} />
                </div>
            </div>

            {/* Renderizado condicional de la tabla de auditoría */}
            {
                mostrarLogs && (
                    <div className="border border-gray-300 shadow-sm bg-white mt-2 p-4 animate-fade-in max-w-6xl">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <ShieldAlert className="w-5 h-5 text-[#006400]" />
                            <h3 className="font-bold text-sm text-gray-900 uppercase">Log de actividades del puesto</h3>
                        </div>
                        <TablaHistorial logs={logsPuesto} loading={loadingLogs} esGlobal={false} />
                    </div>
                )
            }
        </div >
    );
};