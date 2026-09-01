import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useSocket = (
  onNotificacion?: (data: any) => void,
  onNoLeidas?: (conteo: number) => void,
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(`${SOCKET_URL}/notificaciones`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {});
    socket.on('connect_error', () => {});

    // Si la sesión es revocada por un administrador, se cierra la sesión en vivo.
    socket.on('sesion-cerrada', () => {
      localStorage.removeItem('token');
      window.location.href = '/';
    });

    if (onNotificacion) socket.on('notificacion', onNotificacion);
    if (onNoLeidas) socket.on('no-leidas', onNoLeidas);

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const getSocket = useCallback(() => socketRef.current, []);

  return { getSocket };
};
