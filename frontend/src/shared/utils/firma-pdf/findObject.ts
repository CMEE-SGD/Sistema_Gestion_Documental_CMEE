// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/findObject.js), sin cambios de lógica.
import { getIndexFromRef } from './getIndexFromRef';
import type { ReadRefTableReturnType } from './readRefTable';

export function findObject(pdf: Buffer, refTable: ReadRefTableReturnType, ref: string): Buffer {
  const index = getIndexFromRef(refTable, ref);
  const offset = refTable.offsets.get(index) as number;
  let slice = pdf.slice(offset);
  slice = slice.slice(0, slice.indexOf('endobj'));

  slice = slice.slice(slice.indexOf('<<') + 2);
  slice = slice.slice(0, slice.lastIndexOf('>>'));
  return slice;
}
