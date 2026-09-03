// El parser vendorizado de @signpdf/placeholder-plain (readPdf.ts/readRefTable.ts)
// solo entiende la tabla de referencias cruzadas ("xref") clásica — busca
// literalmente las palabras "xref" y "trailer" en el archivo. Los PDFs con
// xref en stream (formato de PDF 1.5+, habitual en certificados generados
// por Word/Acrobat o escaneados) no tienen esas palabras y rompían la firma
// con un error genérico. Antes de intentar el parseo clásico, se comprueba
// si el PDF lo soporta tal cual; si no, se normaliza con pdf-lib (que sí
// entiende cualquier variante de PDF) guardándolo de nuevo en formato
// clásico. Solo pasa esto la primera vez que se firma un PDF externo — una
// vez que este mismo código le agrega su primera actualización incremental
// (ver createBufferTrailer.ts), el archivo ya queda en formato clásico para
// siempre, así que firmas posteriores nunca vuelven a necesitar esto.
import { PDFDocument } from 'pdf-lib';
import { readPdf } from './readPdf';

export async function asegurarXrefClasico(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    readPdf(pdfBuffer);
    return pdfBuffer;
  } catch {
    const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const normalizado = await doc.save({ useObjectStreams: false });
    return Buffer.from(normalizado);
  }
}
