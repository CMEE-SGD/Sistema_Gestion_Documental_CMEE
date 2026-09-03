// Firma digital PAdES/PKCS#7 realizada enteramente en el navegador del
// firmante: el archivo .p12 y su contraseña nunca salen de esta máquina.
// Solo el PDF ya firmado se sube al servidor (que lo vuelve a verificar
// criptográficamente antes de aceptarlo — ver backend/src/common/helpers/pdf-signature.ts).
// Compartido entre certificados (administrativo) y Gestor Documental.
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
// Namespace import a propósito: con `import forge from 'node-forge'` el
// bundle compila pero `forge.pki`/`forge.pkcs12` quedan `undefined` en
// tiempo de ejecución (ver el mismo problema ya resuelto en el backend).
import * as forge from 'node-forge';
import { FirmaPdfError } from './FirmaPdfError';
import { agregarSelloYPlaceholder } from './firma-pdf/agregarSelloYPlaceholder';
import { asegurarXrefClasico } from './firma-pdf/asegurarXrefClasico';
import type { PosicionFirma } from '../components/organisms/SelectorPosicionFirma';

export { FirmaPdfError };
export type { PosicionFirma };

/**
 * Lee el nombre (CN) del titular real del certificado .p12 — el mismo dato
 * que usa el servidor al verificar la firma — para mostrarlo en el sello
 * visual. Si no se puede leer (contraseña incorrecta, certificado sin CN),
 * devuelve null y el llamador decide el texto de respaldo.
 */
export function extraerTitularCertificado(
  p12Buffer: Buffer,
  password: string,
): string | null {
  try {
    const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
    const bolsas = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certificado = bolsas[forge.pki.oids.certBag]?.[0]?.cert;
    const cn = certificado?.subject.getField('CN');
    return cn?.value || null;
  } catch {
    return null;
  }
}

/**
 * Firma un PDF con un certificado .p12 en el navegador.
 * @param pdfBytes El PDF a firmar (el original, o uno que ya trae firmas previas).
 * @param p12File El archivo .p12 seleccionado por el usuario.
 * @param password La contraseña del .p12 (nunca se envía al servidor).
 * @param razon Motivo de la firma, embebido en el propio PDF (campo /Reason del
 *   diccionario de firma) aunque ya no se imprima como línea visible del sello.
 * @param sello Si se provee, dibuja un sello visual en esa posición antes de firmar,
 *   con el nombre real del titular del certificado (no el usuario de la sesión).
 *   `qrUrl`, si se provee, dibuja un QR a la izquierda del sello — solo tiene
 *   sentido cuando existe una página pública de verificación para ese documento
 *   (Certificados apunta a /verificar/:codigo, Gestor Documental a
 *   /verificar-documento/:codigo).
 */
export async function firmarPdfConP12(
  pdfBytes: Uint8Array,
  p12File: File,
  password: string,
  razon: string,
  sello?: { posicion: PosicionFirma; qrUrl?: string },
): Promise<Uint8Array> {
  const p12Bytes = new Uint8Array(await p12File.arrayBuffer());
  const p12Buffer = Buffer.from(p12Bytes);

  let selloParaPlaceholder:
    | { posicion: PosicionFirma; etiqueta: string; nombre: string; qrUrl?: string }
    | undefined;
  if (sello) {
    const titular = extraerTitularCertificado(p12Buffer, password) ?? 'Titular del certificado';
    selloParaPlaceholder = {
      posicion: sello.posicion,
      etiqueta: 'Firmado electrónicamente por:',
      nombre: titular,
      qrUrl: sello.qrUrl,
    };
  }

  const pdfBuffer = Buffer.from(pdfBytes);

  // El sello visual y el espacio de la firma se agregan en un solo paso de
  // actualización incremental (ver agregarSelloYPlaceholder.ts) — nunca se
  // reparsea ni reescriben los bytes existentes, así que firmas previas de
  // otros firmantes en el mismo documento quedan intactas.
  let pdfConPlaceholder: Buffer;
  try {
    const pdfBufferClasico = await asegurarXrefClasico(pdfBuffer);
    pdfConPlaceholder = agregarSelloYPlaceholder({
      pdfBuffer: pdfBufferClasico,
      reason: razon,
      contactInfo: '',
      name: '',
      location: 'Centro de Metrología del Ejército Ecuatoriano',
      signatureLength: 8192,
      sello: selloParaPlaceholder,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('No se pudo preparar el PDF para la firma:', err);
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
