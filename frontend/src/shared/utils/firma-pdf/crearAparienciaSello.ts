// Construye el "content stream" del sello visual (QR opcional + etiqueta +
// nombre del firmante) como bytes PDF crudos, para insertarlo como la
// apariencia (/AP /N) del widget de firma — igual que antes, sin pdf-lib ni
// pdfkit, dibujando los operadores PDF a mano.
import { construirBloqueQr } from './crearBloqueQr';
import { generarImagenSelloPdf, type ImagenSelloPdf } from './generarImagenSello';

const RELLENO = 5;
const GAP_QR_TEXTO = 6;
// 0.68pt/módulo (~0.24mm) igualaba el QR al alto del texto, pero probado en
// campo (celular real) quedaba muy justo para escanear sin acercar mucho la
// página. 0.85pt (~0.30mm) es el mínimo "cómodo" habitual para lectura
// confiable — el QR queda un poco más alto que el texto (no exactamente
// parejo), y el texto se achica levemente para no exagerar la diferencia.
const QR_MODULO_PT = 0.85;
const QR_ZONA_SILENCIO_MODULOS = 4; // recomendado por ISO/IEC 18004 — no bajar de 4, o el QR deja de leerse bien fotocopiado

// Azul medio institucional del CMEE para los módulos del QR (#0000CD).
const COLOR_QR_HEX = '#0000CD';
// El logo ocupa el 96% del área perforada — un margen mínimo (4%) para que
// el redondeo de coordenadas nunca lo deje tocando/pisando un módulo del QR
// vecino, pero visualmente casi sin espacio extra alrededor.
const LOGO_ESPACIO_FACTOR = 0.96;
// El bitmap de 160×160 (ver LOGO_160.ts) trae su propio margen blanco
// alrededor del escudo circular — medido una sola vez sobre el bitmap: el
// contenido real va de los píxeles 5 a 154 de 160 (en fracción de imagen,
// de 5/160 a 155/160). En vez de volver a generar el bitmap para recortarlo,
// se "recorta" con la matemática de dibujo: se escala la imagen para que
// esa franja de contenido llene TODO el cuadro del logo, y un clip-path
// (`re W n`) corta lo que sobra fuera (el margen blanco original, que si no
// se recortara se saldría del hueco y blanquearía módulos del QR vecinos).
const LOGO_CONTENIDO_INICIO = 5 / 160;
const LOGO_CONTENIDO_FIN = 155 / 160;

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
  /** Imagen del logo institucional a incrustar como XObject (centro del QR).
   * Solo existe cuando hubo QR (sin QR no hay logo). */
  recursoImagen?: {
    nombre: string;
    imagen: ImagenSelloPdf;
    /** Centro del área perforada, en coordenadas LOCALES del sello. */
    posicion: { x: number; y: number; tamano: number };
  };
}

export function construirAparienciaSello(datos: DatosSello): AparienciaSello {
  const nombreMayus = datos.nombre.trim().toUpperCase();
  const lineasNombre = dividirNombreEnDosLineas(nombreMayus);

  const anchoEtiqueta = medirAnchoCourier(datos.etiqueta, LABEL_FONT_SIZE);
  const anchoNombre = Math.max(...lineasNombre.map((l) => medirAnchoCourier(l, NAME_FONT_SIZE)));
  const anchoTexto = Math.max(anchoEtiqueta, anchoNombre);
  const altoTexto = LABEL_FONT_SIZE + LABEL_NAME_GAP + lineasNombre.length * NAME_LINE_HEIGHT;

  const bloqueQr = datos.qrUrl
    ? construirBloqueQr(datos.qrUrl, QR_MODULO_PT, QR_ZONA_SILENCIO_MODULOS, COLOR_QR_HEX)
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
  let recursoImagen: AparienciaSello['recursoImagen'];

  if (bloqueQr) {
    partes.push(
      Buffer.from(['q', `1 0 0 1 ${RELLENO.toFixed(2)} ${RELLENO.toFixed(2)} cm`].join('\n') + '\n', 'ascii'),
    );
    partes.push(bloqueQr.operadores);
    partes.push(Buffer.from('\nQ\n', 'ascii'));

    // Logo institucional centrado en el área perforada del QR. La imagen se
    // incrusta como recurso (recursoImagen) y aquí solo se dibuja con `cm`.
    //
    // bloqueQr.centro.x/y son coordenadas LOCALES del bloque QR (origen en
    // su propia esquina inferior-izquierda) — el `Q` de la línea de arriba ya
    // cerró la traslación `RELLENO` que puso al bloque QR en su lugar dentro
    // del sello completo, así que hay que volver a sumarla aquí; si no, el
    // logo queda dibujado `RELLENO` puntos más abajo y a la izquierda de
    // donde realmente está el hueco del QR, dejando el hueco descentrado
    // (vacío hacia arriba/derecha) en vez de centrado.
    if (bloqueQr.centro) {
      const imagen = generarImagenSelloPdf();
      const tamano = bloqueQr.centro.tamano * LOGO_ESPACIO_FACTOR;
      const centroXAbsoluto = RELLENO + bloqueQr.centro.x;
      const centroYAbsoluto = RELLENO + bloqueQr.centro.y;
      const cuadroX = centroXAbsoluto - tamano / 2;
      const cuadroY = centroYAbsoluto - tamano / 2;
      recursoImagen = {
        nombre: 'Im1',
        imagen,
        posicion: { x: centroXAbsoluto, y: centroYAbsoluto, tamano },
      };

      // Escala la imagen para que la franja [LOGO_CONTENIDO_INICIO,
      // LOGO_CONTENIDO_FIN] (el escudo real, sin el margen propio del
      // bitmap) llene el cuadro completo; el clip-path recorta el resto.
      const franja = LOGO_CONTENIDO_FIN - LOGO_CONTENIDO_INICIO;
      const escalaImagen = tamano / franja;
      const origenX = cuadroX - LOGO_CONTENIDO_INICIO * escalaImagen;
      const origenY = cuadroY - LOGO_CONTENIDO_INICIO * escalaImagen;

      partes.push(
        Buffer.from(
          [
            'q',
            `${cuadroX.toFixed(2)} ${cuadroY.toFixed(2)} ${tamano.toFixed(2)} ${tamano.toFixed(2)} re`,
            'W n',
            `${escalaImagen.toFixed(2)} 0 0 ${escalaImagen.toFixed(2)} ${origenX.toFixed(2)} ${origenY.toFixed(2)} cm`,
            `/Im1 Do`,
            'Q',
          ].join('\n') + '\n',
          'ascii',
        ),
      );
    }
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

  return { ancho, alto, contentStream: Buffer.concat(partes), recursoImagen };
}
