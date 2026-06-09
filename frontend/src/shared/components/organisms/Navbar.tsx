import BrandLogo from '../molecules/BrandLogo';
import SearchDropdown from '../molecules/SearchDropdown';
import UserMenu from '../molecules/UserMenu';

const Navbar = () => {
  return (
    <nav
      className="w-full h-12 flex items-center px-3 gap-3"
      style={{ backgroundColor: '#0057A8' }}
    >
      {/* ── Logo + nombre (Molécula) ── */}
      <BrandLogo />

      {/* ── Barra de busqueda (Molécula) ── */}
      <SearchDropdown />

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Menu de usuario (Molécula) ── */}
      <UserMenu />
    </nav>
  );
};

export default Navbar;