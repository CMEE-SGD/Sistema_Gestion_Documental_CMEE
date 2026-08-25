import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoCentro } from '../../../assets';
import { User, LogOut, Settings } from 'lucide-react'; // 👇 Lucide Icons
import api from '../../../core/api/axios';
import { buildFileUrl as fotoUrl } from '../../utils/backendUrl';

const UserMenu = () => {
  const { user, cerrarSesion } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [personaExtra, setPersonaExtra] = useState<{
    foto_ruta?: string; nombre?: string; apellidos?: string; puesto?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.persona?.foto_ruta || user.persona?.nombre) return;

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
      .catch(() => {});
  }, [user]);

  const persona = {
    nombre: user?.persona?.nombre ?? personaExtra?.nombre,
    apellidos: user?.persona?.apellidos ?? personaExtra?.apellidos,
    puesto: user?.persona?.puesto ?? personaExtra?.puesto,
    foto_ruta: user?.persona?.foto_ruta ?? personaExtra?.foto_ruta,
  };

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

  return (
    <div className="relative" ref={userMenuRef}>
      {/* Botón avatar principal */}
      <button
        onClick={() => setShowUserMenu((prev) => !prev)}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-primary-foreground transition-colors overflow-hidden ring-2 ring-transparent focus:ring-white/50 outline-none"
        aria-label="Menú de usuario"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <User className="w-5 h-5 text-primary-foreground/80" />
        )}
      </button>

      {/* Menú desplegable */}
      {showUserMenu && (
        <div className="absolute right-0 top-12 w-72 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          
          {/* Cabecera del usuario */}
          <div className="flex items-center gap-4 px-5 py-4 border-b border-border bg-muted/30">
            <div className="shrink-0 w-12 h-12 rounded-full border border-border bg-white flex items-center justify-center shadow-sm overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = logoCentro; }}
                />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {persona.nombre} {persona.apellidos}
              </span>
              <span className="text-xs font-medium text-muted-foreground truncate mt-0.5">
                {persona.puesto || 'Puesto no asignado'}
              </span>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={() => { setShowUserMenu(false); navigate('/preferencias'); }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors w-full text-left"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Preferencias
            </button>
            
            <div className="h-px bg-border my-1 mx-2" />
            
            <button
              onClick={handleCerrarSesion}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;