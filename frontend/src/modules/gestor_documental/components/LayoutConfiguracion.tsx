import { Outlet } from 'react-router-dom';
import Navbar from '../../../shared/components/organisms/Navbar';
import SiderBarConfiguracion from './SiderBarConfiguracion';

const LayoutConfiguracion = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Navbar Superior Global */}
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                {/* Menú lateral izquierdo de Administración */}
                <SiderBarConfiguracion />
                
                {/* Espacio de trabajo dinámico de configuración */}
                <main className="flex-1 p-6 overflow-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LayoutConfiguracion;