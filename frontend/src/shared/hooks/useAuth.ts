// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInfo } from '../../modules/auth/interface/auth.interface';
import api from '../../core/api/axios';

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

  const cerrarSesion = async () => {
    // Cierra la sesión en BD (revoca el JWT al instante) — best-effort:
    // si falla (red/401) igual limpiamos lo local y salimos.
    try {
      await api.post('/usuarios/logout');
    } catch {
      // Ignorado: el token se borra de todas formas
    }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.clear();
    setUser(null);
    navigate('/');
  };

  return { user, cerrarSesion };
};