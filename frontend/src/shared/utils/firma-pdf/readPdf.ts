// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/readPdf.js), sin cambios de lógica.
import { findObject } from './findObject';
import { readRefTable, type ReadRefTableReturnType } from './readRefTable';

export interface ReadPdfReturnType {
  xref: ReadRefTableReturnType;
  rootRef: string;
  root: Buffer;
  infoRef: string | undefined;
  trailerStart: number;
  previousXrefs: unknown[];
  xRefPosition: number;
}

export function getValue(trailer: Buffer, key: string): string | undefined {
  let index = trailer.indexOf(key);
  if (index === -1) {
    return undefined;
  }
  const slice = trailer.slice(index);
  index = slice.indexOf('/', 1);
  if (index === -1) {
    index = slice.indexOf('>', 1);
  }
  return slice.slice(key.length + 1, index).toString().trim();
}

export function readPdf(pdfBuffer: Buffer): ReadPdfReturnType {
  const trailerStart = pdfBuffer.lastIndexOf('trailer');
  const trailer = pdfBuffer.slice(trailerStart, pdfBuffer.length - 6);
  const xRefPositionStr = trailer.slice(trailer.lastIndexOf('startxref') + 10).toString();
  const xRefPosition = parseInt(xRefPositionStr, 10);
  const refTable = readRefTable(pdfBuffer);
  const rootRef = getValue(trailer, '/Root') as string;
  const root = findObject(pdfBuffer, refTable, rootRef);
  const infoRef = getValue(trailer, '/Info');
  return {
    xref: refTable,
    rootRef,
    root,
    infoRef,
    trailerStart,
    previousXrefs: [],
    xRefPosition,
  };
}
