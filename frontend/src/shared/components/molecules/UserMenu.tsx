import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoCentro } from '../../../assets';
import { User } from 'lucide-react';
import api from '../../../core/api/axios';

const BACKEND = (import.meta as any).env.VITE_BACKEND_URL || '';

/** Devuelve la URL completa de la foto o null */
function fotoUrl(ruta?: string | null): string | null {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  
  // Limpiamos los slashes para asegurar que se unan correctamente
  const baseUrl = BACKEND.endsWith('/') ? BACKEND.slice(0, -1) : BACKEND;
  const path = ruta.startsWith('/') ? ruta : `/${ruta}`;
  
  return `${baseUrl}${path}`;
}

const UserMenu = () => {
  const { user, cerrarSesion } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Fetch de datos de persona si el auth no los trae completos ──
  const [personaExtra, setPersonaExtra] = useState<{
    foto_ruta?: string; nombre?: string; apellidos?: string; puesto?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    // Si ya viene con foto y nombre desde el token/auth, no hace falta fetch
    if (user.persona?.foto_ruta || user.persona?.nombre) return;

    // Busca el persona_id en los campos que tu backend devuelva en el JWT
    const personaId = (user as any).persona_id ?? (user as any).personaId;
    if (!personaId) return;

    api.get(`/personas/${personaId}`)
      .then(res => {
        const p = res.data;
        const primerPuesto = p.puestos?.[0]?.puesto?.nombre;
        setPersonaExtra({
          foto_ruta: p.foto_ruta,
          nombre: p.nombre,
          apellidos: p.apellidos,
          puesto: primerPuesto,
        });
      })
      .catch(() => { /* silencioso */ });
  }, [user]);

  // Datos fusionados: prioriza lo que vino del auth, complementa con personaExtra
  const persona = {
    nombre: user?.persona?.nombre ?? personaExtra?.nombre,
    apellidos: user?.persona?.apellidos ?? personaExtra?.apellidos,
    puesto: user?.persona?.puesto ?? personaExtra?.puesto,
    foto_ruta: user?.persona?.foto_ruta ?? personaExtra?.foto_ruta,
  };

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

  const avatarUrl = fotoUrl(persona.foto_ruta);

  console.log('BACKEND_URL:', BACKEND); // Verificar que no esté vacío
  console.log('foto_ruta:', persona.foto_ruta); // Verificar la ruta
  console.log('avatarUrl:', avatarUrl);

  return (
    <div className="relative" ref={userMenuRef}>
      {/* Boton avatar */}
      <button
        onClick={() => setShowUserMenu((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-white bg-opacity-20 border border-white border-opacity-40 flex items-center justify-center text-white hover:bg-opacity-30 transition-colors overflow-hidden"
        aria-label="Menu de usuario"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <User className="w-5 h-5" />
        )}
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
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = logoCentro; }}
                />
              ) : (
                <img src={logoCentro} alt="Logo" className="w-12 h-12 object-contain" />
              )}
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                {persona.nombre}
              </span>
              <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                {persona.apellidos}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full w-fit uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200 shadow-sm mt-0.5">
                {persona.puesto || 'Puesto no asignado'}
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