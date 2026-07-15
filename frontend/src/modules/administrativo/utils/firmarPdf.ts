// Firma digital PAdES/PKCS#7 realizada enteramente en el navegador del
// firmante: el archivo .p12 y su contraseña nunca salen de esta máquina.
// Solo el PDF ya firmado se sube al servidor (que lo vuelve a verificar
// criptográficamente antes de aceptarlo — ver backend/src/common/helpers/pdf-signature.ts).
import { SignPdf } from '@signpdf/signpdf';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { P12Signer } from '@signpdf/signer-p12';
import { FirmaPdfError } from './FirmaPdfError';

export { FirmaPdfError };

/**
 * Firma un PDF con un certificado .p12 en el navegador.
 * @param pdfBytes El PDF a firmar (el original, o uno que ya trae firmas previas).
 * @param p12File El archivo .p12 seleccionado por el usuario.
 * @param password La contraseña del .p12 (nunca se envía al servidor).
 * @param razon Motivo de la firma, embebido en el propio PDF (ej. "Aprobación de Jefatura").
 */
export async function firmarPdfConP12(
  pdfBytes: Uint8Array,
  p12File: File,
  password: string,
  razon: string,
): Promise<Uint8Array> {
  const pdfBuffer = Buffer.from(pdfBytes);
  const p12Bytes = new Uint8Array(await p12File.arrayBuffer());
  const p12Buffer = Buffer.from(p12Bytes);

  let pdfConPlaceholder: Buffer;
  try {
    pdfConPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: razon,
      contactInfo: '',
      name: '',
      location: 'Centro de Metrología del Ejército Ecuatoriano',
      signatureLength: 8192,
    });
  } catch {
    throw new FirmaPdfError(
      'No se pudo preparar el PDF para la firma. Verifique que el archivo no esté dañado.',
    );
  }

  const signer = new P12Signer(p12Buffer, { passphrase: password });
  const signPdf = new SignPdf();

  try {
    const pdfFirmado = await signPdf.sign(pdfConPlaceholder, signer);
    return new Uint8Array(pdfFirmado);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : '';
    if (/mac|integrity|invalid password|pkcs#?12/i.test(mensaje)) {
      throw new FirmaPdfError(
        'La contraseña del certificado .p12 es incorrecta, o el archivo no es un certificado válido.',
      );
    }
    throw new FirmaPdfError(
      'No se pudo completar la firma digital. Verifique el archivo .p12 y la contraseña.',
    );
  }
}
