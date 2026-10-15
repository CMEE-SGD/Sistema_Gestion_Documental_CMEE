import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { AlertCircle, X } from 'lucide-react';

/** Largo mínimo y máximo del motivo — el servidor también lo acota (500). */
export const MOTIVO_MINIMO = 5;
export const MOTIVO_MAXIMO = 500;

interface AlertOptions {
  title?: string;
  message: string;
}

interface ConfirmOptions {
  title?: string;
  message: string;
}

interface MotivoOptions {
  title?: string;
  /** Texto que explica qué se va a hacer (ej. "¿Eliminar la carpeta X?"). */
  message?: string;
  /** Texto del botón de aceptar (por defecto "Aceptar"). */
  confirmLabel?: string;
}

interface AlertContextType {
  alert: (options: AlertOptions) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /**
   * Pide al usuario el motivo de un cambio o eliminación. Devuelve el texto
   * (ya sin espacios sobrantes, mínimo MOTIVO_MINIMO caracteres) o `null` si
   * canceló. Pensado para pasarlo como `{ motivo }` a api.patch/api.delete,
   * que lo envía en la cabecera X-Motivo y queda en la bitácora de auditoría.
   */
  pedirMotivo: (options: MotivoOptions) => Promise<string | null>;
}

const AlertContext = createContext<AlertContextType>({
  alert: async () => {},
  confirm: async () => false,
  pedirMotivo: async () => null,
});

export const useAlert = () => useContext(AlertContext);

type Mode = 'alert' | 'confirm' | 'motivo';

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('alert');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resolve, setResolve] = useState<((value: any) => void) | null>(null);
  const [title, setTitle] = useState('Alerta');
  const [message, setMessage] = useState('');
  const [confirmLabel, setConfirmLabel] = useState('Aceptar');
  const [texto, setTexto] = useState('');

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((res) => {
      setMode('alert');
      setTitle(options.title || 'Alerta');
      setMessage(options.message);
      setConfirmLabel('Aceptar');
      setResolve(() => res);
      setIsOpen(true);
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((res) => {
      setMode('confirm');
      setTitle(options.title || 'Confirmar');
      setMessage(options.message);
      setConfirmLabel('Aceptar');
      setResolve(() => res);
      setIsOpen(true);
    });
  }, []);

  const pedirMotivo = useCallback((options: MotivoOptions) => {
    return new Promise<string | null>((res) => {
      setMode('motivo');
      setTitle(options.title || 'Motivo del cambio');
      setMessage(options.message || '');
      setConfirmLabel(options.confirmLabel || 'Aceptar');
      setTexto('');
      setResolve(() => res);
      setIsOpen(true);
    });
  }, []);

  const motivoLimpio = texto.replace(/\s+/g, ' ').trim();
  const motivoValido = motivoLimpio.length >= MOTIVO_MINIMO;

  const handleConfirm = (value: boolean) => {
    if (mode === 'motivo') {
      // Aceptar solo si el motivo cumple el mínimo; cancelar devuelve null.
      if (value && !motivoValido) return;
      setIsOpen(false);
      resolve?.(value ? motivoLimpio : null);
      return;
    }
    setIsOpen(false);
    if (mode === 'confirm') {
      resolve?.(value);
    } else {
      resolve?.(undefined);
    }
  };

  // Escape cancela el cuadro de motivo (los de alerta/confirmación no lo
  // tenían y se dejan igual).
  useEffect(() => {
    if (!isOpen || mode !== 'motivo') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        resolve?.(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, mode, resolve]);

  const valorContexto = { alert, confirm, pedirMotivo };

  if (!isOpen) {
    return (
      <AlertContext.Provider value={valorContexto}>
        {children}
      </AlertContext.Provider>
    );
  }

  return (
    <AlertContext.Provider value={valorContexto}>
      {children}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg w-full max-w-md relative mx-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              {title}
            </h2>
            <button
              onClick={() => handleConfirm(false)}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {message && <p className="text-sm text-foreground">{message}</p>}

            {mode === 'motivo' && (
              <div className={message ? 'mt-4' : ''}>
                <label
                  htmlFor="motivo-cambio"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Motivo <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="motivo-cambio"
                  autoFocus
                  rows={3}
                  maxLength={MOTIVO_MAXIMO}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escriba por qué realiza esta acción…"
                  className="block w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="mt-1.5 flex items-start justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    {motivoValido
                      ? 'Quedará registrado en la bitácora de auditoría.'
                      : `Mínimo ${MOTIVO_MINIMO} caracteres. Quedará registrado en la bitácora de auditoría.`}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {texto.length}/{MOTIVO_MAXIMO}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border">
            {mode !== 'alert' && (
              <button
                onClick={() => handleConfirm(false)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => handleConfirm(true)}
              disabled={mode === 'motivo' && !motivoValido}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </AlertContext.Provider>
  );
};
