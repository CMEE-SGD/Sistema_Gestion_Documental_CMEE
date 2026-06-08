// src/hooks/useAuth.ts
import { useNavigate } from 'react-router-dom';
import { UserInfo } from '../../modules/auth/interface/auth.interface';

export const getUsuarioActual = (): UserInfo | null => {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

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