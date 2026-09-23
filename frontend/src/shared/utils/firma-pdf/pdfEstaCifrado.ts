// Detecta PDFs cifrados (protegidos con permisos o con contraseña).
//
// Un PDF cifrado no se puede firmar con este sistema: la actualización
// incremental que agrega el sello y la firma (ver createBufferTrailer.ts,
// vendorizado de @signpdf/placeholder-plain) escribe un trailer nuevo SIN
// /Encrypt ni /ID. Adobe Acrobat y los demás lectores estrictos solo miran el
// ÚLTIMO trailer, así que toman el documento por no cifrado, leen los flujos
// de contenido (cifrados) como datos crudos y muestran las páginas EN BLANCO
// — aunque la firma sea criptográficamente válida. Además, los objetos nuevos
// (sello, firma) quedarían sin cifrar dentro de un documento que declara estarlo.
// Los lectores permisivos (Chrome/Brave, la vista previa de otros programas)
// siguen la cadena /Prev y sí lo muestran bien, por eso pasa desapercibido.
//
// Se revisan TODOS los trailers, no solo el último: un PDF que ya pasó por una
// firma de este sistema tiene el último trailer sin /Encrypt aunque el
// original sí lo tuviera.

const REFERENCIA_ENCRYPT = /\/Encrypt\s*(?:\d+\s+\d+\s+R|<<)/;

// Ventana máxima a inspeccionar por trailer: un trailer real mide unas
// decenas de bytes; el tope evita recorrer megas si la palabra "trailer"
// apareciera suelta dentro de algún contenido.
const MAX_TRAILER = 4096;

export const MENSAJE_PDF_CIFRADO =
  'Este PDF está cifrado (protegido con contraseña o con restricciones de permisos) y no se puede firmar aquí: la firma lo dejaría en blanco en Adobe Acrobat. ' +
  'Vuelva a generar el PDF sin cifrado ni restricciones (al exportarlo, desactive la opción de proteger o encriptar) y cárguelo de nuevo.';

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
