import { Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/organisms/Navbar';
import ResumenTabs from './components/ResumenTabs';

export const ResumenLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <ResumenTabs />
      <main className="flex-1 p-4 md:p-6 bg-gray-50 min-w-0 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};
