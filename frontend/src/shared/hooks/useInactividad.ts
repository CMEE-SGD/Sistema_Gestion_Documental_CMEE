import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../core/api/axios';

const API_BASE = (import.meta as any).env.VITE_API_URL;

/** Minutos que se usan si todavía no se pudo leer Configuración General. */
const MINUTOS_POR_DEFECTO = 20;

/**
 * Cierra la sesión del usuario automáticamente tras un periodo de
 * inactividad sin interacción con la plataforma (ratón, teclado, clics o
 * scroll). El tiempo se lee de Configuración General
 * (tiempo_inactividad_minutos, "0" = desactivado) — la misma pantalla de
 * administración que ya expone ese campo, para que el número mostrado ahí
 * sea el que realmente se aplica. Se monta una sola vez a nivel de
 * aplicación (en AppRouter, antes de que exista sesión), por eso el
 * chequeo de "¿hay token?" se hace en cada evento de actividad y no una
 * sola vez al montar: el login es una navegación interna de React (sin
 * recargar la página), así que si el chequeo se hiciera solo al montar el
 * efecto, se quedaría fijo en "no hay sesión" para siempre y el conteo
 * nunca arrancaría después de loguearse.
 *
 * Este temporizador solo da una salida inmediata (redirige al login) mientras
 * la pestaña sigue viva y en primer plano — si el navegador la descarta, se
 * suspende la laptop, o queda en segundo plano mucho tiempo, el temporizador
 * puede no llegar a correr. El backend (ver JwtStrategy#validate) hace el
 * mismo cierre de forma independiente en la siguiente petición autenticada,
 * así que la sesión igual queda cerrada aunque este timer no se ejecute.
 */
export const useInactividad = () => {
  const navigate = useNavigate();
  const temporizadorRef = useRef<number | null>(null);
  const [tiempoMs, setTiempoMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetch(`${API_BASE}/configuracion-general`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelado) return;
        const minutos = data?.tiempo_inactividad_minutos ?? MINUTOS_POR_DEFECTO;
        setTiempoMs(minutos > 0 ? minutos * 60 * 1000 : 0);
      })
      .catch(() => {
        if (!cancelado) setTiempoMs(MINUTOS_POR_DEFECTO * 60 * 1000);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    // null = todavía no se supo el valor configurado; 0 = desactivado.
    if (!tiempoMs) return;

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
  }, [tiempoMs, navigate]);
};
