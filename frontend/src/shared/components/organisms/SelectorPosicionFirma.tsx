import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

// Este componente completo se carga de forma diferida (ver los modales de
// firma), así que importar pdfjs-dist estáticamente aquí no afecta el
// bundle principal — solo se descarga cuando alguien elige la posición del sello.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export interface PosicionFirma {
  /** Página donde se colocará el sello, 0-indexada. */
  pagina: number;
  /** Coordenadas en puntos PDF (origen abajo-izquierda) — igual que pdf-lib. */
  x: number;
  y: number;
}

interface Props {
  pdfBytes: Uint8Array;
  posicionActual: PosicionFirma | null;
  onSeleccionar: (pos: PosicionFirma) => void;
}

const ANCHO_MAXIMO_CANVAS = 700;

export default function SelectorPosicionFirma({
  pdfBytes,
  posicionActual,
  onSeleccionar,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [escala, setEscala] = useState(1);
  const [alturaPagina, setAlturaPagina] = useState(0);

  // Carga del documento — una sola vez por PDF recibido.
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    (async () => {
      try {
        // pdfjs se queda con el buffer que le pasamos; le damos una copia
        // independiente para no interferir con otros usos de pdfBytes.
        const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice() })
          .promise;
        if (cancelado) return;
        setPdf(doc);
        setTotalPaginas(doc.numPages);
        setPaginaActual(0);
      } catch {
        if (!cancelado) setError('No se pudo cargar el PDF para elegir la posición.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [pdfBytes]);

  // Render de la página actual en el canvas.
  useEffect(() => {
    if (!pdf) return;
    let cancelado = false;

    (async () => {
      const page = await pdf.getPage(paginaActual + 1); // pdfjs es 1-indexado
      const viewportBase = page.getViewport({ scale: 1 });
      const escalaCalculada = Math.min(
        ANCHO_MAXIMO_CANVAS / viewportBase.width,
        1.5,
      );
      const viewport = page.getViewport({ scale: escalaCalculada });

      const canvas = canvasRef.current;
      if (!canvas || cancelado) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      if (cancelado) return;

      setEscala(escalaCalculada);
      setAlturaPagina(viewportBase.height);
    })();

    return () => {
      cancelado = true;
    };
  }, [pdf, paginaActual]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !escala) return;
    const rect = canvas.getBoundingClientRect();
    const clickXCanvas = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickYCanvas = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Canvas: origen arriba-izquierda, y hacia abajo. PDF: origen abajo-izquierda, y hacia arriba.
    const x = clickXCanvas / escala;
    const y = alturaPagina - clickYCanvas / escala;
    onSeleccionar({ pagina: paginaActual, x, y });
  };

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Haga clic en el PDF donde quiere que aparezca el sello de firma.
      </p>

      <div className="relative inline-block border border-border rounded-md overflow-hidden mx-auto bg-white">
        {cargando && (
          <div className="flex items-center justify-center h-64 w-full text-sm text-muted-foreground">
            Cargando documento…
          </div>
        )}
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className={cargando ? 'hidden' : 'cursor-crosshair block'}
        />
        {posicionActual && posicionActual.pagina === paginaActual && !cargando && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: posicionActual.x * escala - 10,
              top: (alturaPagina - posicionActual.y) * escala - 20,
            }}
          >
            <MapPin className="h-5 w-5 text-red-600 drop-shadow" fill="white" />
          </div>
        )}
      </div>

      {!cargando && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPaginaActual((p) => Math.max(0, p - 1))}
            disabled={paginaActual === 0}
            className="p-1 border border-border rounded bg-background disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">
            Página {paginaActual + 1} de {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={paginaActual === totalPaginas - 1}
            className="p-1 border border-border rounded bg-background disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {posicionActual && (
        <p className="text-xs text-emerald-700 text-center">
          Posición elegida en la página {posicionActual.pagina + 1}. Puede hacer clic de nuevo para cambiarla.
        </p>
      )}
    </div>
  );
}
