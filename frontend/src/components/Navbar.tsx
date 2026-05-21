import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modules, Module } from '../data/modulos';
import { logoCentro } from "../assets"; // Asegúrate de que este camino sea correcto


const Navbar = () => {
  const [searchTerm, setSearchTerm]         = useState<string>('');
  const [filtered, setFiltered]             = useState<Module[]>([]);
  const [showDropdown, setShowDropdown]     = useState<boolean>(false);
  const [activeIndex, setActiveIndex]       = useState<number>(-1);
  const [showUserMenu, setShowUserMenu]     = useState<boolean>(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate   = useNavigate();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setActiveIndex(-1);
    if (term.trim() === '') {
      setFiltered([]);
      setShowDropdown(false);
      return;
    }
    const results = modules.filter((m) =>
      m.name.toLowerCase().includes(term.toLowerCase()) ||
      m.category.toLowerCase().includes(term.toLowerCase())
    );
    setFiltered(results);
    setShowDropdown(true);
  };

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

  return (
    <nav className="w-full h-12 flex items-center px-3 gap-3"
      style={{ backgroundColor: '#0057A8' }}>

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 mr-2">
        {/* ESG circle icon */}
        <div className="flex justify-center">
                      <img
                        src={logoCentro}
                        alt="Logo CMEE"
                        className="h-12 w-auto"
                      />
                    </div>
        <span className="text-white font-black text-sm tracking-widest uppercase">
          SGD-CMEE
        </span>
      </div>

      {/* Search bar */}
      <div className="relative flex-1 max-w-md" ref={dropdownRef}>
        <div className="flex items-center bg-white bg-opacity-15 border border-white border-opacity-30 rounded px-3 h-8">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm && setShowDropdown(true)}
            placeholder="Buscar aplicacion"
            className="bg-transparent text-blue placeholder-blue-200 text-sm outline-none flex-1 w-full"
          />
          {/* Search icon SVG */}
          <svg className="w-4 h-4 text-blue-200 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Dropdown results */}
        {showDropdown && (
          <div className="absolute top-10 left-0 w-full rounded shadow-2xl overflow-hidden z-50"
            style={{ backgroundColor: '#004A8F', border: '1px solid rgba(255,255,255,0.15)' }}>
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
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors ${
                      i === activeIndex
                        ? 'bg-white bg-opacity-20'
                        : 'hover:bg-white hover:bg-opacity-10'
                    }`}>
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* More options (...) */}
      <button className="text-white text-lg font-bold tracking-widest px-2 opacity-80 hover:opacity-100">
        ...
      </button>

      {/* User avatar */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-8 h-8 rounded-full bg-white bg-opacity-20 border border-white border-opacity-40 flex items-center justify-center text-white hover:bg-opacity-30 transition-colors">
          {/* Person icon SVG */}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </button>

        {/* User dropdown */}
        {showUserMenu && (
          <div className="absolute right-0 top-10 w-40 rounded shadow-2xl z-50 overflow-hidden"
            style={{ backgroundColor: '#004A8F', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ul className="text-sm text-blue-100">
              <li className="px-4 py-2 hover:bg-white hover:bg-opacity-10 cursor-pointer">Mi Perfil</li>
              <li className="px-4 py-2 hover:bg-white hover:bg-opacity-10 cursor-pointer">Configuracion</li>
              <li className="px-4 py-2 hover:bg-white hover:bg-opacity-10 cursor-pointer text-red-300">Cerrar Sesion</li>
            </ul>
          </div>
        )}
      </div>

      {/* Chevron down */}
      <svg className="w-3 h-3 text-white opacity-60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </nav>
  );
};

export default Navbar;
