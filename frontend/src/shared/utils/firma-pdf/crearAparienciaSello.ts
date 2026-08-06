// Código nuevo (no vendorizado): construye el "content stream" del sello visual
// (recuadro + texto) como bytes PDF crudos, para insertarlo como la apariencia
// (/AP /N) del widget de firma — reemplaza lo que antes hacía pdf-lib dibujando
// sobre la página completa. Mismas medidas/estilo que el sello anterior
// (ver historial de agregarSelloVisual en firmarPdf.ts).

const FONT_SIZE = 8;
const INTERLINEADO = FONT_SIZE + 3;
const RELLENO = 6;

/** Convierte cada carácter a su byte WinAnsi/Latin-1 y escapa los caracteres
 * especiales de las cadenas PDF ( ) \ — necesario para tildes/ñ en nombres reales. */
function codificarLineaPdf(texto: string): Buffer {
  const bytesEscapados: number[] = [];
  for (let i = 0; i < texto.length; i += 1) {
    const code = texto.charCodeAt(i);
    const byte = code <= 0xff ? code : 0x3f; // '?' de respaldo si no es representable en WinAnsi
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      bytesEscapados.push(0x5c, byte); // \( \) \\
    } else {
      bytesEscapados.push(byte);
    }
  }
  return Buffer.from(bytesEscapados);
}

/** Mide el ancho de una línea con la misma fuente que se usará en el PDF (aproximado
 * vía Canvas — Helvetica no siempre está instalada, pero Arial es metricamente muy
 * similar y el recuadro se calcula con margen suficiente). */
function medirAnchoTexto(texto: string, fontSize: number): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return texto.length * fontSize * 0.6; // respaldo burdo si el navegador no soporta canvas
  ctx.font = `${fontSize}px Helvetica, Arial, sans-serif`;
  return ctx.measureText(texto).width;
}

export interface AparienciaSello {
  ancho: number;
  alto: number;
  /** Bytes ya listos para ir entre "stream" y "endstream". */
  contentStream: Buffer;
}

export function construirAparienciaSello(lineas: string[]): AparienciaSello {
  const anchoTexto = Math.max(...lineas.map((l) => medirAnchoTexto(l, FONT_SIZE)));
  const ancho = anchoTexto + RELLENO * 2;
  const alto = lineas.length * INTERLINEADO + RELLENO * 2 - (INTERLINEADO - FONT_SIZE);

  const partes: Buffer[] = [];
  partes.push(
    Buffer.from(
      [
        'q',
        '/GS1 gs',
        '1 0.98 0.85 rg',
        '0.6 0.5 0 RG',
        '0.75 w',
        `0 0 ${ancho.toFixed(2)} ${alto.toFixed(2)} re`,
        'B',
        'Q',
        'q',
        '0.15 0.15 0.15 rg',
        'BT',
        `/F1 ${FONT_SIZE} Tf`,
        `1 0 0 1 ${RELLENO.toFixed(2)} ${(alto - RELLENO - FONT_SIZE).toFixed(2)} Tm`,
        '',
      ].join('\n'),
      'ascii',
    ),
  );

  lineas.forEach((linea, i) => {
    if (i > 0) {
      partes.push(Buffer.from(`0 ${-INTERLINEADO} Td\n`, 'ascii'));
    }
    partes.push(Buffer.from('(', 'ascii'));
    partes.push(codificarLineaPdf(linea));
    partes.push(Buffer.from(') Tj\n', 'ascii'));
  });

  partes.push(Buffer.from('ET\nQ', 'ascii'));

  return { ancho, alto, contentStream: Buffer.concat(partes) };
}
