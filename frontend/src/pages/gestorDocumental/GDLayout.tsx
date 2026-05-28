import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
// Asumiendo que separarás el código del slider lateral en su propio componente:
import { SidebarGestorDocumental } from '../../components/shared/SidebarGestorDocumental';
export const GestorDocumentalLayout = () => {
    return (
        // Contenedor principal en columna
        <div className="flex flex-col min-h-screen bg-gray-50">
        
        {/* 1. Barra de navegación superior fija */}
        <Navbar />
        
        {/* 2. Contenedor inferior (Sidebar + Contenido) */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Menú lateral izquierdo (Aquí irá tu slider de carpetas) */}
            <SidebarGestorDocumental />
            
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