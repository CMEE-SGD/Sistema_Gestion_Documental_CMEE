// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
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
  const [user, setUser] = useState<UserInfo | null>(getUsuarioActual);

  // Sincroniza si el localStorage cambia (login en otra pestaña, etc.)
  useEffect(() => {
    const onStorage = () => setUser(getUsuarioActual());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.clear();
    setUser(null);
    navigate('/');
  };

  return { user, cerrarSesion };
};