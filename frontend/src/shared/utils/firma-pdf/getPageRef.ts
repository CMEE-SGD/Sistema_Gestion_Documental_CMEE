// Adaptado desde @signpdf/placeholder-plain@3.3.0 (dist/getPageRef.js) — el original
// siempre devuelve la PRIMERA página de /Kids (no importaba porque el widget de firma
// era invisible). Aquí se modifica para devolver la página que el usuario eligió al
// hacer clic en el PDF (ver SelectorPosicionFirma.tsx), ya que ahora el sello se dibuja
// como la apariencia visible del widget de firma en esa página específica.
import { FirmaPdfError } from '../FirmaPdfError';
import { findObject } from './findObject';
import { getPagesDictionaryRef } from './getPagesDictionaryRef';
import type { ReadPdfReturnType } from './readPdf';

/** Divide el contenido de un array PDF tipo "3 0 R 4 0 R" en referencias "N G R". */
function dividirEnReferencias(contenido: string): string[] {
  const tokens = contenido.trim().split(/\s+/).filter(Boolean);
  const referencias: string[] = [];
  for (let i = 0; i + 3 <= tokens.length; i += 3) {
    referencias.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  }
  return referencias;
}

function extraerKids(dictionary: Buffer): string[] {
  const kidsPosition = dictionary.indexOf('/Kids');
  if (kidsPosition === -1) return [];
  const kidsStart = dictionary.indexOf('[', kidsPosition) + 1;
  const kidsEnd = dictionary.indexOf(']', kidsPosition);
  return dividirEnReferencias(dictionary.slice(kidsStart, kidsEnd).toString());
}

/**
 * El árbol de páginas de un PDF no siempre es un único /Kids plano con
 * todas las páginas — documentos de varias páginas (sobre todo plantillas
 * armadas por Word/herramientas de fusión) suelen anidar nodos /Pages
 * intermedios, cada uno con su propio /Kids. Se recorre en preorden,
 * contando únicamente las hojas /Type /Page en el orden real del
 * documento, hasta llegar al índice buscado — así "página 9" encuentra la
 * novena hoja del árbol sin importar cuántos niveles de /Pages haya en el
 * camino.
 */
function buscarPaginaEnArbol(
  pdfBuffer: Buffer,
  info: ReadPdfReturnType,
  nodoRef: string,
  objetivo: number,
  contador: { actual: number },
): string | null {
  const dictionary = findObject(pdfBuffer, info.xref, nodoRef);
  const esHoja = /\/Type\s*\/Page(?!s)/.test(dictionary.toString());

  if (esHoja) {
    if (contador.actual === objetivo) return nodoRef;
    contador.actual += 1;
    return null;
  }

  const kids = extraerKids(dictionary);
  if (kids.length === 0) {
    throw new FirmaPdfError(
      'El árbol de páginas de este PDF tiene una estructura no reconocible; no se puede colocar el sello ahí.',
    );
  }
  for (const kidRef of kids) {
    const encontrada = buscarPaginaEnArbol(pdfBuffer, info, kidRef, objetivo, contador);
    if (encontrada) return encontrada;
  }
  return null;
}

export function getPageRef(pdfBuffer: Buffer, info: ReadPdfReturnType, paginaIndex = 0): string {
  const pagesRef = getPagesDictionaryRef(info);
  const contador = { actual: 0 };
  const referenciaPagina = buscarPaginaEnArbol(pdfBuffer, info, pagesRef, paginaIndex, contador);

  if (!referenciaPagina) {
    throw new FirmaPdfError(
      `El PDF no tiene una página en la posición ${paginaIndex + 1} (tiene ${contador.actual}).`,
    );
  }

  return referenciaPagina;
}
