import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const SideBarConfiguracion = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Definimos los elementos y sus rutas específicas
    const menuItems = [
        { nombre: 'Librerías', ruta: '/gestordocumental/configuracion/librerias' },
        { nombre: 'Áreas', ruta: '/gestordocumental/configuracion/areas' },
        { nombre: 'Carpetas', ruta: '/gestordocumental/configuracion/carpetas' },
        { nombre: 'Circuitos', ruta: '/gestordocumental/configuracion/circuitos' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col shrink-0 min-h-screen shadow-sm z-10">

            <div className="mb-6">
                <span
                    className="font-bold text-xs text-gray-500 uppercase tracking-wider mr-2 cursor-pointer hover:text-blue-600 transition-colors"
                    title="Ir al inicio del Gestor Documental"
                >
                    Configuración
                </span>
            </div>

            {/* Botón para regresar al Gestor */}
            <button
                onClick={() => navigate('/gestordocumental')}
                className="px-4 py-1.5 mb-6 border border-gray-300 rounded text-sm text-gray-700 font-medium bg-white hover:bg-gray-50 shadow-sm w-max transition-colors"
            >
                Cerrar administración
            </button>

            <p className="text-[13px] text-gray-800 mb-4">Seleccione un elemento:</p>

            <ul className="flex flex-col gap-3">
                {menuItems.map(item => {
                    // Verificamos si la ruta actual incluye la ruta del item para marcarlo como activo
                    const isActive = location.pathname.includes(item.ruta);

                    return (
                        <li
                            key={item.nombre}
                            onClick={() => navigate(item.ruta)}
                            className={`flex items-center gap-1.5 text-[14px] font-bold cursor-pointer transition-colors select-none ${isActive ? 'text-blue-700' : 'text-[#003366] hover:text-blue-600'
                                }`}
                        >
                            <ChevronRight className="w-4 h-4 shrink-0 stroke-[3]" />
                            {item.nombre}
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};