import { Menu } from 'lucide-react';
import BrandLogo from '../molecules/BrandLogo';
import SearchDropdown from '../molecules/SearchDropdown';
import UserMenu from '../molecules/UserMenu';
import NotificationBell from '../molecules/NotificationBell';
import { useLayoutUI } from '../../context/LayoutUIContext';

const Navbar = () => {
  const { toggleSidebar } = useLayoutUI();

  return (
    <nav className="w-full h-14 flex items-center px-4 md:px-6 gap-3 md:gap-6 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      {toggleSidebar && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-9 h-9 shrink-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-primary-foreground transition-colors"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      <BrandLogo />
      <div className="hidden md:block flex-1">
        <SearchDropdown />
      </div>
      <div className="flex-1 min-w-0" />
      <NotificationBell />
      <UserMenu />
    </nav>
  );
};

export default Navbar;