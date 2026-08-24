import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import api from '../../../../core/api/axios';
import { useAlert } from '../../../../shared/components/molecules/AlertModal';
import { useToast } from '../../../../shared/components/molecules/Toast';

export const ConfiguracionGestorPage = () => {
    const navigate = useNavigate();
    const { alert, confirm } = useAlert();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('Librerías');

    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editItem, setEditItem] = useState<any>(null);
    const [editForm, setEditForm] = useState({ nombre: '', descripcion: '', codigo: '', activo: true });
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    const fetchDatos = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/carpetas');
            setCarpetas(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDatos();
    }, [fetchDatos]);

    // Filtramos los datos según su tipo
    const librerias = carpetas.filter(c => c.tipo === 'LIBRERIA');
    const areas = carpetas.filter(c => c.tipo === 'AREA');
    const subcarpetas = carpetas.filter(c => c.tipo === 'SUBCARPETA'); // Aquí están todas las subcarpetas

    const menuItems = ['Librerías', 'Áreas', 'Carpetas', 'Circuitos'];

    const handleAbrirEdicion = (item: any) => {
        setEditItem(item);
        setEditForm({
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
            codigo: item.codigo || '',
            activo: item.activo,
        });
    };

    const handleGuardarEdicion = async () => {
        if (!editItem) return;
        setGuardandoEdicion(true);
        try {
            await api.patch(`/carpetas/${editItem.id}`, {
                nombre: editForm.nombre,
                descripcion: editForm.descripcion,
                codigo: editForm.codigo,
                activo: editForm.activo,
            });
            toast({ message: 'Elemento actualizado correctamente' });
            setEditItem(null);
            window.dispatchEvent(new Event('refreshCarpetas'));
            fetchDatos();
        } catch (error) {
            console.error('Error al editar:', error);
            await alert({ message: 'Hubo un error al guardar los cambios.' });
        } finally {
            setGuardandoEdicion(false);
        }
    };

    const handleEliminar = async (item: any) => {
        const confirmacion = await confirm({
            title: 'Eliminar',
            message: `¿Está seguro de eliminar "${item.nombre}"? Esto también eliminará todas sus subcarpetas y documentos contenidos. Esta acción no se puede deshacer.`,
        });
        if (!confirmacion) return;

        try {
            await api.delete(`/carpetas/${item.id}`);
            toast({ message: 'Elemento eliminado correctamente' });
            window.dispatchEvent(new Event('refreshCarpetas'));
            fetchDatos();
        } catch (error) {
            console.error('Error al eliminar:', error);
            await alert({ message: 'Ocurrió un error al intentar eliminar. Verifique que no tenga contenido que lo impida.' });
        }
    };

    // Renderiza una tabla genérica para mostrar los datos
    const renderTabla = (datos: any[]) => {
        if (loading) return <div className="text-gray-500 p-4">Cargando información...</div>;
        if (datos.length === 0) return <div className="text-gray-500 p-4">No hay datos disponibles.</div>;

        return (
            <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-left text-sm text-gray-800">
                    <thead className="bg-gray-100 font-bold text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Código</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map(item => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3">{item.id}</td>
                                <td className="p-3 font-semibold">{item.nombre}</td>
                                <td className="p-3">{item.codigo || '-'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleAbrirEdicion(item)} className="text-blue-600 hover:underline text-xs mr-3">Editar</button>
                                    <button onClick={() => handleEliminar(item)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Librerías':
                return renderTabla(librerias);
            case 'Áreas':
                return renderTabla(areas);
            case 'Carpetas':
                return renderTabla(subcarpetas);
            case 'Circuitos':
                return (
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-xl">⚙️</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Módulo en construcción</h3>
                        <p className="text-sm text-gray-500">La configuración de circuitos se desarrollará más adelante.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full h-full min-h-screen bg-gray-50">

            {/* Sidebar de Administración (Basado en la imagen) */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col shrink-0">
                <button
                    onClick={() => navigate('/gestordocumental')}
                    className="px-4 py-1.5 mb-6 border border-gray-300 rounded text-sm text-gray-700 font-medium bg-white hover:bg-gray-50 shadow-sm w-max transition-colors"
                >
                    Cerrar administración
                </button>

                <p className="text-[13px] text-gray-800 mb-4">Seleccione un elemento:</p>

                <ul className="flex flex-col gap-3">
                    {menuItems.map(item => (
                        <li
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`flex items-center gap-1.5 text-[14px] font-bold cursor-pointer transition-colors select-none ${
                                activeTab === item ? 'text-blue-700' : 'text-[#003366] hover:text-blue-600'
                            }`}
                        >
                            <ChevronRight className="w-4 h-4 shrink-0 stroke-[3]" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Contenedor Principal */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
                        Administración de {activeTab}
                    </h2>

                    {renderContent()}
                </div>
            </div>

            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                            <h3 className="font-bold text-sm text-gray-800">Editar {editItem.nombre}</h3>
                            <button onClick={() => setEditItem(null)} className="text-gray-500 hover:text-gray-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Nombre</label>
                                <input
                                    type="text" value={editForm.nombre}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Descripción</label>
                                <input
                                    type="text" value={editForm.descripcion}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                    className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Código</label>
                                <input
                                    type="text" value={editForm.codigo}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, codigo: e.target.value }))}
                                    className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-sm w-32"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox" checked={editForm.activo}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, activo: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label className="text-sm text-gray-700">Activo</label>
                            </div>
                        </div>
                        <div className="flex gap-2 px-5 pb-5">
                            <button
                                onClick={handleGuardarEdicion}
                                disabled={guardandoEdicion || !editForm.nombre.trim()}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                            >
                                {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                            <button
                                onClick={() => setEditItem(null)}
                                className="px-4 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
