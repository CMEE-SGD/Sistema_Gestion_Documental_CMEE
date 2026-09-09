import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Este componente completo se carga de forma diferida (ver los modales de
// firma), así que importar pdfjs-dist estáticamente aquí no afecta el
// bundle principal — solo se descarga cuando alguien elige la posición del sello.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export interface PosicionFirma {
  /** Página donde se colocará el sello, 0-indexada. */
  pagina: number;
  /** Borde izquierdo del sello en puntos PDF (origen abajo-izquierda). */
  x: number;
  /** Borde SUPERIOR del sello en puntos PDF (origen abajo-izquierda). */
  y: number;
  /** Ancho final del sello en puntos PDF — lo elige el usuario al redimensionar. */
  ancho: number;
  /** Alto final del sello en puntos PDF — lo elige el usuario al redimensionar. */
  alto: number;
}

interface Props {
  pdfBytes: Uint8Array;
  posicionActual: PosicionFirma | null;
  onSeleccionar: (pos: PosicionFirma) => void;
  /** Tamaño natural (en puntos PDF) que ocuparía el sello sin ajuste del
   * usuario — mismo cálculo que se usa al firmar (ver construirAparienciaSello).
   * Se usa como tamaño inicial cuando el usuario hace clic para colocar el
   * sello por primera vez. */
  tamanoSello?: { ancho: number; alto: number } | null;
}

const ANCHO_MAXIMO_CANVAS = 700;
// Tamaño de respaldo si aún no se pudo calcular el tamaño real del sello
// (p. ej. mientras se carga el módulo de firma) — solo para que el recuadro
// no desaparezca un instante.
const ANCHO_SELLO_DEFECTO = 90;
const ALTO_SELLO_DEFECTO = 30;
// Tamaño mínimo permitido al redimensionar (en puntos PDF) — menos que esto
// el sello deja de ser legible/escaneable.
const ANCHO_MINIMO_PT = 40;
const ALTO_MINIMO_PT = 16;

type TipoArrastre = 'mover' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ArrastreEnCurso {
  tipo: TipoArrastre;
  /** Punto inicial del puntero en píxeles del canvas (interno). */
  inicioX: number;
  inicioY: number;
  /** Rect inicial en píxeles del canvas: left/top = esquina superior-izquierda. */
  rectInicio: { left: number; top: number; width: number; height: number };
}

interface DibujoEnCurso {
  inicioX: number;
  inicioY: number;
}

const MANIJAS: { id: TipoArrastre; style: React.CSSProperties; cursor: string }[] = [
  { id: 'nw', style: { left: '0%', top: '0%' }, cursor: 'cursor-nwse-resize' },
  { id: 'ne', style: { left: '100%', top: '0%' }, cursor: 'cursor-nesw-resize' },
  { id: 'sw', style: { left: '0%', top: '100%' }, cursor: 'cursor-nesw-resize' },
  { id: 'se', style: { left: '100%', top: '100%' }, cursor: 'cursor-nwse-resize' },
  { id: 'n', style: { left: '50%', top: '0%' }, cursor: 'cursor-ns-resize' },
  { id: 's', style: { left: '50%', top: '100%' }, cursor: 'cursor-ns-resize' },
  { id: 'w', style: { left: '0%', top: '50%' }, cursor: 'cursor-ew-resize' },
  { id: 'e', style: { left: '100%', top: '50%' }, cursor: 'cursor-ew-resize' },
];

export default function SelectorPosicionFirma({
  pdfBytes,
  posicionActual,
  onSeleccionar,
  tamanoSello,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const arrastreRef = useRef<ArrastreEnCurso | null>(null);
  const dibujoRef = useRef<DibujoEnCurso | null>(null);
  const [borrador, setBorrador] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [escala, setEscala] = useState(1);
  const [anchoPagina, setAnchoPagina] = useState(0);
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
      setAnchoPagina(viewportBase.width);
      setAlturaPagina(viewportBase.height);
    })();

    return () => {
      cancelado = true;
    };
  }, [pdf, paginaActual]);

  // Crea el cuadro de la firma arrastrando sobre el PDF. Un clic simple (sin
  // arrastre real) coloca el sello con su tamaño natural.
  const iniciarDibujo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = puntoCanvas(e);
    if (!p) return;
    e.preventDefault();
    dibujoRef.current = { inicioX: p.x, inicioY: p.y };
    setBorrador(null);
    contenedorRef.current?.setPointerCapture(e.pointerId);
  };

  const manejarDibujo = (e: React.PointerEvent) => {
    const dibujo = dibujoRef.current;
    if (!dibujo) return;
    const p = puntoCanvas(e);
    if (!p) return;
    setBorrador({
      left: Math.min(dibujo.inicioX, p.x),
      top: Math.min(dibujo.inicioY, p.y),
      width: Math.abs(p.x - dibujo.inicioX),
      height: Math.abs(p.y - dibujo.inicioY),
    });
  };

  const finalizarDibujo = (e: React.PointerEvent) => {
    const dibujo = dibujoRef.current;
    if (!dibujo) return;
    dibujoRef.current = null;
    setBorrador(null);
    contenedorRef.current?.releasePointerCapture(e.pointerId);

    const p = puntoCanvas(e);
    if (!p) return;

    const anchoPaginaPx = anchoPagina * escala;
    const alturaPaginaPx = alturaPagina * escala;
    const anchoMinimoPx = ANCHO_MINIMO_PT * escala;
    const altoMinimoPx = ALTO_MINIMO_PT * escala;

    let left = Math.min(dibujo.inicioX, p.x);
    let top = Math.min(dibujo.inicioY, p.y);
    let width = Math.abs(p.x - dibujo.inicioX);
    let height = Math.abs(p.y - dibujo.inicioY);

    if (width < 5 && height < 5) {
      // Clic sin arrastre: sello con su tamaño natural, centrado en el clic.
      const anchoNatural = (tamanoSello?.ancho ?? ANCHO_SELLO_DEFECTO) * escala;
      const altoNatural = (tamanoSello?.alto ?? ALTO_SELLO_DEFECTO) * escala;
      left = Math.min(Math.max(p.x - anchoNatural / 2, 0), Math.max(anchoPaginaPx - anchoNatural, 0));
      top = Math.min(Math.max(p.y - altoNatural / 2, 0), Math.max(alturaPaginaPx - altoNatural, 0));
      width = anchoNatural;
      height = altoNatural;
    } else {
      width = Math.max(width, anchoMinimoPx);
      height = Math.max(height, altoMinimoPx);
    }

    left = Math.min(Math.max(left, 0), Math.max(anchoPaginaPx - width, 0));
    top = Math.min(Math.max(top, 0), Math.max(alturaPaginaPx - height, 0));

    onSeleccionar({
      pagina: paginaActual,
      x: left / escala,
      y: alturaPagina - top / escala,
      ancho: width / escala,
      alto: height / escala,
    });
  };

  // Convierte el puntero a coordenadas en píxeles internos del canvas.
  const puntoCanvas = (e: React.PointerEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const iniciarArrastre = (
    e: React.PointerEvent,
    tipo: TipoArrastre,
  ) => {
    if (!posicionActual) return;
    const p = puntoCanvas(e);
    if (!p) return;
    e.preventDefault();
    e.stopPropagation();
    arrastreRef.current = {
      tipo,
      inicioX: p.x,
      inicioY: p.y,
      rectInicio: {
        left: posicionActual.x * escala,
        top: (alturaPagina - posicionActual.y) * escala,
        width: posicionActual.ancho * escala,
        height: posicionActual.alto * escala,
      },
    };
    contenedorRef.current?.setPointerCapture(e.pointerId);
  };

  const manejarArrastre = (e: React.PointerEvent) => {
    const arrastre = arrastreRef.current;
    if (!arrastre) return;
    const p = puntoCanvas(e);
    if (!p) return;

    const anchoPaginaPx = anchoPagina * escala;
    const alturaPaginaPx = alturaPagina * escala;
    const anchoMinimoPx = ANCHO_MINIMO_PT * escala;
    const altoMinimoPx = ALTO_MINIMO_PT * escala;
    const dx = p.x - arrastre.inicioX;
    const dy = p.y - arrastre.inicioY;
    const r = arrastre.rectInicio;

    // El borde/borde opuesto fijo se conserva: al mover el borde izquierdo se
    // recalcula left = right - ancho y así el borde derecho no se desplaza.
    const bordeDerecho = r.left + r.width;
    const bordeInferior = r.top + r.height;

    let left = r.left;
    let top = r.top;
    let width = r.width;
    let height = r.height;

    switch (arrastre.tipo) {
      case 'mover':
        left = r.left + dx;
        top = r.top + dy;
        break;
      case 'n':
        top = r.top + dy;
        height = r.height - dy;
        break;
      case 's':
        height = r.height + dy;
        break;
      case 'w':
        left = r.left + dx;
        width = r.width - dx;
        break;
      case 'e':
        width = r.width + dx;
        break;
      case 'nw':
        left = r.left + dx;
        top = r.top + dy;
        width = r.width - dx;
        height = r.height - dy;
        break;
      case 'ne':
        top = r.top + dy;
        width = r.width + dx;
        height = r.height - dy;
        break;
      case 'sw':
        left = r.left + dx;
        width = r.width - dx;
        height = r.height + dy;
        break;
      case 'se':
        width = r.width + dx;
        height = r.height + dy;
        break;
    }

    // Tamaño mínimo (manteniendo fijo el borde opuesto).
    if (arrastre.tipo.includes('w') || arrastre.tipo === 'nw' || arrastre.tipo === 'sw') {
      if (width < anchoMinimoPx) width = anchoMinimoPx;
      left = bordeDerecho - width;
    }
    if (arrastre.tipo.includes('n') || arrastre.tipo === 'nw' || arrastre.tipo === 'ne') {
      if (height < altoMinimoPx) height = altoMinimoPx;
      top = bordeInferior - height;
    }
    width = Math.max(width, anchoMinimoPx);
    height = Math.max(height, altoMinimoPx);

    // Recorte contra los bordes de la página.
    left = Math.min(Math.max(left, 0), Math.max(anchoPaginaPx - width, 0));
    top = Math.min(Math.max(top, 0), Math.max(alturaPaginaPx - height, 0));

    onSeleccionar({
      pagina: paginaActual,
      x: left / escala,
      y: alturaPagina - top / escala,
      ancho: width / escala,
      alto: height / escala,
    });
  };

  const terminarArrastre = (e: React.PointerEvent) => {
    if (!arrastreRef.current) return;
    arrastreRef.current = null;
    contenedorRef.current?.releasePointerCapture(e.pointerId);
  };

  const manejarPunteroMovimiento = (e: React.PointerEvent) => {
    if (arrastreRef.current) {
      manejarArrastre(e);
    } else if (dibujoRef.current) {
      manejarDibujo(e);
    }
  };

  const manejarPunteroArriba = (e: React.PointerEvent) => {
    if (arrastreRef.current) {
      terminarArrastre(e);
    } else if (dibujoRef.current) {
      finalizarDibujo(e);
    }
  };

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  // Misma lógica de recorte contra el borde de la página que usa
  // agregarSelloYPlaceholder.ts al insertar el sello de verdad — así el
  // recuadro de vista previa queda exactamente donde va a quedar el sello.
  let recuadro: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null = null;
  if (posicionActual && posicionActual.pagina === paginaActual && !cargando) {
    const ancho = posicionActual.ancho;
    const alto = posicionActual.alto;
    const x1 = Math.min(Math.max(posicionActual.x, 0), Math.max(anchoPagina - ancho, 0));
    const yTope = Math.min(Math.max(posicionActual.y, alto), alturaPagina);
    recuadro = {
      left: x1 * escala,
      top: (alturaPagina - yTope) * escala,
      width: ancho * escala,
      height: alto * escala,
    };
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Arrastre sobre el PDF para dibujar el cuadro donde irá el sello. Una
        vez creado, puede moverlo o ajustar su ancho y alto con los bordes y
        las esquinas.
      </p>

      <div
        ref={contenedorRef}
        onPointerMove={manejarPunteroMovimiento}
        onPointerUp={manejarPunteroArriba}
        onPointerCancel={manejarPunteroArriba}
        className="relative inline-block border border-border rounded-md overflow-hidden mx-auto bg-white touch-none select-none"
      >
        {cargando && (
          <div className="flex items-center justify-center h-64 w-full text-sm text-muted-foreground">
            Cargando documento…
          </div>
        )}
        <canvas
          ref={canvasRef}
          onPointerDown={iniciarDibujo}
          className={cargando ? 'hidden' : 'cursor-crosshair block'}
        />
        {borrador && (
          <div
            className="absolute border-2 border-emerald-600 bg-emerald-500/10 pointer-events-none"
            style={borrador}
          />
        )}
        {recuadro && !borrador && (
          <div
            className="absolute border-2 border-emerald-600 bg-emerald-500/10 cursor-move"
            style={recuadro}
            onPointerDown={(e) => iniciarArrastre(e, 'mover')}
          >
            {MANIJAS.map((m) => (
              <div
                key={m.id}
                className={`absolute h-2 w-2 rounded-[2px] border border-white bg-emerald-600 shadow-md ${m.cursor}`}
                style={{ ...m.style, transform: 'translate(-50%, -50%)' }}
                onPointerDown={(e) => iniciarArrastre(e, m.id)}
              />
            ))}
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
          Página {posicionActual.pagina + 1} · {Math.round(posicionActual.ancho)} ×{' '}
          {Math.round(posicionActual.alto)} pt
          {posicionActual.pagina === paginaActual
            ? '. Puede mover y redimensionar el recuadro.'
            : '. Arrastre en esta página para dibujar un nuevo recuadro.'}
        </p>
      )}
    </div>
  );
}