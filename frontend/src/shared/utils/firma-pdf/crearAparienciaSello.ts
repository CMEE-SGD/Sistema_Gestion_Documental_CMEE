// Construye el "content stream" del sello visual (QR opcional + etiqueta +
// nombre del firmante) como bytes PDF crudos, para insertarlo como la
// apariencia (/AP /N) del widget de firma — igual que antes, sin pdf-lib ni
// pdfkit, dibujando los operadores PDF a mano.
import { construirBloqueQr } from './crearBloqueQr';

const RELLENO = 5;
const GAP_QR_TEXTO = 6;
// 0.68pt/módulo (~0.24mm) igualaba el QR al alto del texto, pero probado en
// campo (celular real) quedaba muy justo para escanear sin acercar mucho la
// página. 0.85pt (~0.30mm) es el mínimo "cómodo" habitual para lectura
// confiable — el QR queda un poco más alto que el texto (no exactamente
// parejo), y el texto se achica levemente para no exagerar la diferencia.
const QR_MODULO_PT = 0.85;
const QR_ZONA_SILENCIO_MODULOS = 4; // recomendado por ISO/IEC 18004 — no bajar de 4, o el QR deja de leerse bien fotocopiado

const LABEL_FONT_SIZE = 5.5;
const NAME_FONT_SIZE = 8;
const NAME_LINE_HEIGHT = 9;
const LABEL_NAME_GAP = 3;
const COLOR_ETIQUETA = '0.42 0.42 0.42'; // gris — contraste "delgado" contra el nombre en negro

/** Convierte cada carácter a su byte WinAnsi/Latin-1 y escapa los caracteres
 * especiales de las cadenas PDF ( ) \ — necesario para tildes/ñ en nombres reales. */
function codificarLineaPdf(texto: string): Buffer {
  const bytesEscapados: number[] = [];
  for (let i = 0; i < texto.length; i += 1) {
    const code = texto.charCodeAt(i);
    const byte = code <= 0xff ? code : 0x3f; // '?' de respaldo si no es representable en WinAnsi
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      bytesEscapados.push(0x5c, byte); // \( \) \\
    } else {
      bytesEscapados.push(byte);
    }
  }
  return Buffer.from(bytesEscapados);
}

/** Courier/Courier-Bold son de paso fijo: en las métricas estándar PDF-14 cada
 * carácter mide exactamente 0.6 × fontSize, para las 4 variantes por igual.
 * Exacto, a diferencia del canvas+Arial que aproximaba Helvetica antes. */
function medirAnchoCourier(texto: string, fontSize: number): number {
  return texto.length * fontSize * 0.6;
}

/** Separa el nombre completo en dos líneas — nombres arriba, apellidos
 * abajo — como en un sello de firma tradicional (ej. "SEGUNDO MARIANO" /
 * "DIAZ SANDOVAL"), en vez de envolver por ancho disponible. Asume el
 * formato típico de 2 nombres + 2 apellidos; si el total de palabras es
 * impar, la palabra sobrante queda del lado de los apellidos. */
function dividirNombreEnDosLineas(nombreCompleto: string): string[] {
  const palabras = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (palabras.length <= 1) return palabras;
  const mitad = Math.floor(palabras.length / 2);
  return [
    palabras.slice(0, mitad).join(' '),
    palabras.slice(mitad).join(' '),
  ];
}

export interface DatosSello {
  /** Texto pequeño sobre el nombre, ej. "Firmado electrónicamente por:". */
  etiqueta: string;
  /** Nombre real del titular del certificado — se muestra en mayúsculas. */
  nombre: string;
  /** Si se provee, dibuja un QR a la izquierda que codifica esta URL. */
  qrUrl?: string;
}

export interface AparienciaSello {
  ancho: number;
  alto: number;
  /** Bytes ya listos para ir entre "stream" y "endstream". */
  contentStream: Buffer;
}

export function construirAparienciaSello(datos: DatosSello): AparienciaSello {
  const nombreMayus = datos.nombre.trim().toUpperCase();
  const lineasNombre = dividirNombreEnDosLineas(nombreMayus);

  const anchoEtiqueta = medirAnchoCourier(datos.etiqueta, LABEL_FONT_SIZE);
  const anchoNombre = Math.max(...lineasNombre.map((l) => medirAnchoCourier(l, NAME_FONT_SIZE)));
  const anchoTexto = Math.max(anchoEtiqueta, anchoNombre);
  const altoTexto = LABEL_FONT_SIZE + LABEL_NAME_GAP + lineasNombre.length * NAME_LINE_HEIGHT;

  const bloqueQr = datos.qrUrl
    ? construirBloqueQr(datos.qrUrl, QR_MODULO_PT, QR_ZONA_SILENCIO_MODULOS)
    : null;

  const anchoContenido = (bloqueQr ? bloqueQr.ancho + GAP_QR_TEXTO : 0) + anchoTexto;
  const ancho = anchoContenido + RELLENO * 2;
  const alto = Math.max(bloqueQr?.alto ?? 0, altoTexto) + RELLENO * 2;

  const xTexto = RELLENO + (bloqueQr ? bloqueQr.ancho + GAP_QR_TEXTO : 0);
  // Centra verticalmente el bloque de texto contra el bloque QR (normalmente más alto).
  const yBaseBloque = RELLENO + Math.max(0, ((bloqueQr?.alto ?? altoTexto) - altoTexto) / 2);
  const yEtiqueta = yBaseBloque + altoTexto - LABEL_FONT_SIZE;
  const yPrimeraLineaNombre = yEtiqueta - LABEL_NAME_GAP - NAME_FONT_SIZE;

  const partes: Buffer[] = [];

  if (bloqueQr) {
    partes.push(
      Buffer.from(['q', `1 0 0 1 ${RELLENO.toFixed(2)} ${RELLENO.toFixed(2)} cm`].join('\n') + '\n', 'ascii'),
    );
    partes.push(bloqueQr.operadores);
    partes.push(Buffer.from('\nQ\n', 'ascii'));
  }

  // Etiqueta (Courier regular, gris)
  partes.push(
    Buffer.from(
      [
        'q',
        `${COLOR_ETIQUETA} rg`,
        '/GS1 gs',
        'BT',
        `/F1 ${LABEL_FONT_SIZE} Tf`,
        `1 0 0 1 ${xTexto.toFixed(2)} ${yEtiqueta.toFixed(2)} Tm`,
        '',
      ].join('\n'),
      'ascii',
    ),
  );
  partes.push(Buffer.from('(', 'ascii'));
  partes.push(codificarLineaPdf(datos.etiqueta));
  partes.push(Buffer.from(') Tj\nET\nQ\n', 'ascii'));

  // Nombre (Courier-Bold, negro), una o varias líneas
  partes.push(
    Buffer.from(
      [
        'q',
        '0 0 0 rg',
        '/GS1 gs',
        'BT',
        `/F2 ${NAME_FONT_SIZE} Tf`,
        `1 0 0 1 ${xTexto.toFixed(2)} ${yPrimeraLineaNombre.toFixed(2)} Tm`,
        '',
      ].join('\n'),
      'ascii',
    ),
  );
  lineasNombre.forEach((linea, i) => {
    if (i > 0) {
      partes.push(Buffer.from(`0 ${-NAME_LINE_HEIGHT} Td\n`, 'ascii'));
    }
    partes.push(Buffer.from('(', 'ascii'));
    partes.push(codificarLineaPdf(linea));
    partes.push(Buffer.from(') Tj\n', 'ascii'));
  });
  partes.push(Buffer.from('ET\nQ', 'ascii'));

  return { ancho, alto, contentStream: Buffer.concat(partes) };
}
