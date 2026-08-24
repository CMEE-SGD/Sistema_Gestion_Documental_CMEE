// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/getIndexFromRef.js), sin cambios de lógica.
import { FirmaPdfError } from '../FirmaPdfError';
import type { ReadRefTableReturnType } from './readRefTable';

export function getIndexFromRef(refTable: ReadRefTableReturnType, ref: string): number {
  const [indexStr] = ref.split(' ');
  const index = parseInt(indexStr, 10);
  if (!refTable.offsets.has(index)) {
    throw new FirmaPdfError(`Failed to locate object "${ref}".`);
  }
  return index;
}
