import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/utils';

interface Props {
  children: ReactNode;
  /** true en la raíz de la app (ocupa toda la pantalla); false dentro de un modal o sección. */
  pantallaCompleta?: boolean;
}

interface State {
  error: Error | null;
}

/**
 * ¿El error es de una pieza de la aplicación (chunk) que ya no existe en el
 * servidor? Pasa cuando alguien deja la pestaña abierta durante un deploy: su
 * navegador conserva el código viejo, que pide archivos con nombre viejo, y el
 * servidor ya no los tiene (responde el index.html en su lugar).
 */
export function esErrorDeCargaDeModulo(error: unknown): boolean {
  const texto = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /dynamically imported module|importing a module script failed|ChunkLoadError|loading chunk .* failed|unable to preload/i.test(
    texto,
  );
}

/**
 * Sin un límite de error, cualquier excepción al renderizar desmonta TODA la
 * aplicación de React y el usuario ve una pantalla en blanco sin explicación.
 * Este componente la reemplaza por un mensaje con un botón para recargar.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Error al renderizar:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const desactualizada = esErrorDeCargaDeModulo(error);

    const contenido = (
      <div
        role="alert"
        className={cn(
          'flex flex-col items-center gap-3 text-center',
          this.props.pantallaCompleta
            ? 'max-w-md'
            : 'rounded-md border border-destructive/30 bg-destructive/10 p-4',
        )}
      >
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <p className="text-sm font-semibold text-foreground">
          {desactualizada
            ? 'La aplicación se actualizó'
            : 'Ocurrió un error al mostrar esta pantalla'}
        </p>
        <p className="text-sm text-muted-foreground">
          {desactualizada
            ? 'Hay una versión nueva del sistema y esta pestaña quedó con la anterior. Recargue la página para continuar.'
            : 'Recargue la página para intentarlo de nuevo. Si el problema continúa, avise al administrador.'}
        </p>
        {!desactualizada && (
          <p className="max-w-full break-words text-xs text-muted-foreground">
            (Detalle técnico: {error.message.slice(0, 160)})
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Recargar página
        </button>
      </div>
    );

    if (!this.props.pantallaCompleta) return contenido;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        {contenido}
      </div>
    );
  }
}
