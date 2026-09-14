import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../core/api/axios';

/**
 * Cierra la sesión del usuario automáticamente tras un periodo de inactividad
 * (por defecto 10 minutos) sin interacción con la plataforma (ratón, teclado,
 * clics o scroll). Se monta una sola vez a nivel de aplicación (en
 * AppRouter, antes de que exista sesión), por eso el chequeo de "¿hay
 * token?" se hace en cada evento de actividad y no una sola vez al montar:
 * el login es una navegación interna de React (sin recargar la página), así
 * que si el chequeo se hiciera solo al montar el efecto, se quedaría fijo en
 * "no hay sesión" para siempre y el conteo nunca arrancaría después de
 * loguearse.
 *
 * @param tiempoMs Tiempo de inactividad en milisegundos antes de desloguear.
 */
export const useInactividad = (tiempoMs: number = 10 * 60 * 1000) => {
  const navigate = useNavigate();
  const temporizadorRef = useRef<number | null>(null);

  useEffect(() => {
    const limpiarTemporizador = () => {
      if (temporizadorRef.current !== null) {
        window.clearTimeout(temporizadorRef.current);
        temporizadorRef.current = null;
      }
    };

    const cerrarPorInactividad = async () => {
      limpiarTemporizador();
      if (!localStorage.getItem('token')) return;
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

    const reiniciar = () => {
      limpiarTemporizador();
      // Chequeo en cada actividad, no solo al montar (ver comentario arriba).
      if (!localStorage.getItem('token')) return;
      temporizadorRef.current = window.setTimeout(cerrarPorInactividad, tiempoMs);
    };

    // Eventos que consideramos "actividad" del usuario.
    const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    eventos.forEach((ev) => window.addEventListener(ev, reiniciar, { passive: true }));

    // Arranca el contador de inmediato si ya hay sesión (p.ej. tras refrescar
    // la página con el token ya guardado).
    reiniciar();

    return () => {
      limpiarTemporizador();
      eventos.forEach((ev) => window.removeEventListener(ev, reiniciar));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiempoMs]);
};
