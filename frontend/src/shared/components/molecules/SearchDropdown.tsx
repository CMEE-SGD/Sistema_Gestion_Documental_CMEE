import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Module } from '../../interfaces/modulo.interface'; 
import { modules } from '../../data/modulos';

const SearchDropdown = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtered, setFiltered] = useState<Module[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Cerrar search dropdown al click fuera 
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

  // ── Busqueda 
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setActiveIndex(-1);

    if (term.trim() === '') {
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

  // ── Navegacion por teclado 
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

  // ── Resaltar coincidencia 
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
    <div className="relative flex-1 max-w-md" ref={dropdownRef}>
      <div className="flex items-center bg-white bg-opacity-15 border border-white border-opacity-30 rounded px-3 h-8">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => {
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
  );
};

export default SearchDropdown;