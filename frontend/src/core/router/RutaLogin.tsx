import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

type Estado = 'verificando' | 'welcome' | 'espera' | 'login';

/**
 * Ruta pública de login: si ya existe un JWT guardado, valida la sesión
 * contra el backend antes de mostrar el formulario. Así, al volver a "/"
 * (botón Atrás, bfcache, o escribir la URL) el usuario con sesión activa
 * NO vuelve a ver el login — y de paso evita el error del backend
 * "el usuario ya está activo" al intentar iniciar sesión dos veces.
 * Cuando el navegador restaura la página desde el back-forward cache
 * (evento `pageshow` con `persisted: true`) se vuelve a verificar.
 */
export const RutaLogin = () => {
  const [estado, setEstado] = useState<Estado>('verificando');
  const montado = useRef(true);

  const verificar = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (montado.current) setEstado('login');
      return;
    }
    try {
      const res = await fetch(
        `${(import.meta as any).env.VITE_API_URL}/usuarios/perfil/actual`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!montado.current) return;

      if (res.ok) {
        setEstado('welcome');
        return;
      }

      const body = await res.json().catch(() => null);
      if (
        typeof body?.message === 'string' &&
        body.message.includes('pendiente de aprobación')
      ) {
        // Sesión válida pero el acceso está pendiente de aprobación.
        setEstado('espera');
        return;
      }

      // Token vencido o inválido: limpiamos y dejamos ver el login.
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setEstado('login');
    } catch {
      // Sin red: no expulsamos por un problema puntual de conectividad.
      if (montado.current) setEstado('welcome');
    }
  };

  useEffect(() => {
    montado.current = true;
    verificar();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) verificar();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => {
      montado.current = false;
      window.removeEventListener('pageshow', onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (estado === 'verificando') return null;

  if (estado === 'welcome') return <Navigate to="/welcome" replace />;

  if (estado === 'espera') return <Navigate to="/espera" replace />;

  return <Outlet />;
};