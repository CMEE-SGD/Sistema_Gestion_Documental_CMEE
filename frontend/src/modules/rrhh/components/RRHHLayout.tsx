import { Outlet } from 'react-router-dom';
import Navbar from '../../../shared/components/organisms/Navbar';
import SideBarRRHH from './SideBarRRHH'

export const RRHHLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar Superior Global */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Barra Lateral Exclusiva de RRHH */}
        <SideBarRRHH />

        {/* Contenido Dinámico de las Páginas de RRHH */}
        <main className="flex-1 overflow-y-auto bg-gray-50 flex justify-center">
          <div className="w-full max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RRHHLayout;