import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TriangleAlert, Receipt, CalendarClock, Boxes } from 'lucide-react';
import api from '../../../core/api/axios';
import { tienePermiso } from '../../utils/auth';

type Severidad = 'critica' | 'advertencia';
type Clave = 'FACTURAS' | 'CALIBRACIONES' | 'INVENTARIO';

interface AlertaItem {
  tipo: string;
  severidad: Severidad;
  titulo: string;
  detalle: string;
  referencia_id: number;
}

interface GrupoAlertas {
  clave: Clave;
  titulo: string;
  total: number;
  criticas: number;
  items: AlertaItem[];
}

interface RespuestaAlertas {
  total: number;
  criticas: number;
  grupos: GrupoAlertas[];
}

const ICONO_GRUPO: Record<Clave, typeof Receipt> = {
  FACTURAS: Receipt,
  CALIBRACIONES: CalendarClock,
  INVENTARIO: Boxes,
};

/** Ruta a la que lleva cada alerta (el backend solo informa el tipo y el id). */
const rutaDeAlerta = (a: AlertaItem): string => {
  if (a.tipo.startsWith('FACTURA')) return `/financiero/facturas/${a.referencia_id}`;
  if (a.tipo.startsWith('CALIBRACION')) {
    return tienePermiso('Gestion Financiera', 1)
      ? '/financiero/proximas-calibraciones'
      : '/administrativo/proximas-calibraciones';
  }
  return `/inventario/productos/${a.referencia_id}`;
};

/**
 * Alertas operativas (facturas por vencer, próximas calibraciones, inventario
 * bajo el mínimo). Va junto a las notificaciones, pero es independiente: aquí
 * solo aparecen las alertas, no los avisos de flujo.
 */
const AlertasBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, refetch } = useQuery<RespuestaAlertas>({
    queryKey: ['alertas'],
    queryFn: async () => (await api.get('/alertas')).data,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
    retry: 1,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const total = data?.total ?? 0;
  const hayCriticas = (data?.criticas ?? 0) > 0;
  const grupos = data?.grupos ?? [];

  const alternar = () => {
    if (!open) void refetch();
    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={alternar}
        className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-primary-foreground transition-colors"
        aria-label="Alertas"
        title="Alertas"
      >
        <TriangleAlert className="w-5 h-5" />
        {total > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow ${hayCriticas ? 'bg-red-500' : 'bg-amber-500'}`}
          >
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[22rem] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Alertas</span>
            {total > 0 && (
              <span className="text-xs text-muted-foreground">
                {total} {total === 1 ? 'pendiente' : 'pendientes'}
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {total === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No hay alertas</p>
            ) : (
              grupos
                .filter((g) => g.total > 0)
                .map((g) => {
                  const Icono = ICONO_GRUPO[g.clave];
                  return (
                    <div key={g.clave}>
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-b border-border">
                        <Icono className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground flex-1">{g.titulo}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{g.total}</span>
                      </div>
                      {g.items.map((a, i) => (
                        <button
                          key={`${a.tipo}-${a.referencia_id}-${i}`}
                          onClick={() => {
                            setOpen(false);
                            navigate(rutaDeAlerta(a));
                          }}
                          className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors flex items-start gap-3"
                        >
                          <div
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.severidad === 'critica' ? 'bg-red-500' : 'bg-amber-500'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{a.titulo}</p>
                            <span className="text-[11px] text-muted-foreground mt-0.5 block">{a.detalle}</span>
                          </div>
                        </button>
                      ))}
                      {g.total > g.items.length && (
                        <p className="px-4 py-2 text-[11px] text-muted-foreground border-b border-border">
                          y {g.total - g.items.length} más…
                        </p>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasBell;
