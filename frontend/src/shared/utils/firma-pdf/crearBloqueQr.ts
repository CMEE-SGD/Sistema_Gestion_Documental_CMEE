// Genera el bloque QR del sello de firma como operadores PDF crudos (`re`/`f`
// para los 3 recuadros de posición, `c`/`l` para los módulos redondeados),
// nunca como imagen — consistente con el resto del sello
// (crearAparienciaSello.ts), que también se dibuja a mano sin pdf-lib/pdfkit
// ni codificación de imágenes raster.
//
// Los 3 recuadros de posición (esquinas) se dibujan como cuadrados sólidos —
// tocarlos SÍ puede impedir que un lector encuentre el código, siguen la
// proporción 1:1:3:1:1 que los lectores buscan explícitamente — pero el resto
// de módulos oscuros (datos, patrón de temporización, alineación) se dibujan
// como cuadrados con las esquinas redondeadas ("squircle"), no cuadrados
// perfectos, para un look más suave. Se probó primero con puntos separados
// (círculos más chicos que el módulo, con espacio blanco alrededor, el look
// más común en generadores de QR con logo) pero decodificar el resultado con
// un lector real (jsQR) fallaba de forma consistente en cuanto el relleno
// bajaba de ~95% del módulo — y a ese nivel ya casi no se distingue de un
// cuadrado, así que no valía el riesgo. Redondear solo las esquinas sin
// encoger el módulo (nunca se separa de sus vecinos oscuros) sí decodificó
// bien en TODAS las variantes probadas — no cambia el centro de masa de cada
// módulo, que es lo que un lector de verdad muestrea.
//
// El color de los módulos es configurable (el sello usa azul medio #0000CD) y
// se "perfora" una zona cuadrada en el centro para alojar el logo institucional
// (crearAparienciaSello.ts incrusta ahí un XObject de imagen) — el QR cambia el
// color de fondo para que el logo quede visible.
import { create as crearMatrizQr } from 'qrcode';

export interface BloqueQr {
  /** El bloque siempre es cuadrado — ancho === alto. */
  ancho: number;
  alto: number;
  /** Operadores ya listos, en coordenadas LOCALES con origen en la esquina
   * inferior-izquierda del bloque (0,0) — el llamador los posiciona con `cm`. */
  operadores: Buffer;
  /** Esquina central "perforada" (sin módulos) donde irá el logo, en puntos
   * PDF y en las mismas coordenadas locales del bloque. `null` si no hubo QR. */
  centro: { x: number; y: number; tamano: number } | null;
}

// 'H' (máxima redundancia, tolera hasta ~30% de módulos dañados) — no es
// opcional cuando el QR lleva un logo perforado en el centro. El hueco de
// LOGO_CLEAR_MODULOS ya "borra" ~13-14% de los módulos de datos: con 'L'
// (tolera ~7%) ese hueco por sí solo ya agota o supera todo el margen de
// corrección, antes de sumar cualquier imperfección real (impresión,
// brillo de pantalla, ángulo de cámara) — por eso el QR con logo no
// escaneaba. Con 'H' ese mismo hueco usa menos de la mitad del margen
// disponible, dejando espacio de sobra para condiciones reales. El costo es
// un QR con más módulos (más grande) para la misma URL — inevitable: un QR
// compacto y uno perforable para logo son objetivos en conflicto.
const NIVEL_CORRECCION = 'H';

// Lado de la zona central perforada para el logo, como proporción de la
// matriz real del QR (sin contar el margen de silencio). Probado con un
// lector real (jsQR) subiendo este valor de a poco: decodifica bien hasta
// 0.44, falla de forma consistente en 0.45 — un salto abrupto, no una
// degradación gradual (mismo patrón que el estilo de puntos separados). Con
// eso medido, 0.38 dado un margen real (~15%) por debajo del punto donde
// falla, en vez de quedar pegado al borde de una prueba idealizada sin el
// ruido de una cámara o impresión real.
const LOGO_CLEAR_MODULOS = 0.38;

// Radio de las esquinas redondeadas de cada módulo, como fracción de medio
// módulo (0 = cuadrado recto, 1 = esquina totalmente circular). Probado con
// un lector real en todo el rango 0.15-1.0 sin ningún fallo de lectura —
// 0.55 da un redondeo visible sin perder casi nada de "peso" visual.
const REDONDEZ_MODULO = 0.55;

// Constante estándar para aproximar un cuarto de círculo con una curva de
// Bézier cúbica (k = 4/3 × (√2 − 1)).
const BEZIER_KAPPA = 0.5522847498;

function hexAComponentes(hex: string): { r: string; g: string; b: string } {
  const limpio = hex.replace('#', '');
  return {
    r: (parseInt(limpio.slice(0, 2), 16) / 255).toFixed(5),
    g: (parseInt(limpio.slice(2, 4), 16) / 255).toFixed(5),
    b: (parseInt(limpio.slice(4, 6), 16) / 255).toFixed(5),
  };
}

/**
 * Cuadrado de lado `lado` con esquina inferior-izquierda en (x0,y0), relleno,
 * con las 4 esquinas redondeadas a radio `radio` (subpath PDF: 4 líneas `l` +
 * 4 curvas `c` alternadas). `radio = 0` degenera a un rectángulo recto normal.
 */
function squircleOperadores(x0: number, y0: number, lado: number, radio: number): string {
  const x1 = x0 + lado;
  const y1 = y0 + lado;
  const k = radio * BEZIER_KAPPA;
  const f = (n: number) => n.toFixed(2);
  return [
    `${f(x0)} ${f(y0 + radio)} m`,
    `${f(x0)} ${f(y1 - radio)} l`,
    `${f(x0)} ${f(y1 - radio + k)} ${f(x0 + radio - k)} ${f(y1)} ${f(x0 + radio)} ${f(y1)} c`,
    `${f(x1 - radio)} ${f(y1)} l`,
    `${f(x1 - radio + k)} ${f(y1)} ${f(x1)} ${f(y1 - radio + k)} ${f(x1)} ${f(y1 - radio)} c`,
    `${f(x1)} ${f(y0 + radio)} l`,
    `${f(x1)} ${f(y0 + radio - k)} ${f(x1 - radio + k)} ${f(y0)} ${f(x1 - radio)} ${f(y0)} c`,
    `${f(x0 + radio)} ${f(y0)} l`,
    `${f(x0 + radio - k)} ${f(y0)} ${f(x0)} ${f(y0 + radio - k)} ${f(x0)} ${f(y0 + radio)} c`,
    'h',
  ].join('\n');
}

/** Los 3 recuadros de posición del QR viven siempre en las mismas 3 esquinas
 * (7×7 módulos), sin importar el tamaño real de la matriz. */
function esZonaDePosicion(row: number, col: number, size: number): boolean {
  const enFilaSuperior = row < 7;
  const enFilaInferior = row >= size - 7;
  const enColIzquierda = col < 7;
  const enColDerecha = col >= size - 7;
  return (
    (enFilaSuperior && enColIzquierda) ||
    (enFilaSuperior && enColDerecha) ||
    (enFilaInferior && enColIzquierda)
  );
}

/**
 * Construye el bloque QR que codifica `url`. `moduloPt` es el tamaño de cada
 * módulo en puntos PDF; `zonaSilencioModulos` es el margen en blanco alrededor
 * (ISO/IEC 18004 recomienda 4 módulos para códigos que se puedan imprimir);
 * `colorHex` (#RRGGBB) es el color de relleno de los módulos.
 */
export function construirBloqueQr(
  url: string,
  moduloPt: number,
  zonaSilencioModulos: number,
  colorHex = '#000000',
): BloqueQr {
  const qr = crearMatrizQr(url, { errorCorrectionLevel: NIVEL_CORRECCION });
  const size = qr.modules.size;
  const data = qr.modules.data; // Uint8Array fila-mayor: data[row*size+col], 1 = módulo oscuro

  const anchoModulos = size + zonaSilencioModulos * 2;
  const ancho = anchoModulos * moduloPt;

  // Zona central que se deja en blanco para el logo (en módulos de la matriz,
  // sin margen de silencio). Se centra usando Math.floor para que quede donde
  // estén los alineamiento markers — no sobre los 3 position markers de esquina.
  const centroModulos = Math.max(1, Math.floor(size * LOGO_CLEAR_MODULOS));
  const c0 = Math.floor((size - centroModulos) / 2);
  const c1 = c0 + centroModulos;

  const radioEsquina = (moduloPt / 2) * REDONDEZ_MODULO;
  const cuadrados: string[] = []; // recuadros de posición (esquinas) — solo fusiona corridas dentro de esas zonas
  const redondeados: string[] = []; // resto de módulos oscuros, esquinas suavizadas

  for (let row = 0; row < size; row += 1) {
    let colInicioCorrida = -1;
    for (let col = 0; col <= size; col += 1) {
      const dentro = col < size;
      const oscuro = dentro && data[row * size + col] === 1;
      const enPosicion = dentro && esZonaDePosicion(row, col, size);
      const oscuroPosicion = oscuro && enPosicion;

      // Corridas horizontales SOLO dentro de las 3 zonas de posición — igual
      // que antes, se fusionan en un rect por corrida para no explotar el
      // número de operadores en esas zonas (siempre sólidas por diseño del QR).
      if (oscuroPosicion && colInicioCorrida === -1) {
        colInicioCorrida = col;
      } else if (!oscuroPosicion && colInicioCorrida !== -1) {
        const colFin = col; // exclusivo
        const anchoCorrida = colFin - colInicioCorrida;
        const x = (zonaSilencioModulos + colInicioCorrida) * moduloPt;
        // La fila 0 de la matriz QR es la fila visual SUPERIOR, pero el eje Y
        // de PDF crece hacia arriba — sin esta inversión el QR sale espejado
        // verticalmente e ilegible para cualquier lector.
        const y = (zonaSilencioModulos + (size - 1 - row)) * moduloPt;
        cuadrados.push(
          `${x.toFixed(2)} ${y.toFixed(2)} ${(anchoCorrida * moduloPt).toFixed(2)} ${moduloPt.toFixed(2)} re`,
        );
        colInicioCorrida = -1;
      }

      // Resto de módulos oscuros (fuera de las zonas de posición): un
      // cuadrado de esquinas redondeadas por módulo, salvo que caiga dentro
      // del hueco perforado para el logo.
      if (dentro && oscuro && !enPosicion) {
        const dentroCentro = row >= c0 && row < c1 && col >= c0 && col < c1;
        if (!dentroCentro) {
          const x0 = (zonaSilencioModulos + col) * moduloPt;
          const y0 = (zonaSilencioModulos + (size - 1 - row)) * moduloPt;
          redondeados.push(squircleOperadores(x0, y0, moduloPt, radioEsquina));
        }
      }
    }
  }

  const { r, g, b } = hexAComponentes(colorHex);
  const operadores = Buffer.from(
    ['q', '/GS2 gs', `${r} ${g} ${b} rg`, ...cuadrados, ...redondeados, 'f', 'Q'].join('\n'),
    'ascii',
  );

  // Centro del área perforada en puntos PDF (coordenadas locales del bloque,
  // con el margen de silencio ya contado) — punto donde centrar el logo.
  const centroModulosPdf = centroModulos * moduloPt;
  return {
    ancho,
    alto: ancho,
    operadores,
    centro: {
      x: (zonaSilencioModulos + c0 + centroModulos / 2) * moduloPt,
      y: (zonaSilencioModulos + size - (c0 + centroModulos / 2)) * moduloPt,
      tamano: centroModulosPdf,
    },
  };
}
