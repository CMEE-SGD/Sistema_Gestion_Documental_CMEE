import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../core/api/axios';

/**
 * Cierra la sesión del usuario automáticamente tras un periodo de inactividad
 * (por defecto 20 minutos) sin interacción con la plataforma (ratón, teclado,
 * clics o scroll). Se monta una sola vez a nivel de aplicación.
 *
 * @param tiempoMs Tiempo de inactividad en milisegundos antes de desloguear.
 */
export const useInactividad = (tiempoMs: number = 20 * 60 * 1000) => {
  const navigate = useNavigate();
  const temporizadorRef = useRef<number | null>(null);

  useEffect(() => {
    // Solo aplica si hay sesión iniciada.
    if (!localStorage.getItem('token')) return;

    const limpiarTemporizador = () => {
      if (temporizadorRef.current !== null) {
        window.clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }
    };

    const reiniciar = () => {
      limpiarTemporizador();
      temporizadorRef.current = window.setTimeout(cerrarPorInactividad, tiempoMs);
    };

    const cerrarPorInactividad = async () => {
      limpiarTemporizador();
      // Revoca la sesión en BD y limpia lo local, igual que el logout manual.
      try {
        await api.post('/usuarios/logout');
      } catch {
        // Si falla (red/401) igual se limpia localmente y se sale.
      }
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      sessionStorage.clear();
      navigate('/');
    };

    // Eventos que consideramos "actividad" del usuario.
    const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    eventos.forEach((ev) => window.addEventListener(ev, reiniciar, { passive: true }));

    // El contador arranca en cuanto se monta.
    reiniciar();

    return () => {
      limpiarTemporizador();
      eventos.forEach((ev) => window.removeEventListener(ev, reiniciar));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiempoMs]);
};
