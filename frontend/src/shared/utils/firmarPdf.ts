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
    // El segundo argumento de pkcs12FromAsn1 es `strictParsing`; pasar la
    // contraseña ahí haría que la verificación del MAC se haga con la cadena
    // vacía y el titular nunca se leyera en .p12 protegidos.
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
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

  const errorPreparandoPdf = (err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('No se pudo preparar el PDF para la firma:', err);
    return new FirmaPdfError(
      'No se pudo preparar el PDF para la firma. Verifique que el archivo no esté dañado.',
    );
  };

  let pdfBufferClasico: Buffer;
  try {
    pdfBufferClasico = await asegurarXrefClasico(pdfBuffer);
  } catch (err) {
    throw errorPreparandoPdf(err);
  }

  // El sello visual y el espacio de la firma se agregan en un solo paso de
  // actualización incremental (ver agregarSelloYPlaceholder.ts) — nunca se
  // reparsea ni reescriben los bytes existentes, así que firmas previas de
  // otros firmantes en el mismo documento quedan intactas.
  const prepararPdf = (signatureLength: number): Buffer => {
    try {
      return agregarSelloYPlaceholder({
        pdfBuffer: pdfBufferClasico,
        reason: razon,
        contactInfo: '',
        name: '',
        location: 'Centro de Metrología del Ejército Ecuatoriano',
        signatureLength,
        sello: selloParaPlaceholder,
      });
    } catch (err) {
      throw errorPreparandoPdf(err);
    }
  };

  // La firma PKCS#7 lleva TODOS los certificados del .p12 (el de la persona
  // más la cadena completa de autoridades), así que su tamaño depende del
  // certificado de cada firmante: con un espacio fijo, un .p12 con cadena
  // larga fallaba con "Signature exceeds placeholder length" — que se
  // mostraba como un problema de contraseña. Se empieza con el tamaño
  // habitual (PDFs chicos) y, solo si la firma no cabe, se repite una vez
  // con el tamaño exacto que la librería informa que necesita.
  let longitud = LONGITUD_FIRMA_INICIAL;
  for (let intento = 1; ; intento += 1) {
    const pdfConPlaceholder = prepararPdf(longitud);
    // Un P12Signer nuevo en cada intento: forge consume el buffer del .p12
    // al leerlo, así que reutilizar la misma instancia fallaría al reintentar.
    const signer = new P12Signer(p12Buffer, { passphrase: password });
    const signPdf = new SignPdf();

    try {
      const pdfFirmado = await signPdf.sign(pdfConPlaceholder, signer);
      return new Uint8Array(pdfFirmado);
    } catch (err) {
      const esExcesoPlaceholder =
        err instanceof Error && /exceeds placeholder/i.test(err.message);
      if (esExcesoPlaceholder && signatureLength < LONGITUD_MAXIMA_FIRMA) {
        signatureLength *= 2;
        continue;
      }
      const mensaje = err instanceof Error ? err.message : String(err);
      // El error real se registra siempre: antes cualquier .p12 que la
      // librería no supiera leer se mostraba como "contraseña incorrecta", y
      // sin este dato no había forma de saber por qué falla un archivo que
      // otro programa (p. ej. Adobe) sí abre con la misma contraseña.
      // eslint-disable-next-line no-console
      console.error('[firma] Falló la firma con el .p12:', err);
      throw new FirmaPdfError(mensajeErrorP12(mensaje));
    }
  }
}

// Bytes reservados para la firma dentro del PDF (en hex ocupa el doble).
const LONGITUD_FIRMA_INICIAL = 8192;
const LONGITUD_FIRMA_MAXIMA = 65536;
const MARGEN_FIRMA = 1024;

/**
 * Bytes que necesita la firma, según el error de @signpdf
 * ("Signature exceeds placeholder length: <hex necesarios> > <hex reservados>"),
 * o null si el error es otro.
 */
function bytesNecesariosPorError(mensaje: string): number | null {
  const m = /exceeds placeholder length:\s*(\d+)\s*>\s*(\d+)/i.exec(mensaje);
  return m ? Math.ceil(Number(m[1]) / 2) : null;
}

const REEXPORTAR =
  'Si funciona en otro programa (por ejemplo Adobe), vuelva a exportar el certificado desde ese programa y pruebe con el archivo nuevo.';

const LONGITUD_MINIMA_FIRMA = 8192; // bytes reservados en /Contents por defecto (como antes)
const LONGITUD_MAXIMA_FIRMA = 131072; // techo de seguridad

/**
 * Estima el tamaño (en bytes) de la firma PKCS#7/CMS que producirá el .p12:
 * la firma embebe TODOS los certificados del archivo (no solo la hoja) más la
 * firma RSA de la clave privada. Si el .p12 trae la cadena completa la firma
 * crece varios KB y el placeholder fijo de 8192 bytes se queda corto (error
 * "Signature exceeds placeholder length").
 */
function estimarTamanoFirmaPkcs7(p12Buffer: Buffer, password: string): number {
  try {
    const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
    const bolsasCert = (p12.getBags({ bagType: forge.pki.oids.certBag })[
      forge.pki.oids.certBag
    ] ?? []) as Array<{ cert?: forge.pki.Certificate }>;
    const bolsasClave = (p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
      forge.pki.oids.pkcs8ShroudedKeyBag
    ] ?? []) as Array<{ key?: forge.pki.rsa.PrivateKey }>;

    let bytesCertificados = 0;
    for (const bolsa of bolsasCert) {
      if (bolsa.cert) {
        bytesCertificados += forge.asn1
          .toDer(forge.pki.certificateToAsn1(bolsa.cert))
          .length();
      }
    }
    const bits = bolsasClave[0]?.key?.n?.bitLength?.() ?? 2048;
    // Encabezados/atributos/OIDs (~400 B) + firma RSA + certificados + margen.
    return 400 + bytesCertificados + Math.ceil(bits / 8) + 256;
  } catch {
    // Si no se puede leer el .p12 (contraseña mala o formato no soportado),
    // se mantiene el tamaño por defecto; el error real saldrá al firmar.
    return LONGITUD_MINIMA_FIRMA;
  }
}

function siguientePotenciaDeDos(n: number): number {
  let potencia = LONGITUD_MINIMA_FIRMA;
  while (potencia < n && potencia < LONGITUD_MAXIMA_FIRMA) {
    potencia *= 2;
  }
  return potencia;
}

/**
 * Traduce el error de la librería (node-forge / @signpdf) a un mensaje que
 * distinga las causas reales — no todo error de lectura de un .p12 es una
 * contraseña equivocada — e incluye el detalle técnico (sin datos sensibles)
 * para poder diagnosticar el caso desde una captura de pantalla.
 */
export function mensajeErrorP12(mensaje: string): string {
  const detalle = ` (Detalle técnico: ${mensaje.slice(0, 160)})`;

  // Formatos que la librería no sabe leer, aunque la contraseña sea correcta:
  // algoritmo de MAC/cifrado no soportado, o clave privada guardada sin
  // cifrar (la librería solo busca claves "shrouded").
  if (
    /unsupported|reading 'key'|matches the private key/i.test(mensaje)
  ) {
    return `Este archivo .p12 usa un formato que el navegador no puede leer, aunque la contraseña sea correcta. ${REEXPORTAR}${detalle}`;
  }

  // Contraseña que no coincide (o codificada distinto a como la creó el archivo).
  if (/invalid password|mac could not be verified/i.test(mensaje)) {
    return `La contraseña del certificado .p12 es incorrecta. ${REEXPORTAR}${detalle}`;
  }

  // La firma superó incluso el espacio máximo reservado en el PDF.
  if (/exceeds placeholder/i.test(mensaje)) {
    return `La firma generada no cabe en el espacio reservado en el PDF: este certificado .p12 incluye una cadena de certificados muy extensa. ${REEXPORTAR}${detalle}`;
  }

  return `No se pudo completar la firma digital. Verifique el archivo .p12 y la contraseña.${detalle}`;
}
