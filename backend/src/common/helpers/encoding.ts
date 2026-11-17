/**
 * Utilidades de codificación para textos que entran por HTTP.
 *
 * Contexto: multer decodifica el nombre de archivo del header
 * `Content-Disposition` como latin1 (comportamiento histórico de busboy).
 * Un archivo llamado "Certificado de calibración.pdf" llega entonces como
 * "Certificado de calibraciÃ³n.pdf". Si ese string se guarda tal cual en la
 * base de datos o en disco, queda permanentemente corrupto (mojibake).
 *
 * `decodificarNombreArchivo` revierte esa decodificación y devuelve el
 * nombre real en UTF-8.
 *
 * El reparador cubre los DOS sabores de mojibake que aparecen en la práctica:
 *   1. UTF-8 leído como latin1   ->  "Ã³"      (U+00C3 U+00B3)
 *   2. UTF-8 leído como cp1252   ->  "Ã“"      (U+00C3 U+201C)
 * El segundo es el que produce Windows al copiar/pegar o al importar desde
 * Excel, y es fácil de pasar por alto porque no cae en el rango 0x80-0xBF.
 */

// Reverso del mapa cp1252 para los code points 0x80-0x9F reasignados.
const CP1252_REV: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

/** Byte (0..255) que corresponde a un code point leído como cp1252, o null. */
function byteCp1252(cp: number): number | null {
  if (CP1252_REV[cp] !== undefined) return CP1252_REV[cp];
  if (cp <= 0xff) return cp;
  return null;
}

/** ¿Puede ser un byte inicial de UTF-8 (leído como latin1/cp1252)? */
const esInicialUtf8 = (cp: number): boolean => cp >= 0xc2 && cp <= 0xf4;

/** ¿Puede ser un byte de continuación de UTF-8 (leído como latin1/cp1252)? */
function esContinuacion(cp: number): boolean {
  const b = byteCp1252(cp);
  return b !== null && b >= 0x80 && b <= 0xbf;
}

/** Intenta decodificar un tramo; devuelve null si queda inválido. */
function repararTramo(tramo: string): string | null {
  const bytes: number[] = [];
  for (const ch of tramo) {
    const b = byteCp1252(ch.codePointAt(0) as number);
    if (b === null) return null;
    bytes.push(b);
  }
  const texto = Buffer.from(bytes).toString('utf8');
  return texto.includes('\uFFFD') ? null : texto;
}

/**
 * Corrige un texto con mojibake producido al decodificar UTF-8 como latin1
 * o como windows-1252.
 *
 * Repara únicamente los tramos dañados, de modo que un texto que mezcle partes
 * correctas y partes rotas quede bien en su totalidad. Si el texto ya es válido
 * se devuelve sin cambios. Si un tramo no puede repararse sin pérdida, se
 * conserva tal cual.
 */
export function corregirMojibake(texto: string): string {
  if (typeof texto !== 'string' || texto.length === 0) return texto;

  const chars = [...texto];
  let salida = '';
  let i = 0;

  while (i < chars.length) {
    const cp = chars[i].codePointAt(0) as number;

    if (
      esInicialUtf8(cp) &&
      i + 1 < chars.length &&
      esContinuacion(chars[i + 1].codePointAt(0) as number)
    ) {
      // Contar bytes de continuación (UTF-8 admite hasta 3 tras un inicial).
      let n = 1;
      while (
        n < 4 &&
        i + n < chars.length &&
        esContinuacion(chars[i + n].codePointAt(0) as number)
      ) {
        n++;
      }

      // Probar el tramo más largo que decodifique limpio.
      let reparado = false;
      for (let len = n; len >= 2; len--) {
        const rep = repararTramo(chars.slice(i, i + len).join(''));
        if (rep !== null) {
          salida += rep;
          i += len;
          reparado = true;
          break;
        }
      }
      if (reparado) continue;
    }

    salida += chars[i];
    i++;
  }

  return salida;
}

/**
 * Devuelve el nombre de archivo real de un `Express.Multer.File`.
 * Corrige el mojibake que introduce multer al leer el header.
 */
export function decodificarNombreArchivo(
  originalname: string | undefined | null,
): string {
  if (!originalname) return '';
  return corregirMojibake(originalname);
}
