import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoCentro } from '../../../assets';

const UserMenu = () => {
  const { user, cerrarSesion } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Cerrar user menu al click fuera 
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCerrarSesion = () => {
    setShowUserMenu(false);
    cerrarSesion();
  };

  return (
    <div className="relative" ref={userMenuRef}>
      {/* Boton avatar */}
      <button
        onClick={() => setShowUserMenu((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-white bg-opacity-20 border border-white border-opacity-40 flex items-center justify-center text-white hover:bg-opacity-30 transition-colors"
        aria-label="Menu de usuario"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </button>

      {/* Panel desplegable */}
      {showUserMenu && (
        <div
          className="absolute right-0 top-10 w-72 rounded shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          {/* ── Seccion info usuario ── */}
          <div
            className="flex items-center gap-4 px-4 py-4"
            style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
          >
            <div className="shrink-0 w-14 h-14 rounded-full border border-gray-200 overflow-hidden bg-white flex items-center justify-center shadow-sm">
              {/* Nota: Usé user.persona.avatar como en tu código original, aunque en tu interfaz decía foto_ruta */}
              {user?.persona?.avatar ? (
                <img
                  src={user.persona.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={logoCentro}
                  alt="Logo CMEE"
                  className="w-12 h-12 object-contain"
                />
              )}
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                {user?.persona?.nombre}
              </span>
              <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                {user?.persona?.apellidos}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full w-fit uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200 shadow-sm mt-0.5">
                {user?.persona?.puesto || 'Puesto no asignado'}
              </span>
            </div>
          </div>

          {/* ── Botones ── */}
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              onClick={() => { setShowUserMenu(false); navigate('/preferencias'); }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded transition-colors"
            >
              Preferencias
            </button>
            <button
              onClick={handleCerrarSesion}
              className="flex-1 border border-red-300 hover:border-red-400 bg-white hover:bg-red-50 text-red-600 text-sm font-medium py-1.5 rounded transition-colors"
            >
              Cerrar Sesion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;