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
    /** Puestos activos de la persona (puede tener más de uno). */
    puestos?: string[];
    /** Roles de RRHH asignados a la persona. */
    roles?: string[];
  } | null>(null);

  // Ficha propia (autoservicio: no requiere permiso de RRHH). Trae los puestos
  // y los roles de RRHH para mostrarlos en el menú. El usuario administrador
  // del sistema no tiene persona asociada: en ese caso no se muestra nada extra.
  useEffect(() => {
    if (!user) return;
    api.get('/personas/mi-perfil')
      .then(res => {
        const p = res.data;
        const puestos: string[] = (p.puestos ?? [])
          .filter((rel: any) => rel.activo !== false)
          .map((rel: any) => rel.puesto?.nombre)
          .filter(Boolean);
        setPersonaExtra({
          foto_ruta: p.foto_ruta,
          nombre: p.nombre,
          apellidos: p.apellidos,
          puesto: puestos[0],
          puestos,
          roles: (p.roles ?? []).map((r: any) => r.nombre).filter(Boolean),
        });
      })
      .catch(() => {});
  }, [user?.id]);

  const persona = {
    nombre: user?.persona?.nombre || personaExtra?.nombre,
    apellidos: user?.persona?.apellidos || personaExtra?.apellidos,
    puesto: user?.persona?.puesto || personaExtra?.puesto,
    foto_ruta: user?.persona?.foto_ruta || personaExtra?.foto_ruta,
  };
  const puestos =
    personaExtra?.puestos && personaExtra.puestos.length > 0
      ? personaExtra.puestos
      : persona.puesto
        ? [persona.puesto]
        : [];
  const roles = personaExtra?.roles ?? [];

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
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          
          {/* Cabecera del usuario */}
          <button
            type="button"
            onClick={() => { setShowUserMenu(false); navigate('/mi-perfil'); }}
            className="flex items-center gap-4 px-5 py-4 border-b border-border bg-muted/30 w-full text-left hover:bg-muted/60 transition-colors"
            title="Ver mi perfil"
          >
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
              <span className="text-xs text-muted-foreground truncate mt-0.5">
                {user?.nombre_usuario}
              </span>
            </div>
          </button>

          {/* Puesto y roles de RRHH */}
          <div className="px-5 py-3 border-b border-border space-y-3">
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {puestos.length > 1 ? 'Puestos' : 'Puesto'}
              </span>
              {puestos.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {puestos.map((p) => (
                    <li key={p} className="text-sm text-foreground leading-snug">{p}</li>
                  ))}
                </ul>
              ) : (
                <span className="mt-1 block text-sm italic text-muted-foreground">Puesto no asignado</span>
              )}
            </div>
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Roles
              </span>
              {roles.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {roles.map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="mt-1 block text-sm italic text-muted-foreground">Sin roles asignados</span>
              )}
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