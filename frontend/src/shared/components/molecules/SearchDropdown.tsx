import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Module } from '../../interfaces/modulo.interface'; 
import { modules } from '../../data/modulos';
import { Search } from 'lucide-react'; // 👇 Usamos Lucide

const SearchDropdown = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtered, setFiltered] = useState<Module[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        <span className="font-bold text-primary">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="relative flex-1 max-w-md ml-4" ref={dropdownRef}>
      <div className="flex items-center bg-white/10 hover:bg-white/20 focus-within:bg-white/20 border border-white/20 rounded-md px-3 h-9 transition-colors">
        <Search className="w-4 h-4 text-primary-foreground/70 shrink-0 mr-2" />
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
          placeholder="Buscar aplicación..."
          className="bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 text-sm outline-none flex-1 w-full"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-12 left-0 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-muted-foreground text-sm text-center">
              No se encontraron módulos
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {filtered.map((mod, i) => (
                <li
                  key={mod.id}
                  onClick={() => {
                    navigate(mod.path);
                    setShowDropdown(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                    i === activeIndex
                      ? 'bg-muted text-foreground'
                      : 'hover:bg-muted/50 text-foreground/80'
                  }`}
                >
                  <span>{highlightMatch(mod.name, searchTerm)}</span>
                  <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-secondary rounded-md ml-4 shrink-0">
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