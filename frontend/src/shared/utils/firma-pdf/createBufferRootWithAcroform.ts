// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/createBufferRootWithAcroform.js), sin cambios de lógica.
import { getIndexFromRef } from './getIndexFromRef';
import type { ReadPdfReturnType } from './readPdf';

export function createBufferRootWithAcroform(
  pdf: Buffer,
  info: ReadPdfReturnType,
  form: { toString(): string },
): Buffer {
  const rootIndex = getIndexFromRef(info.xref, info.rootRef);
  return Buffer.concat([
    Buffer.from(`${rootIndex} 0 obj\n`),
    Buffer.from('<<\n'),
    Buffer.from(`${info.root}\n`),
    Buffer.from(`/AcroForm ${form}`),
    Buffer.from('\n>>\nendobj\n'),
  ]);
}
