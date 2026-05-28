import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modules, Module } from '../data/modulos';
import { useAuth } from '../hooks/useAuth';
import { logoCentro } from '../assets';

const Navbar = () => {
  const { user, cerrarSesion } = useAuth(); // ← aquí adentro
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtered, setFiltered] = useState<Module[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Cerrar search dropdown al click fuera ─────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Cerrar user menu al click fuera ───────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Busqueda ───────────────────────────────────────────────────────────
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setActiveIndex(-1);

    if (term.trim() === '') {
      // Mostrar TODOS los modulos cuando el campo esta vacio
      setFiltered(modules);
      setShowDropdown(true);
      return;
    }

    const results = modules.filter((m) =>
      m.name.toLowerCase().includes(term.toLowerCase()) ||
      m.category.toLowerCase().includes(term.toLowerCase())
    );
    setFiltered(results);
    setShowDropdown(true);
  };


  // ── Navegacion por teclado ────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      navigate(filtered[activeIndex].path);
      setShowDropdown(false);
      setSearchTerm('');
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // ── Resaltar coincidencia ─────────────────────────────────────────────
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="font-bold text-white">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  // ── Handler cerrar sesion ─────────────────────────────────────────────
  const handleCerrarSesion = () => {
    setShowUserMenu(false);
    cerrarSesion(); // logica desde hooks/useAuth.ts
  };

  // ── Badge de rol ──────────────────────────────────────────────────────
  const rolBadgeStyle: Record<string, string> = {
    admin: 'bg-red-100 text-red-600',
    supervisor: 'bg-yellow-100 text-yellow-600',
    usuario: 'bg-green-100 text-green-600',
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <nav
      className="w-full h-12 flex items-center px-3 gap-3"
      style={{ backgroundColor: '#0057A8' }}
    >
      {/* ── Logo + nombre ────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 shrink-0 mr-2 cursor-pointer"
        onClick={() => navigate('/welcome')}
      >
        <img src={logoCentro} alt="Logo CMEE" className="h-12 w-auto" />
        <span className="text-white font-black text-sm tracking-widest uppercase">
          SGD-CMEE
        </span>
      </div>

      {/* ── Barra de busqueda ────────────────────────────────────────── */}
      <div className="relative flex-1 max-w-md" ref={dropdownRef}>
        <div className="flex items-center bg-white bg-opacity-15 border border-white border-opacity-30 rounded px-3 h-8">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // Al hacer click: si no hay termino, mostrar todos los modulos
              setFiltered(searchTerm ? filtered : modules);
              setShowDropdown(true);
            }}
            placeholder="Buscar aplicacion"
            className="bg-transparent text-black placeholder-blue-200 text-sm outline-none flex-1 w-full"
          />

          <svg
            className="w-4 h-4 text-blue-200 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Resultados de busqueda */}
        {showDropdown && (
          <div
            className="absolute top-10 left-0 w-full rounded shadow-2xl overflow-hidden z-50"
            style={{ backgroundColor: '#004A8F', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-blue-200 text-sm">
                No se encontraron modulos
              </div>
            ) : (
              <ul>
                {filtered.map((mod, i) => (
                  <li
                    key={mod.id}
                    onClick={() => {
                      navigate(mod.path);
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors ${i === activeIndex
                      ? 'bg-white bg-opacity-20'
                      : 'hover:bg-white hover:bg-opacity-10'
                      }`}
                  >
                    <span className="text-blue-100">
                      {highlightMatch(mod.name, searchTerm)}
                    </span>
                    <span className="text-xs text-blue-300 ml-4 shrink-0">
                      {mod.category}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── Spacer ───────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Menu de usuario ──────────────────────────────────────────── */}
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
              {/* Avatar o logo */}
              <div className="shrink-0 w-14 h-14 rounded-full border border-gray-200 overflow-hidden bg-white flex items-center justify-center shadow-sm">
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

              {/* Nombre y Puesto Real */}
              <div className="flex flex-col gap-1 min-w-0">

                {/* Nombre y Apellidos */}
                <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                  {user?.persona?.nombre}
                </span>
                <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                  {user?.persona?.apellidos}
                </span>

                {/* Etiqueta con el Puesto Real (Ej: Director del CMEE) */}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full w-fit uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200 shadow-sm mt-0.5">
                  {user?.persona?.puesto || 'Puesto no asignado'}
                </span>

              </div>
            </div>

            {/* ── Botones: DEBAJO de la info ── */}
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
    </nav>
  );
};

export default Navbar;
