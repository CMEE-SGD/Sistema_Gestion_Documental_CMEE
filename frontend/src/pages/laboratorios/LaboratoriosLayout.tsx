import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export const LaboratoriosLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex-1 flex flex-col">
                <Outlet />
            </div>
        </div>
    );
};