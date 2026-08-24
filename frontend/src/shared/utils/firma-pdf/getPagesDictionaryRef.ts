// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/getPagesDictionaryRef.js), sin cambios de lógica.
import { FirmaPdfError } from '../FirmaPdfError';
import type { ReadPdfReturnType } from './readPdf';

export function getPagesDictionaryRef(info: ReadPdfReturnType): string {
  const pagesRefRegex = /\/Pages\s+(\d+\s+\d+\s+R)/g;
  const match = pagesRefRegex.exec(info.root.toString());
  if (match === null) {
    throw new FirmaPdfError('No se pudo encontrar el descriptor de páginas del PDF.');
  }
  return match[1];
}
