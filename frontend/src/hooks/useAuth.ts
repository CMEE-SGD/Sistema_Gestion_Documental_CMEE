import { useNavigate } from 'react-router-dom';

export interface UserInfo {
  id: number;
  nombre_usuario: string;
  
  persona?: {
    nombre: string;
    apellidos: string;
    avatar?: string;
    cargo?: string;
    puesto?: string;
  };
}

export const getUsuarioActual = (): UserInfo | null => {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Hook solo para usar dentro de componentes
export const useAuth = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.clear();
    navigate('/');
  };

  return { user: getUsuarioActual(), cerrarSesion };
};