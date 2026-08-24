import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../../core/api/axios';
import { Button } from '../../../../shared/components/atoms/button';
import { tienePermiso, esRolRestringido } from '../../../../shared/utils/auth';
import { Modal } from '../../../../shared/components/molecules/Modal';
import { EquipoForm } from '../../components/EquipoForm';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const EquiposPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const labIdFiltro = searchParams.get('laboratorio_id');

    const [equipos, setEquipos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo'); 

    // 👇 Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEquipoId, setSelectedEquipoId] = useState<number | null>(null);

    const fetchEquipos = async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await api.get('/equipos');
            setEquipos(response.data);
        } catch (err) {
            console.error('Error cargando equipos', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipos();
    }, []);

    const filtrados = equipos.filter(eq => {
        if (filtroEstado === 'activo' && !eq.activo) return false;
        if (filtroEstado === 'inactivo' && eq.activo) return false;

        const coincideTexto = (eq.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                              (eq.codigo || '').toLowerCase().includes(busqueda.toLowerCase());
        const coincideLab = labIdFiltro ? eq.laboratorio_id === parseInt(labIdFiltro) : true;
        
        return coincideTexto && coincideLab;
    });

    const getEstadoColor = (estado: string) => {
        switch(estado) {
            case 'OPERATIVO': return 'bg-green-100 text-green-700 border-green-200';
            case 'EN_CALIBRACION': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'FUERA_DE_SERVICIO': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleEliminar = async (id: number) => {
        if (!await confirm({ title: 'Confirmar', message: '¿Está seguro de desactivar este equipo?' })) return;
        try {
            await api.delete(`/equipos/${id}`);
            fetchEquipos();
            toast({ message: 'Equipo desactivado exitosamente.' });
        } catch (error) {
            await alert({ title: 'Error', message: 'Error al desactivar el equipo' });
        }
    };

    const handleReactivar = async (id: number) => {
        if (!await confirm({ title: 'Confirmar', message: '¿Desea volver a activar este equipo?' })) return;
        try {
            await api.patch(`/equipos/${id}/reactivar`);
            fetchEquipos();
            toast({ message: 'Equipo reactivado exitosamente.' });
        } catch (error) {
            await alert({ title: 'Error', message: 'Error al reactivar el equipo' });
        }
    };

    // 👇 Funciones para abrir modales
    const openCreateModal = () => {
        setSelectedEquipoId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (id: number) => {
        setSelectedEquipoId(id);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventario de Equipos</h1>
                    <p className="text-sm text-gray-500">{labIdFiltro ? 'Mostrando equipos filtrados por laboratorio' : 'Gestión de instrumentos por laboratorio'}</p>
                </div>
                
                {/* 👇 Botones unificados */}
                <div className="flex gap-3 items-center">
                    <Button variant="outline" onClick={() => navigate('/laboratorios')}>Ver Laboratorios</Button>
                    
                    {labIdFiltro && (
                        <Button variant="outline" onClick={() => navigate('/laboratorios/equipos')}>
                            Ver Todos
                        </Button>
                    )}
                    
                    {tienePermiso('Laboratorios', 5) && !esRolRestringido() && (
                        <Button variant="default" onClick={openCreateModal}>
                            + Nuevo Equipo
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
                    type="text" placeholder="Buscar por código o nombre..."
                    className="w-full text-sm outline-none bg-transparent"
                    value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Código CMEE</th>
                            <th className="px-6 py-4 font-semibold">Instrumento</th>
                            <th className="px-6 py-4 font-semibold">Laboratorio</th>
                            <th className="px-6 py-4 font-semibold text-center">Estado Físico</th>
                            <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="p-8 text-center text-red-500">
                                No se pudo cargar el inventario de equipos.{' '}
                                <button onClick={fetchEquipos} className="underline font-medium hover:text-red-700">Reintentar</button>
                            </td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron equipos.</td></tr>
                        ) : (
                            filtrados.map(eq => (
                                <tr key={eq.id} className={`hover:bg-gray-50 transition-colors ${!eq.activo ? 'opacity-60 bg-gray-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{eq.codigo}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{eq.nombre}</div>
                                        <div className="text-xs text-gray-500">{eq.marca || '-'} / {eq.modelo || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                                            {eq.laboratorio?.nombre || 'Desconocido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${!eq.activo ? 'bg-gray-100 text-gray-500 border-gray-200' : getEstadoColor(eq.estado)}`}>
                                            {!eq.activo ? 'INACTIVO' : eq.estado.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            {tienePermiso('Laboratorios', 4) && (
                                                <button onClick={() => openEditModal(eq.id)} className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1">Editar</button>
                                            )}
                                            
                                            {eq.activo && tienePermiso('Laboratorios', 5) && (
                                                <button onClick={() => handleEliminar(eq.id)} className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1">Desactivar</button>
                                            )}
                                            
                                            {!eq.activo && tienePermiso('Laboratorios', 5) && (
                                                <button onClick={() => handleReactivar(eq.id)} className="text-green-600 hover:text-green-800 font-medium text-xs px-2 py-1">Reactivar</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 👇 Modal inyectado */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedEquipoId ? "Modificar Instrumento" : "Registrar Nuevo Instrumento"}
            >
                <EquipoForm 
                    equipoId={selectedEquipoId} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchEquipos}
                />
            </Modal>
        </div>
    );
};