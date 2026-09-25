// Detecta PDFs cifrados (protegidos con permisos o con contraseña) y PDFs que
// ya traen una firma digital.
//
// Un PDF cifrado no se puede firmar tal cual: la actualización incremental que
// agrega el sello y la firma (ver createBufferTrailer.ts, vendorizado de
// @signpdf/placeholder-plain) escribe un trailer nuevo SIN /Encrypt ni /ID.
// Adobe Acrobat y los demás lectores estrictos solo miran el ÚLTIMO trailer,
// así que toman el documento por no cifrado, leen los flujos de contenido
// (cifrados) como datos crudos y muestran las páginas EN BLANCO — aunque la
// firma sea criptográficamente válida. Además, los objetos nuevos (sello,
// firma) quedarían sin cifrar dentro de un documento que declara estarlo.
// Los lectores permisivos (Chrome/Brave, la vista previa de otros programas)
// siguen la cadena /Prev y sí lo muestran bien, por eso pasa desapercibido.
//
// Por eso, antes de firmar, a un PDF cifrado se le quita el cifrado (ver
// descifrarPdf.ts) — salvo que ya traiga una firma digital: reescribirlo
// invalidaría esa firma.
//
// Se revisan TODOS los trailers, no solo el último: un PDF que ya pasó por una
// firma de este sistema antes de esta protección tiene el último trailer sin
// /Encrypt aunque el original sí lo tuviera.

const REFERENCIA_ENCRYPT = /\/Encrypt\s*(?:\d+\s+\d+\s+R|<<)/;

// Una firma ya aplicada lleva /ByteRange con sus cuatro números; el hueco que
// deja @signpdf antes de firmar trae asteriscos y no coincide.
const BYTE_RANGE_FIRMADO = /\/ByteRange\s*\[\s*\d+\s+\d+\s+\d+\s+\d+\s*\]/;

// Ventana máxima a inspeccionar por trailer: un trailer real mide unas
// decenas de bytes; el tope evita recorrer megas si la palabra "trailer"
// apareciera suelta dentro de algún contenido.
const MAX_TRAILER = 4096;

export const MENSAJE_PDF_CIFRADO_Y_FIRMADO =
  'Este PDF está cifrado y ya trae una firma digital: no se le puede quitar el cifrado sin invalidar esa firma, y firmarlo tal cual lo dejaría en blanco en Adobe Acrobat. ' +
  'Vuelva a generar el PDF sin cifrado ni restricciones y cárguelo de nuevo.';

export const MENSAJE_PDF_CON_CONTRASENA =
  'Este PDF está protegido con una contraseña para abrirlo, por lo que no se puede firmar. ' +
  'Vuelva a generarlo sin contraseña y cárguelo de nuevo.';

export function pdfEstaCifrado(pdf: Uint8Array): boolean {
  // latin1: un byte = un carácter, así los índices coinciden con los del archivo.
  const texto = new TextDecoder('latin1').decode(pdf);

  // PDFs con tabla xref clásica: /Encrypt va en el diccionario de cada "trailer".
  let pos = texto.indexOf('trailer');
  while (pos !== -1) {
    const fin = texto.indexOf('startxref', pos);
    const limite = fin === -1 ? pos + MAX_TRAILER : Math.min(fin, pos + MAX_TRAILER);
    if (REFERENCIA_ENCRYPT.test(texto.slice(pos, limite))) return true;
    pos = texto.indexOf('trailer', pos + 7);
  }

  // PDFs con tabla xref en stream (PDF 1.5+): el diccionario del stream
  // /Type /XRef cumple el papel de trailer.
  const xrefStream = /\/Type\s*\/XRef\b/g;
  let m: RegExpExecArray | null;
  while ((m = xrefStream.exec(texto)) !== null) {
    const ini = Math.max(texto.lastIndexOf('obj', m.index), m.index - MAX_TRAILER);
    const fin = texto.indexOf('stream', m.index);
    const limite = fin === -1 ? m.index + MAX_TRAILER : Math.min(fin, m.index + MAX_TRAILER);
    if (REFERENCIA_ENCRYPT.test(texto.slice(Math.max(ini, 0), limite))) return true;
  }

  return false;
}

/** ¿El PDF ya lleva al menos una firma digital aplicada? */
export function pdfTieneFirmaDigital(pdf: Uint8Array): boolean {
  return BYTE_RANGE_FIRMADO.test(new TextDecoder('latin1').decode(pdf));
}
