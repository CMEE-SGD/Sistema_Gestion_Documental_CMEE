import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Rol {
  id: number;
  nombre: string;
}

interface RolesDropdownProps {
  roles: Rol[];
  /** IDs de los roles ya marcados. */
  seleccionados: number[];
  onToggle: (rolId: number) => void;
}

// Mismo grid de checkboxes que antes se mostraba siempre expandido (ocupaba
// mucho espacio con 15+ roles); ahora va dentro de un desplegable, igual que
// los <select> de "Puesto" de este mismo formulario: cerrado por defecto,
// compacto, y se abre al hacer clic.
const RolesDropdown = ({ roles, seleccionados, onToggle }: RolesDropdownProps) => {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const nombresSeleccionados = roles
    .filter((rol) => seleccionados.includes(rol.id))
    .map((rol) => rol.nombre);

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="border border-gray-300 px-3 py-1.5 w-full bg-white rounded-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex items-center justify-between gap-3 text-left"
      >
        <span className={`truncate ${nombresSeleccionados.length ? 'text-gray-800' : 'text-gray-400'}`}>
          {nombresSeleccionados.length ? nombresSeleccionados.join(', ') : 'Seleccione roles...'}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {nombresSeleccionados.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {nombresSeleccionados.length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${abierto ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {abierto && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-20 py-1 max-h-72 overflow-y-auto">
          {roles.map((rol) => (
            <label
              key={rol.id}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-blue-50 px-3 py-2 w-full transition-colors"
            >
              <input
                type="checkbox"
                checked={seleccionados.includes(rol.id)}
                onChange={() => onToggle(rol.id)}
                className="w-3.5 h-3.5 text-blue-600 rounded-sm cursor-pointer shrink-0"
              />
              <span className="text-gray-700">{rol.nombre}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesDropdown;
