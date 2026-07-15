import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { Button } from '../../../shared/components/atoms/button';
import { tienePermiso, esRolRestringido } from '../../../shared/utils/auth';
import { Modal } from '../../../shared/components/molecules/Modal'; // 👇 Importamos el Modal
import { LaboratorioForm } from '../components/LaboratorioForm'; // 👇 Importamos el Formulario
import { useAlert } from '../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../shared/components/molecules/Toast';

export const LaboratoriosPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo');

    const esTecnicoLimitado = esRolRestringido();

    // 👇 Estados para controlar el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null);

    const fetchLaboratorios = async () => {
        try {
            setLoading(true);
            const response = await api.get('/laboratorios');
            setLaboratorios(response.data);
        } catch (error) {
            console.error('Error cargando laboratorios', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLaboratorios();
    }, []);

    const filtrados = laboratorios.filter(lab => {
        if (filtroEstado === 'activo' && !lab.activo) return false;
        if (filtroEstado === 'inactivo' && lab.activo) return false;
        
        return (lab.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
               (lab.codigo || '').toLowerCase().includes(busqueda.toLowerCase());
    });

    const handleEliminar = async (id: number) => {
        if (!await confirm({ title: 'Confirmar', message: '¿Está seguro de desactivar este laboratorio? Esto no eliminará sus equipos, pero lo marcará como inactivo.' })) return;
        try {
            await api.delete(`/laboratorios/${id}`);
            fetchLaboratorios();
            toast({ message: 'Laboratorio desactivado exitosamente.' });
        } catch (error) {
            console.error('Error eliminando', error);
            await alert({ title: 'Error', message: 'Error al desactivar el laboratorio' });
        }
    };

    const handleReactivar = async (id: number) => {
        if (!await confirm({ title: 'Confirmar', message: '¿Desea volver a activar este laboratorio?' })) return;
        try {
            await api.patch(`/laboratorios/${id}`, { activo: true });
            fetchLaboratorios();
            toast({ message: 'Laboratorio reactivado exitosamente.' });
        } catch (error) {
            console.error('Error al reactivar', error);
            await alert({ title: 'Error', message: 'Error al reactivar el laboratorio' });
        }
    };

    // 👇 Funciones para abrir el modal de Crear / Editar
    const openCreateModal = () => {
        setSelectedLabId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (id: number) => {
        setSelectedLabId(id);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laboratorios</h1>
                    <p className="text-sm text-gray-500">Gestión de laboratorios acreditados del Centro de Metrología</p>
                </div>
                
                {/* 👇 Aplicamos los nuevos estilos de botones unificados */}
                <div className="flex gap-3 items-center">
                    <Button variant="outline" onClick={() => navigate('/welcome')}>Volver al Inicio</Button>
                    
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/laboratorios/servicios')}
                        className="text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800"
                    >
                        Catálogo de Servicios
                    </Button>

                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/laboratorios/equipos')}
                        className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                        Inventario Equipos
                    </Button>

                    {esTecnicoLimitado && (
                        <Button
                            variant="default"
                            onClick={() => navigate('/administrativo/recepciones')}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Ir a Mis Tareas de Calibración
                        </Button>
                    )}

                    {tienePermiso('Laboratorios', 5) && !esTecnicoLimitado && (
                        <Button variant="default" onClick={openCreateModal}>
                            + Nuevo Laboratorio
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-4 flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    className="w-full text-sm outline-none bg-transparent"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value as any)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm mr-4 outline-none"
                >
                    <option value="activo">Solo Activos</option>
                    <option value="inactivo">Solo Inactivos</option>
                    <option value="todos">Mostrar Todos</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Código</th>
                            <th className="px-6 py-4 font-semibold">Laboratorio</th>
                            <th className="px-6 py-4 font-semibold">Responsable Técnico</th>
                            <th className="px-6 py-4 font-semibold text-center">Estado</th>
                            <th className="px-6 py-4 font-semibold text-center">Acciones Rápidas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron laboratorios.</td></tr>
                        ) : (
                            filtrados.map(lab => (
                                <tr key={lab.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{lab.codigo || '-'}</td>
                                    <td className="px-6 py-4">{lab.nombre}</td>
                                    <td className="px-6 py-4">
                                        {lab.responsable ? `${lab.responsable.nombre} ${lab.responsable.apellidos}` : <span className="text-gray-400 italic">Sin asignar</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${lab.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {lab.activo ? 'Operativo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2 items-center">
                                            <button 
                                                onClick={() => navigate(`/laboratorios/equipos?laboratorio_id=${lab.id}`)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100 mr-2"
                                                title="Ver equipos"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                                                Equipos
                                            </button>

                                            {tienePermiso('Laboratorios', 4) && (
                                                <button 
                                                    onClick={() => openEditModal(lab.id)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1"
                                                >
                                                    Editar
                                                </button>
                                            )}

                                            {lab.activo && tienePermiso('Laboratorios', 5) && (
                                                <button 
                                                    onClick={() => handleEliminar(lab.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1"
                                                >
                                                    Desactivar
                                                </button>
                                            )}
                                            
                                            {!lab.activo && tienePermiso('Laboratorios', 4) && (
                                                <button 
                                                    onClick={() => handleReactivar(lab.id)}
                                                    className="text-green-600 hover:text-green-800 font-medium text-xs px-2 py-1"
                                                >
                                                    Reactivar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 👇 Inyección del Modal para Crear/Editar */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={selectedLabId ? "Editar Laboratorio" : "Registrar Nuevo Laboratorio"}
            >
                <LaboratorioForm 
                    laboratorioId={selectedLabId} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchLaboratorios} // Recarga la tabla si fue un éxito
                />
            </Modal>

        </div>
    );
};