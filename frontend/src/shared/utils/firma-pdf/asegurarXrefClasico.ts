// El parser vendorizado de @signpdf/placeholder-plain (readPdf.ts/readRefTable.ts)
// solo entiende la tabla de referencias cruzadas ("xref") clásica — sigue
// cadenas /Prev entre tablas clásicas, pero no tiene ni idea de que existen
// las tablas en stream (formato de PDF 1.5+). Eso rompe la firma de dos
// formas distintas:
//
// 1. PDFs 100% en stream (sin ninguna tabla clásica): readPdf() ni siquiera
//    logra parsear el trailer y lanza — ese caso ya se cubría normalizando
//    con pdf-lib antes de firmar.
// 2. PDFs "híbridos" (muy comunes en salidas de Word/LibreOffice/Acrobat):
//    traen una tabla clásica de compatibilidad PARA LECTORES VIEJOS, más
//    una tabla en stream real referenciada por /XRefStm con las revisiones
//    más nuevas de ciertos objetos. Acá readPdf() NO lanza — encuentra la
//    tabla clásica y la da por buena — pero esa tabla está desactualizada
//    o vacía para los objetos que solo viven en el stream, así que la
//    firma se agrega sobre una foto incompleta del documento. El archivo
//    resultante lo abren lectores permisivos (Chrome/Brave, que ante
//    cualquier inconsistencia escanean todo el archivo buscando los
//    objetos a la fuerza) pero lectores estrictos que sí confían en la
//    cadena de referencias (Adobe Acrobat, el visor de Edge) lo rechazan
//    como dañado.
//
// Por eso la detección no puede depender solo de si readPdf() lanza: si el
// archivo declara /XRefStm en algún lado, se normaliza igual aunque el
// parseo clásico "funcione" a medias. Una vez que este mismo código le
// agrega su primera actualización incremental (ver createBufferTrailer.ts),
// el archivo queda en formato clásico puro para siempre, así que firmas
// posteriores del mismo documento nunca vuelven a necesitar esto.
//
// PERO si el PDF YA trae una firma digital — de un firmante anterior del
// mismo flujo, o una firma externa (ej. FirmaEC) con la que llegó el
// documento — normalizar reescribiendo el archivo lo rompe: el /ByteRange
// de esa firma son offsets exactos hacia el archivo tal como estaba en el
// momento de firmarlo, y pdf-lib no sabe que esos números son intocables —
// los copia igual, pero apuntando al lugar equivocado del archivo
// reescrito. El resultado pasa el chequeo de "¿el parser clásico entiende
// esto?" pero la firma vieja queda imposible de extraer (confirmado
// reproduciendo el caso: un PDF de FirmaEC con firma perfectamente válida,
// al pasar por este normalizado, queda con "Failed to parse the
// ByteRange"). En ese caso hay que dejar el archivo tal cual llegó: el modo
// de solo-agregar de agregarSelloYPlaceholder.ts nunca toca bytes
// existentes, así que la firma previa sobrevive intacta aunque el archivo
// siga siendo técnicamente híbrido.
import { PDFDocument } from 'pdf-lib';
import { findByteRange } from '@signpdf/utils';
import { readPdf } from './readPdf';

export async function asegurarXrefClasico(pdfBuffer: Buffer): Promise<Buffer> {
  const yaTieneFirma = findByteRange(pdfBuffer).byteRangeStrings.length > 0;
  if (yaTieneFirma) return pdfBuffer;

  const esHibrido = pdfBuffer.includes('/XRefStm');
  if (!esHibrido) {
    try {
      readPdf(pdfBuffer);
      return pdfBuffer;
    } catch {
      // Cae al normalizado de abajo.
    }
  }
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const normalizado = await doc.save({ useObjectStreams: false });
  return Buffer.from(normalizado);
}
