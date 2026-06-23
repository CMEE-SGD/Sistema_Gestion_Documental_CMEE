import BrandLogo from '../molecules/BrandLogo';
import SearchDropdown from '../molecules/SearchDropdown';
import UserMenu from '../molecules/UserMenu';

const Navbar = () => {
  return (
    <nav className="w-full h-14 flex items-center px-6 gap-6 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <BrandLogo />
      <SearchDropdown />
      <div className="flex-1" />
      <UserMenu />
    </nav>
  );
};

export default Navbar;