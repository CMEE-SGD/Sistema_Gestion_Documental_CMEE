// Genera el bloque QR del sello de firma como operadores PDF crudos (`re`/`f`),
// nunca como imagen — cada módulo oscuro se traduce a un rectángulo vectorial,
// consistente con el resto del sello (crearAparienciaSello.ts), que también se
// dibuja a mano sin pdf-lib/pdfkit ni codificación de imágenes raster.
import { create as crearMatrizQr } from 'qrcode';

export interface BloqueQr {
  /** El bloque siempre es cuadrado — ancho === alto. */
  ancho: number;
  alto: number;
  /** Operadores ya listos, en coordenadas LOCALES con origen en la esquina
   * inferior-izquierda del bloque (0,0) — el llamador los posiciona con `cm`. */
  operadores: Buffer;
}

// 'L' en vez de 'M': menos redundancia, pero genera bastantes menos módulos
// para la misma URL — necesario para que el QR no le gane en tamaño al
// bloque de texto (ver nota en crearAparienciaSello.ts).
const NIVEL_CORRECCION = 'L';

/**
 * Construye el bloque QR que codifica `url`. `moduloPt` es el tamaño de cada
 * módulo en puntos PDF; `zonaSilencioModulos` es el margen en blanco alrededor
 * (ISO/IEC 18004 recomienda 4 módulos para códigos que se puedan imprimir).
 */
export function construirBloqueQr(
  url: string,
  moduloPt: number,
  zonaSilencioModulos: number,
): BloqueQr {
  const qr = crearMatrizQr(url, { errorCorrectionLevel: NIVEL_CORRECCION });
  const size = qr.modules.size;
  const data = qr.modules.data; // Uint8Array fila-mayor: data[row*size+col], 1 = módulo oscuro

  const anchoModulos = size + zonaSilencioModulos * 2;
  const ancho = anchoModulos * moduloPt;

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
        const anchoCorrida = col - colInicioCorrida;
        const x = (zonaSilencioModulos + colInicioCorrida) * moduloPt;
        // La fila 0 de la matriz QR es la fila visual SUPERIOR, pero el eje Y
        // de PDF crece hacia arriba — sin esta inversión el QR sale espejado
        // verticalmente e ilegible para cualquier lector.
        const y = (zonaSilencioModulos + (size - 1 - row)) * moduloPt;
        rects.push(
          `${x.toFixed(2)} ${y.toFixed(2)} ${(anchoCorrida * moduloPt).toFixed(2)} ${moduloPt.toFixed(2)} re`,
        );
        colInicioCorrida = -1;
      }
    }
  }

  const operadores = Buffer.from(['q', '/GS2 gs', '0 0 0 rg', ...rects, 'f', 'Q'].join('\n'), 'ascii');

  return { ancho, alto: ancho, operadores };
}
