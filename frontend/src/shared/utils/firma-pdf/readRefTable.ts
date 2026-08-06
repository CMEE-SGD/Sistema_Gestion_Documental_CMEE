// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/readRefTable.js), sin cambios de lógica.
import { FirmaPdfError } from '../FirmaPdfError';
import { xrefToRefMap } from './xrefToRefMap';

export type FullXrefTable = Map<number, number>;

export interface ReadRefTableReturnType {
  startingIndex: number;
  maxIndex: number;
  offsets: FullXrefTable;
}

export function getLastTrailerPosition(pdf: Buffer): number {
  const trailerStart = pdf.lastIndexOf(Buffer.from('trailer', 'utf8'));
  const trailer = pdf.slice(trailerStart, pdf.length - 6);
  const xRefPosition = trailer
    .slice(trailer.lastIndexOf(Buffer.from('startxref', 'utf8')) + 10)
    .toString();
  return parseInt(xRefPosition, 10);
}

export function getXref(
  pdf: Buffer,
  position: number,
): { size: number; prev: string | undefined; xRefContent: Map<number, number> } {
  let refTable = pdf.slice(position);
  const realPosition = refTable.indexOf(Buffer.from('xref', 'utf8'));
  if (realPosition === -1) {
    throw new FirmaPdfError(`Could not find xref anywhere at or after ${position}.`);
  }
  if (realPosition > 0) {
    const prefix = refTable.slice(0, realPosition);
    if (prefix.toString().replace(/\s*/g, '') !== '') {
      throw new FirmaPdfError(`Expected xref at ${position} but found other content.`);
    }
  }
  const nextEofPosition = refTable.indexOf(Buffer.from('%%EOF', 'utf8'));
  if (nextEofPosition === -1) {
    throw new FirmaPdfError('Expected EOF after xref and trailer but could not find one.');
  }
  refTable = refTable.slice(0, nextEofPosition);
  refTable = refTable.slice(realPosition + 4);
  refTable = refTable.slice(refTable.indexOf('\n') + 1);

  const sizeStr = refTable.toString().split('/Size')[1];
  if (!sizeStr) {
    throw new FirmaPdfError('Size not found in xref table.');
  }
  const sizeMatch = /^\s*(\d+)/.exec(sizeStr);
  if (sizeMatch === null) {
    throw new FirmaPdfError('Failed to parse size of xref table.');
  }
  const size = parseInt(sizeMatch[1], 10);

  const [objects, infos] = refTable.toString().split('trailer');
  const isContainingPrev = infos.split('/Prev')[1] != null;
  let prev: string | undefined;
  if (isContainingPrev) {
    const pagesRefRegex = /Prev (\d+)/g;
    const match = pagesRefRegex.exec(infos);
    if (match) {
      [, prev] = match;
    }
  }
  const xRefContent = xrefToRefMap(objects);
  return { size, prev, xRefContent };
}

function getFullXref(pdf: Buffer, xRefPosition: number): FullXrefTable {
  const lastXrefTable = getXref(pdf, xRefPosition);
  if (lastXrefTable.prev === undefined) {
    return lastXrefTable.xRefContent;
  }
  const partOfXrefTable = getFullXref(pdf, parseInt(lastXrefTable.prev, 10));
  return new Map([...partOfXrefTable, ...lastXrefTable.xRefContent]);
}

export function getFullXrefTable(pdf: Buffer): FullXrefTable {
  const lastTrailerPosition = getLastTrailerPosition(pdf);
  return getFullXref(pdf, lastTrailerPosition);
}

export function readRefTable(pdf: Buffer): ReadRefTableReturnType {
  const fullXrefTable = getFullXrefTable(pdf);
  const startingIndex = 0;
  const maxIndex = Math.max(...fullXrefTable.keys());
  return { startingIndex, maxIndex, offsets: fullXrefTable };
}
