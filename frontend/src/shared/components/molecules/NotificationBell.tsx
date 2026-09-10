import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import api from '../../../core/api/axios';
import { useSocket } from '../../hooks/useSocket';
import { encodeId } from '../../utils/ids';

interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leido: boolean;
  referencia_id: number | null;
  createdAt: string;
}

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Esta es la única conexión de socket de toda la app (se abre una vez
  // acá), así que aprovechamos el mismo canal para el aviso de "algo
  // cambió en Recepción de Equipos" en vez de abrir un segundo socket.
  // Invalidar estas queries hace que Bandeja de Trabajo, Recepción de
  // Equipos y Certificados se actualicen solas sin que el usuario tenga
  // que recargar la página.
  useSocket(
    (data: Notificacion) => {
      setNotificaciones(prev => [data, ...prev]);
      setNoLeidas(prev => prev + 1);
    },
    (conteo: number) => {
      setNoLeidas(conteo);
    },
    () => {
      queryClient.invalidateQueries({ queryKey: ['bandeja-trabajo'] });
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      queryClient.invalidateQueries({ queryKey: ['certificados'] });
    },
  );

  useEffect(() => {
    api.get('/notificaciones').then(r => setNotificaciones(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/notificaciones/no-leidas').then(r => setNoLeidas(typeof r.data === 'number' ? r.data : 0)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarcarLeida = async (id: number) => {
    await api.patch(`/notificaciones/${id}/leer`);
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    setNoLeidas(prev => Math.max(0, prev - 1));
  };

  const handleMarcarTodasLeidas = async () => {
    await api.patch('/notificaciones/leer-todas');
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    setNoLeidas(0);
  };

  const handleClick = (n: Notificacion) => {
    if (!n.leido) handleMarcarLeida(n.id);
    if (n.referencia_id && n.tipo.startsWith('workflow')) {
      navigate(`/gestordocumental/documento/${encodeId(n.referencia_id)}`);
    } else if (n.tipo === 'recepcion_equipos') {
      navigate('/administrativo/recepciones');
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-primary-foreground transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={handleMarcarTodasLeidas} className="text-xs text-blue-600 hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No hay notificaciones</p>
            ) : (
              notificaciones.map(n => {
                const esRechazo = n.tipo === 'recepcion_equipos_rechazado';
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors flex items-start gap-3 ${n.leido ? '' : esRechazo ? 'bg-red-50/60' : 'bg-blue-50/50'}`}
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.leido ? 'bg-transparent' : esRechazo ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${n.leido ? esRechazo ? 'text-red-700/70' : 'text-muted-foreground' : esRechazo ? 'text-red-700 font-medium' : 'text-foreground font-medium'}`}>
                        {n.mensaje}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {new Date(n.createdAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
