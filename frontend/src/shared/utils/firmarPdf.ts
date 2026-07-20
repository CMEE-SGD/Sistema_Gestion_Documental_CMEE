// Firma digital PAdES/PKCS#7 realizada enteramente en el navegador del
// firmante: el archivo .p12 y su contraseña nunca salen de esta máquina.
// Solo el PDF ya firmado se sube al servidor (que lo vuelve a verificar
// criptográficamente antes de aceptarlo — ver backend/src/common/helpers/pdf-signature.ts).
// Compartido entre certificados (administrativo) y Gestor Documental.
import { SignPdf } from '@signpdf/signpdf';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { P12Signer } from '@signpdf/signer-p12';
// Namespace import a propósito: con `import forge from 'node-forge'` el
// bundle compila pero `forge.pki`/`forge.pkcs12` quedan `undefined` en
// tiempo de ejecución (ver el mismo problema ya resuelto en el backend).
import * as forge from 'node-forge';
import { FirmaPdfError } from './FirmaPdfError';
import type { PosicionFirma } from '../components/organisms/SelectorPosicionFirma';

export { FirmaPdfError };
export type { PosicionFirma };

/**
 * Lee el nombre (CN) del titular real del certificado .p12 — el mismo dato
 * que usa el servidor al verificar la firma — para mostrarlo en el sello
 * visual. Si no se puede leer (contraseña incorrecta, certificado sin CN),
 * devuelve null y el llamador decide el texto de respaldo.
 */
function extraerTitularCertificado(
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
 * Dibuja un sello visual (texto sobre un recuadro) en la posición elegida
 * por el usuario. Se hace ANTES de firmar criptográficamente, así que el
 * sello queda cubierto por la firma como cualquier otro contenido del PDF —
 * alterarlo después invalidaría la firma igual que alterar el texto.
 */
async function agregarSelloVisual(
  pdfBytes: Uint8Array,
  posicion: PosicionFirma,
  lineas: string[],
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(pdfBytes);
  } catch {
    throw new FirmaPdfError(
      'No se pudo preparar el PDF para colocar el sello de firma.',
    );
  }

  const paginas = pdfDoc.getPages();
  const pagina = paginas[posicion.pagina];
  if (!pagina) {
    throw new FirmaPdfError(
      'La página elegida para el sello ya no existe en el documento.',
    );
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 8;
  const interlineado = fontSize + 3;
  const relleno = 6;

  const anchoTexto = Math.max(
    ...lineas.map((linea) => font.widthOfTextAtSize(linea, fontSize)),
  );
  const ancho = anchoTexto + relleno * 2;
  const alto = lineas.length * interlineado + relleno * 2 - (interlineado - fontSize);

  // El punto elegido por el usuario es la esquina superior izquierda del
  // sello — se ajusta para que el recuadro no se salga de la página.
  const x = Math.min(Math.max(posicion.x, 0), pagina.getWidth() - ancho);
  const yTope = Math.min(Math.max(posicion.y, alto), pagina.getHeight());
  const yBase = yTope - alto;

  pagina.drawRectangle({
    x,
    y: yBase,
    width: ancho,
    height: alto,
    color: rgb(1, 0.98, 0.85),
    opacity: 0.9,
    borderColor: rgb(0.6, 0.5, 0),
    borderWidth: 0.75,
  });

  lineas.forEach((linea, i) => {
    pagina.drawText(linea, {
      x: x + relleno,
      y: yTope - relleno - fontSize - i * interlineado,
      size: fontSize,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
  });

  // useObjectStreams: false — @signpdf/placeholder-plain lee la tabla xref
  // "a mano" y no entiende los cross-reference streams comprimidos que
  // pdf-lib genera por defecto; con esta opción produce el formato clásico
  // que sí puede leer (confirmado con una firma real de extremo a extremo).
  return pdfDoc.save({ useObjectStreams: false });
}

/**
 * Firma un PDF con un certificado .p12 en el navegador.
 * @param pdfBytes El PDF a firmar (el original, o uno que ya trae firmas previas).
 * @param p12File El archivo .p12 seleccionado por el usuario.
 * @param password La contraseña del .p12 (nunca se envía al servidor).
 * @param razon Motivo de la firma, embebido en el propio PDF (ej. "Aprobación de Jefatura").
 * @param sello Si se provee, dibuja un sello visual en esa posición antes de firmar,
 *   con el nombre real del titular del certificado (no el usuario de la sesión).
 */
export async function firmarPdfConP12(
  pdfBytes: Uint8Array,
  p12File: File,
  password: string,
  razon: string,
  sello?: { posicion: PosicionFirma },
): Promise<Uint8Array> {
  const p12Bytes = new Uint8Array(await p12File.arrayBuffer());
  const p12Buffer = Buffer.from(p12Bytes);

  let pdfParaFirmar = pdfBytes;
  if (sello) {
    const titular = extraerTitularCertificado(p12Buffer, password) ?? 'Titular del certificado';
    const fecha = new Date().toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    pdfParaFirmar = await agregarSelloVisual(pdfBytes, sello.posicion, [
      'Firmado digitalmente',
      `Por: ${titular}`,
      `Fecha: ${fecha}`,
      `Motivo: ${razon}`,
    ]);
  }

  const pdfBuffer = Buffer.from(pdfParaFirmar);

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
