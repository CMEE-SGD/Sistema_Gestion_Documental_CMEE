import { useState, useCallback, createContext, useContext } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertOptions {
  title?: string;
  message: string;
}

interface ConfirmOptions {
  title?: string;
  message: string;
}

interface AlertContextType {
  alert: (options: AlertOptions) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType>({
  alert: async () => {},
  confirm: async () => false,
});

export const useAlert = () => useContext(AlertContext);

type Mode = 'alert' | 'confirm';

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('alert');
  const [resolve, setResolve] = useState<((value: boolean | void) => void) | null>(null);
  const [title, setTitle] = useState('Alerta');
  const [message, setMessage] = useState('');

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((res) => {
      setMode('alert');
      setTitle(options.title || 'Alerta');
      setMessage(options.message);
      setResolve(() => res());
      setIsOpen(true);
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((res) => {
      setMode('confirm');
      setTitle(options.title || 'Confirmar');
      setMessage(options.message);
      setResolve(() => res);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    setIsOpen(false);
    if (mode === 'confirm') {
      (resolve as ((value: boolean) => void))(value);
    } else {
      (resolve as () => void)();
    }
  };

  if (!isOpen) {
    return (
      <AlertContext.Provider value={{ alert, confirm }}>
        {children}
      </AlertContext.Provider>
    );
  }

  return (
    <AlertContext.Provider value={{ alert, confirm }}>
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
            <p className="text-sm text-foreground">{message}</p>
          </div>
          <div className="flex items-center justify-end gap-3 rounded-b-xl bg-muted/30 p-4 border-t border-border">
            {mode === 'confirm' && (
              <button
                onClick={() => handleConfirm(false)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => handleConfirm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {mode === 'confirm' ? 'Aceptar' : 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </AlertContext.Provider>
  );
};
