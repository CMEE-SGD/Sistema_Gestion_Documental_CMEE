import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

type Estado = 'verificando' | 'autorizado' | 'no-autorizado' | 'pendiente';

/**
 * Envuelve las rutas privadas: valida la sesión real contra el backend al
 * montar y también cuando el navegador restaura la página desde el
 * back-forward cache (evento `pageshow` con `persisted: true` — justo lo
 * que pasa al usar el botón Atrás/Adelante). Esa restauración no vuelve a
 * ejecutar el arranque normal de React ni dispara el interceptor de Axios,
 * así que sin este chequeo una pantalla protegida podía quedar visible tal
 * cual estaba aunque la sesión ya no fuera válida (cerrada, expirada, o
 * pendiente de aprobación por IP fuera de rango).
 */
export const RutaProtegida = () => {
  const [estado, setEstado] = useState<Estado>('verificando');
  const montado = useRef(true);

  const verificar = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (montado.current) setEstado('no-autorizado');
      return;
    }
    try {
      const res = await fetch(
        `${(import.meta as any).env.VITE_API_URL}/usuarios/perfil/actual`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!montado.current) return;

      if (res.ok) {
        setEstado('autorizado');
        return;
      }

      const body = await res.json().catch(() => null);
      if (
        typeof body?.message === 'string' &&
        body.message.includes('pendiente de aprobación')
      ) {
        setEstado('pendiente');
        return;
      }
      setEstado('no-autorizado');
    } catch {
      // Sin red: no expulsamos por un problema de conectividad puntual —
      // cada pantalla ya maneja el fallo al pedir sus propios datos.
      if (montado.current) setEstado('autorizado');
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

  if (estado === 'no-autorizado') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    return <Navigate to="/" replace />;
  }

  if (estado === 'pendiente') {
    return <Navigate to="/espera" replace />;
  }

  return <Outlet />;
};
