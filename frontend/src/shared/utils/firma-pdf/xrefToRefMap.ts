// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/xrefToRefMap.js), sin cambios de lógica.
// Ver frontend/src/shared/utils/firma-pdf/README.md para el motivo de vendorizar este paquete.
import { FirmaPdfError } from '../FirmaPdfError';

export function xrefToRefMap(xrefString: string): Map<number, number> {
  const lines = xrefString.split('\n').filter((l) => l !== '');
  let index = 0;
  let expectedLines = 0;
  const xref = new Map<number, number>();
  lines.forEach((line) => {
    const split = line.split(' ');
    if (split.length === 2) {
      index = parseInt(split[0], 10);
      expectedLines = parseInt(split[1], 10);
      return;
    }
    if (expectedLines <= 0) {
      throw new FirmaPdfError('Too many lines in xref table.');
    }
    expectedLines -= 1;
    const [offset, , inUse] = split;
    if (inUse.trim() === 'f') {
      index += 1;
      return;
    }
    if (inUse.trim() !== 'n') {
      throw new FirmaPdfError(`Unknown in-use flag "${inUse}". Expected "n" or "f".`);
    }
    if (!/^\d+$/.test(offset.trim())) {
      throw new FirmaPdfError(`Expected integer offset. Got "${offset}".`);
    }
    const storeOffset = parseInt(offset.trim(), 10);
    xref.set(index, storeOffset);
    index += 1;
  });
  return xref;
}
