import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastOptions {
  message: string;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

interface ToastItem {
  id: number;
  message: string;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message: options.message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-5 py-3 text-sm font-medium animate-slide-up"
          >
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            {t.message}
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
