import { Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/organisms/Navbar';

export const LaboratoriosLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex-1 overflow-auto p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    );
};