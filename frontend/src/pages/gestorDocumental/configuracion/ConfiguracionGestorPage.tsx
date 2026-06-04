import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../../../lib/axios';

export const ConfiguracionGestorPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Librerías');
    
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await api.get('/carpetas');
                setCarpetas(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, []);

    // Filtramos los datos según su tipo
    const librerias = carpetas.filter(c => c.tipo === 'LIBRERIA');
    const areas = carpetas.filter(c => c.tipo === 'AREA');
    const subcarpetas = carpetas.filter(c => c.tipo === 'SUBCARPETA'); // Aquí están todas las subcarpetas

    const menuItems = ['Librerías', 'Áreas', 'Carpetas', 'Circuitos'];

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
                                    <button className="text-blue-600 hover:underline text-xs mr-3">Editar</button>
                                    <button className="text-red-600 hover:underline text-xs">Eliminar</button>
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

        </div>
    );
};