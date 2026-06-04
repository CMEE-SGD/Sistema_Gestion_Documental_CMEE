import { Outlet } from 'react-router-dom';
import { SideBarConfiguracion } from '../../../components/shared/SiderBarConfiguracion' // Ajusta la ruta de importación
import Navbar from '../../../components/Navbar';

export const LayoutConfiguracion = () => {
    return (
        
        <div className="flex flex-col min-h-screen bg-gray-50">
        
        {/* 1. Barra de navegación superior fija */}
        <Navbar />
        
        {/* 2. Contenedor inferior (Sidebar + Contenido) */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Menú lateral izquierdo (Aquí irá tu slider de carpetas) */}
            <SideBarConfiguracion />
            
            {/* Contenedor principal donde se renderizan las vistas dinámicas */}
            <main className="flex-1 p-6 overflow-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>

        </div>
    );
};