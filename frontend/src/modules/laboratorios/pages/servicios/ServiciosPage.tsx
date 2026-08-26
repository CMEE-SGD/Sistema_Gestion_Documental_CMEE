import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../core/api/axios';
import { Button } from '../../../../shared/components/atoms/button';
import { tienePermiso, esRolRestringido } from '../../../../shared/utils/auth';
import { Modal } from '../../../../shared/components/molecules/Modal';
import { ServicioForm } from '../../components/ServicioForm';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const ServiciosPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [servicios, setServicios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');

    // 👇 Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchServicios = async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await api.get('/servicios');
            setServicios(response.data);
        } catch (err) {
            console.error('Error cargando servicios', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicios();
    }, []);

    const filtrados = servicios.filter(srv => {
        if (filtroEstado === 'activo' && !srv.activo) return false;
        if (filtroEstado === 'inactivo' && srv.activo) return false;

        return (srv.magnitud || '').toLowerCase().includes(busqueda.toLowerCase());
    });

    const handleEliminar = async (id: number) => {
        if (!await confirm({ title: 'Confirmar', message: '¿Está seguro de desactivar este servicio?' })) return;
        try {
            await api.delete(`/servicios/${id}`);
            fetchServicios();
            toast({ message: 'Servicio desactivado exitosamente.' });
        } catch (error) {
            await alert({ title: 'Error', message: 'Error al desactivar el servicio' });
        }
    };

    const handleReactivar = async (id: number) => {
        if (!await confirm({ title: 'Confirmar', message: '¿Desea volver a activar este servicio?' })) return;
        try {
            await api.patch(`/servicios/${id}/reactivar`);
            fetchServicios();
            toast({ message: 'Servicio reactivado exitosamente.' });
        } catch (error) {
            await alert({ title: 'Error', message: 'Error al reactivar el servicio' });
        }
    };

    const openModal = (id: number | null) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Catálogo de Servicios</h1>
                    <p className="text-sm text-gray-500">Procedimientos de calibración ofertados</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/laboratorios')}>Ver Laboratorios</Button>
                    
                    {tienePermiso('Laboratorios', 5) && !esRolRestringido() && (
                        <Button variant="default" onClick={() => openModal(null)}>
                            + Nuevo Servicio
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-4 flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full max-w-2xl">
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value as any)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm mr-4 outline-none"
                >
                    <option value="activo">Solo Activos</option>
                    <option value="inactivo">Solo Inactivos</option>
                    <option value="todos">Mostrar Todos</option>
                </select>

                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                    type="text" placeholder="Buscar por procedimiento..."
                    className="w-full text-sm outline-none bg-transparent"
                    value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Procedimiento</th>
                            <th className="px-6 py-4 font-semibold">Laboratorio Ejecutor</th>
                            <th className="px-6 py-4 font-semibold text-center">Estado</th>
                            <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} className="p-8 text-center text-red-500">
                                No se pudo cargar el catálogo de servicios.{' '}
                                <button onClick={fetchServicios} className="underline font-medium hover:text-red-700">Reintentar</button>
                            </td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">No se encontraron servicios.</td></tr>
                        ) : (
                            filtrados.map(srv => (
                                <tr key={srv.id} className={`hover:bg-gray-50 transition-colors ${!srv.activo ? 'opacity-60 bg-gray-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{srv.magnitud || 'N/A'}</td>
                                    <td className="px-6 py-4">{srv.laboratorio?.nombre || 'Desconocido'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${srv.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {srv.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            {tienePermiso('Laboratorios', 4) && (
                                                <button onClick={() => openModal(srv.id)} className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1">Editar</button>
                                            )}
                                            {srv.activo && tienePermiso('Laboratorios', 5) && (
                                                <button onClick={() => handleEliminar(srv.id)} className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1">Desactivar</button>
                                            )}
                                            {!srv.activo && tienePermiso('Laboratorios', 5) && (
                                                <button onClick={() => handleReactivar(srv.id)} className="text-green-600 hover:text-green-800 font-medium text-xs px-2 py-1">Reactivar</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedId ? "Editar Servicio" : "Registrar Servicio"}>
                <ServicioForm servicioId={selectedId} onClose={() => setIsModalOpen(false)} onSuccess={fetchServicios} />
            </Modal>
        </div>
    );
};