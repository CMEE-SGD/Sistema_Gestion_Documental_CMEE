import { Outlet } from 'react-router-dom';
import { SidebarRRHH } from '../../components/shared/SideBarRRHH';
import Navbar from '../../components/Navbar'

export const RRHHLayout = () => {
    return (
        // Contenedor principal en columna
        <div className="flex flex-col min-h-screen bg-gray-50">
        
        {/* 1. Barra de navegación superior fija */}
        <Navbar />
        
        {/* 2. Contenedor inferior (Sidebar + Contenido) */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Menú lateral izquierdo */}
            <SidebarRRHH />
            
            {/* Contenedor principal donde se renderizan las vistas */}
            <main className="flex-1 p-6 overflow-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-full">
                <Outlet />
            </div>
            </main>
        </div>

        </div>
    );
};