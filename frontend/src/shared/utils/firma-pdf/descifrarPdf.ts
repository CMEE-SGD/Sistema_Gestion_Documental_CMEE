// Quita el cifrado de un PDF protegido solo con restricciones de permisos (el
// caso habitual: se abre sin pedir contraseña, pero el programa que lo generó
// le puso una contraseña de "propietario" que limita copiar/imprimir/editar).
//
// Es necesario para poder firmarlo: ver pdfEstaCifrado.ts — firmar un PDF
// cifrado sin quitarle el cifrado lo deja en blanco en Adobe Acrobat. Una vez
// firmado, la propia firma digital protege el documento contra modificaciones.
//
// Solo se reescribe el archivo si NO trae ya una firma digital: reescribirlo
// invalidaría esa firma (los offsets de su /ByteRange dejan de coincidir).
//
// La librería (@cantoo/pdf-lib, una copia de pdf-lib con soporte de lectura de
// PDFs cifrados: RC4 de 40/128 bits, AES-128 y AES-256) se carga solo cuando
// llega un PDF cifrado, así que no pesa para el resto de los usuarios.
import { FirmaPdfError } from '../FirmaPdfError';
import {
  MENSAJE_PDF_CIFRADO_Y_FIRMADO,
  MENSAJE_PDF_CON_CONTRASENA,
  pdfEstaCifrado,
  pdfTieneFirmaDigital,
} from './pdfEstaCifrado';

const MENSAJE_GENERICO =
  'No se pudo quitar la protección de este PDF para firmarlo. Vuelva a generarlo sin cifrado ni restricciones y cárguelo de nuevo.';

export async function descifrarPdf(pdf: Uint8Array): Promise<Uint8Array> {
  if (pdfTieneFirmaDigital(pdf)) throw new FirmaPdfError(MENSAJE_PDF_CIFRADO_Y_FIRMADO);

  let limpio: Uint8Array;
  try {
    const { PDFDocument } = await import('@cantoo/pdf-lib');
    // password '' = la contraseña de usuario vacía (el PDF se abre sin pedirla).
    // updateMetadata false: no tocar Producer/ModDate del documento.
    const doc = await PDFDocument.load(pdf, { password: '', updateMetadata: false });
    // Sin object streams: el código de firma solo entiende la tabla xref clásica
    // (ver asegurarXrefClasico.ts).
    limpio = await doc.save({ useObjectStreams: false });
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error('[firma] No se pudo quitar el cifrado del PDF:', err);
    if (/password/i.test(mensaje)) throw new FirmaPdfError(MENSAJE_PDF_CON_CONTRASENA);
    throw new FirmaPdfError(`${MENSAJE_GENERICO} (Detalle técnico: ${mensaje.slice(0, 160)})`);
  }

  // Nunca entregar algo que siga cifrado: se firmaría y quedaría en blanco.
  if (pdfEstaCifrado(limpio)) throw new FirmaPdfError(MENSAJE_GENERICO);
  return limpio;
}
