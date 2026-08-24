import * as forge from 'node-forge';
import { extractSignature, findByteRange } from '@signpdf/utils';

export interface DatosCertificadoFirmante {
  titular: string;
  emisor: string;
  numeroSerie: string;
  validoDesde: Date;
  validoHasta: Date;
}

export interface ResultadoVerificacionFirma {
  valido: boolean;
  error?: string;
  certificado?: DatosCertificadoFirmante;
}

/**
 * Busca un atributo autenticado (Attribute ::= SEQUENCE { type OID, values SET })
 * dentro del array crudo capturado por forge y devuelve el contenido de su
 * primer valor, en bytes binarios sin decodificar.
 */
function leerAtributo(
  atributos: forge.asn1.Asn1[],
  oidBuscado: string,
): string | null {
  for (const atributo of atributos) {
    const hijos = atributo.value as forge.asn1.Asn1[];
    const tipo = forge.asn1.derToOid(hijos[0].value as string);
    if (tipo === oidBuscado) {
      const conjuntoValores = (hijos[1].value as forge.asn1.Asn1[])[0];
      return conjuntoValores.value as string;
    }
  }
  return null;
}

function nombreComun(entidad: forge.pki.Certificate['subject']): string {
  const campo = entidad.getField('CN');
  return campo?.value ?? 'Desconocido';
}

/**
 * Verifica criptográficamente UNA firma digital PAdES/PKCS#7 embebida en un
 * PDF (producida en el navegador del firmante con @signpdf + su .p12
 * personal). No confía en que el cliente diga "ya firmé": recalcula el hash
 * del documento y valida la firma RSA contra el certificado embebido.
 *
 * `indiceFirma` selecciona CUÁL firma verificar cuando el PDF tiene varias
 * (flujo de varios firmantes, cada uno agrega la suya al final del archivo):
 * 1 = la más antigua, 2 = la siguiente, etc. — ver `verificarFirmaPdf` más
 * abajo, que itera todas.
 *
 * node-forge no implementa `verify()` para PKCS#7 (lanza "not yet
 * implemented"), así que la verificación se arma a mano sobre las
 * primitivas ASN.1 de forge, siguiendo RFC 2315 §9.3: el hash que se firma
 * es el de la codificación DER del SET de atributos autenticados, no el
 * del documento directamente — el hash del documento solo se compara
 * contra el atributo `messageDigest` dentro de ese set.
 */
function verificarFirmaEnIndice(
  pdfBuffer: Buffer,
  indiceFirma: number,
): ResultadoVerificacionFirma {
  let extraido: ReturnType<typeof extractSignature>;
  try {
    extraido = extractSignature(pdfBuffer, indiceFirma);
  } catch {
    return {
      valido: false,
      error: 'El PDF no contiene una firma digital reconocible.',
    };
  }

  try {
    const p7Asn1 = forge.asn1.fromDer(extraido.signature);
    // El PDF que firmamos siempre produce PKCS#7 SignedData (nunca
    // EnvelopedData) — la unión del tipo viene de que messageFromAsn1
    // soporta ambos casos en general.
    const mensaje = forge.pkcs7.messageFromAsn1(
      p7Asn1,
    ) as forge.pkcs7.Captured<forge.pkcs7.PkcsSignedData>;
    const captura = mensaje.rawCapture as Record<string, any>;

    if (
      !captura?.authenticatedAttributes ||
      !captura?.signature ||
      !captura?.digestAlgorithm
    ) {
      return {
        valido: false,
        error:
          'La firma no tiene el formato esperado (faltan atributos autenticados).',
      };
    }

    const digestOid = forge.asn1.derToOid(captura.digestAlgorithm as string);
    const nombreDigest = (forge.pki.oids as Record<string, string>)[digestOid];
    if (!nombreDigest || !(nombreDigest in forge.md)) {
      return {
        valido: false,
        error: `Algoritmo de resumen no soportado: ${digestOid}`,
      };
    }
    const crearDigest = () => (forge.md as any)[nombreDigest].create();

    // 1) El hash del contenido firmado debe coincidir con el atributo messageDigest.
    const digestContenido = crearDigest();
    digestContenido.update(extraido.signedData.toString('binary'));
    const digestContenidoBytes = digestContenido.digest().getBytes();

    const messageDigestAtributo = leerAtributo(
      captura.authenticatedAttributes as forge.asn1.Asn1[],
      forge.pki.oids.messageDigest,
    );
    if (!messageDigestAtributo) {
      return {
        valido: false,
        error: 'La firma no incluye el atributo messageDigest.',
      };
    }
    if (messageDigestAtributo !== digestContenidoBytes) {
      return {
        valido: false,
        error:
          'El documento fue modificado después de firmarse: el hash no coincide.',
      };
    }

    // 2) La firma RSA debe validar contra el hash del SET de atributos
    //    autenticados (re-empaquetados con tag universal SET, no el [0]
    //    implícito con el que viajan dentro del PKCS#7 — así es como se
    //    firmaron originalmente, por RFC 2315 §9.3).
    const conjuntoAtributos = forge.asn1.create(
      forge.asn1.Class.UNIVERSAL,
      forge.asn1.Type.SET,
      true,
      captura.authenticatedAttributes as forge.asn1.Asn1[],
    );
    const digestFirma = crearDigest();
    digestFirma.update(forge.asn1.toDer(conjuntoAtributos).getBytes());
    const digestFirmaBytes = digestFirma.digest().getBytes();

    let certificadoFirmante: forge.pki.Certificate | null = null;
    for (const cert of mensaje.certificates) {
      try {
        const clavePublica = cert.publicKey as forge.pki.rsa.PublicKey;
        if (
          clavePublica.verify(digestFirmaBytes, captura.signature as string)
        ) {
          certificadoFirmante = cert;
          break;
        }
      } catch {
        // Este certificado no corresponde a la firma — se prueba el siguiente.
      }
    }

    if (!certificadoFirmante) {
      return { valido: false, error: 'La firma criptográfica no es válida.' };
    }

    const ahora = new Date();
    if (
      ahora < certificadoFirmante.validity.notBefore ||
      ahora > certificadoFirmante.validity.notAfter
    ) {
      return {
        valido: false,
        error:
          'El certificado usado para firmar está fuera de su período de vigencia.',
      };
    }

    return {
      valido: true,
      certificado: {
        titular: nombreComun(certificadoFirmante.subject),
        emisor: nombreComun(certificadoFirmante.issuer),
        numeroSerie: certificadoFirmante.serialNumber,
        validoDesde: certificadoFirmante.validity.notBefore,
        validoHasta: certificadoFirmante.validity.notAfter,
      },
    };
  } catch (err) {
    return {
      valido: false,
      error: `No se pudo procesar la firma: ${err instanceof Error ? err.message : 'error desconocido'}`,
    };
  }
}

/**
 * Verifica TODAS las firmas presentes en el PDF, no solo una. Necesario
 * porque en un workflow de varios firmantes cada uno agrega su firma al
 * final del archivo (actualización incremental) — `extractSignature` sin
 * índice siempre encuentra la más antigua, así que verificar solo "la"
 * firma re-validaba de nuevo al primer firmante en cada fase siguiente y
 * nunca comprobaba la firma que el firmante actual acababa de producir.
 *
 * Si cualquier firma (incluidas las de fases anteriores) queda inválida —
 * por ejemplo, si el documento se corrompió al agregar una firma nueva —
 * se rechaza el PDF entero en vez de aceptarlo silenciosamente. El
 * resultado que se devuelve (y el que se graba en BD) es el de la firma
 * más reciente, la del firmante actual.
 */
export function verificarFirmaPdf(pdfBuffer: Buffer): ResultadoVerificacionFirma {
  const totalFirmas = findByteRange(pdfBuffer).byteRangeStrings.length;
  if (totalFirmas === 0) {
    return {
      valido: false,
      error: 'El PDF no contiene una firma digital reconocible.',
    };
  }

  let resultado: ResultadoVerificacionFirma | null = null;
  for (let indice = 1; indice <= totalFirmas; indice += 1) {
    resultado = verificarFirmaEnIndice(pdfBuffer, indice);
    if (!resultado.valido) {
      return {
        valido: false,
        error:
          totalFirmas > 1
            ? `Firma #${indice} de ${totalFirmas} inválida: ${resultado.error}`
            : resultado.error,
      };
    }
  }

  return resultado as ResultadoVerificacionFirma;
}
