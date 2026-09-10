// Genera el bloque QR del sello de firma como operadores PDF crudos (`re`/`f`),
// nunca como imagen — cada módulo oscuro se traduce a un rectángulo vectorial,
// consistente con el resto del sello (crearAparienciaSello.ts), que también se
// dibuja a mano sin pdf-lib/pdfkit ni codificación de imágenes raster.
//
// El color de los módulos es configurable (el sello usa azul medio #0000CD) y
// se "perfora" una zona cuadrada en el centro para alojar el logo institucional
// (crearAparienciaSello.ts incrusta ahí un XObject de imagen) — el QR cambia el
// color de fondo para que el logo quede visible.
import { create as crearMatrizQr } from 'qrcode';

export interface BloqueQr {
  /** El bloque siempre es cuadrado — ancho === alto. */
  ancho: number;
  alto: number;
  /** Operadores ya listos, en coordenadas LOCALES con origen en la esquina
   * inferior-izquierda del bloque (0,0) — el llamador los posiciona con `cm`. */
  operadores: Buffer;
  /** Esquina central "perforada" (sin módulos) donde irá el logo, en puntos
   * PDF y en las mismas coordenadas locales del bloque. `null` si no hubo QR. */
  centro: { x: number; y: number; tamano: number } | null;
}

// 'H' (máxima redundancia, tolera hasta ~30% de módulos dañados) — no es
// opcional cuando el QR lleva un logo perforado en el centro. El hueco de
// LOGO_CLEAR_MODULOS ya "borra" ~8-9% de los módulos de datos: con 'L'
// (tolera ~7%) ese hueco por sí solo ya agota o supera todo el margen de
// corrección, antes de sumar cualquier imperfección real (impresión,
// brillo de pantalla, ángulo de cámara) — por eso el QR con logo no
// escaneaba. Con 'H' ese mismo hueco usa como una cuarta parte del margen
// disponible, dejando espacio de sobra para condiciones reales. El costo es
// un QR con más módulos (más grande) para la misma URL — inevitable: un QR
// compacto y uno perforable para logo son objetivos en conflicto.
const NIVEL_CORRECCION = 'H';

// Lado de la zona central perforada para el logo, como proporción de la matriz
// real del QR (sin contar el margen de silencio). 30% es el máximo sensato sin
// arriesgar la lectura: el QR sigue teniendo sus 3 cuadrantes de position markers.
const LOGO_CLEAR_MODULOS = 0.3;

function hexAComponentes(hex: string): { r: string; g: string; b: string } {
  const limpio = hex.replace('#', '');
  return {
    r: (parseInt(limpio.slice(0, 2), 16) / 255).toFixed(5),
    g: (parseInt(limpio.slice(2, 4), 16) / 255).toFixed(5),
    b: (parseInt(limpio.slice(4, 6), 16) / 255).toFixed(5),
  };
}

/**
 * Construye el bloque QR que codifica `url`. `moduloPt` es el tamaño de cada
 * módulo en puntos PDF; `zonaSilencioModulos` es el margen en blanco alrededor
 * (ISO/IEC 18004 recomienda 4 módulos para códigos que se puedan imprimir);
 * `colorHex` (#RRGGBB) es el color de relleno de los módulos.
 */
export function construirBloqueQr(
  url: string,
  moduloPt: number,
  zonaSilencioModulos: number,
  colorHex = '#000000',
): BloqueQr {
  const qr = crearMatrizQr(url, { errorCorrectionLevel: NIVEL_CORRECCION });
  const size = qr.modules.size;
  const data = qr.modules.data; // Uint8Array fila-mayor: data[row*size+col], 1 = módulo oscuro

  const anchoModulos = size + zonaSilencioModulos * 2;
  const ancho = anchoModulos * moduloPt;

  // Zona central que se deja en blanco para el logo (en módulos de la matriz,
  // sin margen de silencio). Se centra usando Math.floor para que quede donde
  // estén los alineamiento markers — no sobre los 3 position markers de esquina.
  const centroModulos = Math.max(1, Math.floor(size * LOGO_CLEAR_MODULOS));
  const c0 = Math.floor((size - centroModulos) / 2);
  const c1 = c0 + centroModulos;

  // Fusiona corridas horizontales contiguas por fila en un solo rect — reduce
  // considerablemente el número de operadores `re` sin cambiar el resultado visual.
  const rects: string[] = [];
  for (let row = 0; row < size; row += 1) {
    let colInicioCorrida = -1;
    for (let col = 0; col <= size; col += 1) {
      const oscuro = col < size && data[row * size + col] === 1;
      if (oscuro && colInicioCorrida === -1) {
        colInicioCorrida = col;
      } else if (!oscuro && colInicioCorrida !== -1) {
        const colFin = col; // exclusivo
        // Saltea cualquier corrida que toque la zona central perforada — así el
        // cuadrado del logo queda sin módulos encima (fondo blanco del widget).
        const dentroCentro = row >= c0 && row < c1 && colInicioCorrida < c1 && colFin > c0;
        if (!dentroCentro) {
          const anchoCorrida = colFin - colInicioCorrida;
          const x = (zonaSilencioModulos + colInicioCorrida) * moduloPt;
          // La fila 0 de la matriz QR es la fila visual SUPERIOR, pero el eje Y
          // de PDF crece hacia arriba — sin esta inversión el QR sale espejado
          // verticalmente e ilegible para cualquier lector.
          const y = (zonaSilencioModulos + (size - 1 - row)) * moduloPt;
          rects.push(
            `${x.toFixed(2)} ${y.toFixed(2)} ${(anchoCorrida * moduloPt).toFixed(2)} ${moduloPt.toFixed(2)} re`,
          );
        }
        colInicioCorrida = -1;
      }
    }
  }

  const { r, g, b } = hexAComponentes(colorHex);
  const operadores = Buffer.from(['q', '/GS2 gs', `${r} ${g} ${b} rg`, ...rects, 'f', 'Q'].join('\n'), 'ascii');

  // Centro del área perforada en puntos PDF (coordenadas locales del bloque,
  // con el margen de silencio ya contado) — punto donde centrar el logo.
  const centroModulosPdf = centroModulos * moduloPt;
  return {
    ancho,
    alto: ancho,
    operadores,
    centro: {
      x: (zonaSilencioModulos + c0 + centroModulos / 2) * moduloPt,
      y: (zonaSilencioModulos + size - (c0 + centroModulos / 2)) * moduloPt,
      tamano: centroModulosPdf,
    },
  };
}