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

export function getPageRef(pdfBuffer: Buffer, info: ReadPdfReturnType, paginaIndex = 0): string {
  const pagesRef = getPagesDictionaryRef(info);
  const pagesDictionary = findObject(pdfBuffer, info.xref, pagesRef);
  const kidsPosition = pagesDictionary.indexOf('/Kids');
  if (kidsPosition === -1) {
    throw new FirmaPdfError('El PDF no tiene un árbol de páginas /Kids reconocible.');
  }
  const kidsStart = pagesDictionary.indexOf('[', kidsPosition) + 1;
  const kidsEnd = pagesDictionary.indexOf(']', kidsPosition);
  const kids = dividirEnReferencias(pagesDictionary.slice(kidsStart, kidsEnd).toString());

  const referenciaPagina = kids[paginaIndex];
  if (!referenciaPagina) {
    throw new FirmaPdfError(
      `El PDF no tiene una página en la posición ${paginaIndex + 1} (tiene ${kids.length}).`,
    );
  }

  // El objeto referenciado debe ser una página de verdad (/Type /Page), no un nodo
  // intermedio del árbol (/Type /Pages) — este parser simplificado no soporta
  // recorrer árboles de páginas anidados.
  const paginaDictionary = findObject(pdfBuffer, info.xref, referenciaPagina).toString();
  if (!/\/Type\s*\/Page(?!s)/.test(paginaDictionary)) {
    throw new FirmaPdfError(
      'El árbol de páginas de este PDF tiene una estructura anidada no soportada; no se puede colocar el sello ahí.',
    );
  }

  return referenciaPagina;
}
