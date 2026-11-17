// PDF de la NOTA DE ENTREGA (formato AC1.2.F2-1 del CMEE), con el mismo diseño
// de la hoja de papel: encabezado institucional, número en rojo, registro de
// egreso, tabla de equipos, condición de salida, observaciones, instrucciones de
// envío, condiciones de entrega y recuadros de firma.
//
// Se arma en el navegador con pdf-lib (que se carga solo cuando se imprime una
// nota), a partir de los datos ya guardados. Quien lo imprime lo firma en papel.
import logoUrl from '../../assets/LOGO_CENTRO.png';

export interface NotaEntregaEquipoPdf {
  equipo: string;
  marca?: string;
  modelo?: string;
  serie_codigo?: string;
  accesorios?: string;
  calibracion?: string; // 'CALIBRADO' | 'SIN_CALIBRAR' | ''
  certificado?: string; // 'CON_CERTIFICADO' | 'SIN_CERTIFICADO' | ''
  informe?: string;
}

export interface NotaEntregaPdfDatos {
  numero: string;
  fecha_egreso: string; // YYYY-MM-DD
  cliente: string;
  representante: string;
  direccion: string;
  telefono: string;
  observaciones?: string;
  envio_empresa?: string;
  envio_destinatario?: string;
  envio_ciudad?: string;
  envio_guia?: string;
  envio_fecha?: string; // YYYY-MM-DD
  envio_factura_cmee?: string;
  cliente_firma_nombre?: string;
  cliente_firma_ci?: string;
  cmee_firma_nombre?: string;
  cmee_firma_ci?: string;
  equipos: NotaEntregaEquipoPdf[];
}

// Condiciones impresas en la hoja (las líneas 3 a 5 se transcribieron de la
// hoja original; conviene revisarlas contra el formato oficial).
const CONDICIONES = [
  '1.- La presente NOTA DE ENTREGA, justifica el estado de funcionamiento de el (los) equipo(s), al momento de la entrega.',
  '2.- El CMEE no se responsabiliza por los daños ocurridos al (a los) equipo(s) durante el transporte y/o empleo una vez salido del laboratorio.',
  '3.- El (los) equipo(s) serán transportados bajo la responsabilidad del cliente.',
  '4.- Cualquier observación con respecto a: Certificados, Método o Proceso, se receptará a través de la respectiva hoja de queja.',
  '5.- La garantía extendida por el CMEE, es por Calibración de Equipos, y sus Sellos de Seguridad no deben ser violentados, de ser el caso el CMEE no se responsabiliza.',
];

const FILAS_POR_HOJA = 10;

/** El escudo original pesa más de 1 MB: se reduce antes de incrustarlo en el PDF. */
async function logoLigero(): Promise<ArrayBuffer> {
  const original = await fetch(logoUrl).then((r) => r.arrayBuffer());
  if (typeof document === 'undefined') return original;
  try {
    const bmp = await createImageBitmap(new Blob([original]));
    const lado = 420;
    const canvas = document.createElement('canvas');
    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    ctx.drawImage(bmp, 0, 0, lado, lado);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    return blob ? await blob.arrayBuffer() : original;
  } catch {
    return original;
  }
}

/** "2026-10-06" tal cual: las fechas del sistema van en orden año-mes-día. */
function fechaHoja(iso?: string): string {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-');
  if (!a || !m || !d) return iso;
  return `${a}-${m}-${d}`;
}

export async function generarNotaEntregaPdf(datos: NotaEntregaPdfDatos): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Nota de entrega ${datos.numero}`);
  pdf.setProducer('SGD-CMEE');
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
  const cursiva = await pdf.embedFont(StandardFonts.HelveticaBoldOblique);

  const logo = await pdf.embedPng(await logoLigero());

  const NEGRO = rgb(0.1, 0.1, 0.1);
  const OSCURO = rgb(0.27, 0.27, 0.27);
  const GRIS = rgb(0.55, 0.55, 0.55);
  const LINEA = rgb(0.45, 0.45, 0.45);
  const ROJO = rgb(0.7, 0.12, 0.1);
  const BLANCO = rgb(1, 1, 1);

  const W = 595.28;
  const H = 841.89;
  const MI = 30; // margen izquierdo
  const MD = W - 30; // borde derecho
  const ANCHO = MD - MI;

  // Solo caracteres que la fuente estándar (WinAnsi) puede dibujar.
  const seguro = (t: string, f: typeof normal) => {
    let r = '';
    for (const ch of (t ?? '').replace(/\s+/g, ' ')) {
      try {
        f.encodeText(ch);
        r += ch;
      } catch {
        r += '?';
      }
    }
    return r;
  };

  const ancho = (t: string, f: typeof normal, s: number) => f.widthOfTextAtSize(t, s);

  /** Texto que se achica (hasta 6 pt) y, si aun así no cabe, se corta con «…». */
  const ajustar = (t: string, f: typeof normal, s: number, max: number) => {
    let txt = seguro(t, f);
    let size = s;
    while (size > 6 && ancho(txt, f, size) > max) size -= 0.25;
    if (ancho(txt, f, size) > max) {
      while (txt.length > 1 && ancho(txt + '…', f, size) > max) txt = txt.slice(0, -1);
      txt += '…';
    }
    return { txt, size };
  };

  /** Divide un texto en líneas que quepan en `max`. */
  const envolver = (t: string, f: typeof normal, s: number, max: number): string[] => {
    const palabras = seguro(t, f).split(' ');
    const lineas: string[] = [];
    let actual = '';
    for (const p of palabras) {
      const prueba = actual ? `${actual} ${p}` : p;
      if (ancho(prueba, f, s) <= max) actual = prueba;
      else {
        if (actual) lineas.push(actual);
        actual = p;
      }
    }
    if (actual) lineas.push(actual);
    return lineas;
  };

  const hojas = Math.max(1, Math.ceil(datos.equipos.length / FILAS_POR_HOJA));

  for (let h = 0; h < hojas; h++) {
    const page = pdf.addPage([W, H]);
    const Y = (yTop: number) => H - yTop; // coordenadas desde arriba

    const texto = (
      t: string,
      x: number,
      yTop: number,
      opt: { f?: typeof normal; s?: number; color?: ReturnType<typeof rgb>; centroEn?: [number, number]; derechaEn?: number } = {},
    ) => {
      const f = opt.f ?? normal;
      const s = opt.s ?? 8;
      const st = seguro(t, f);
      let px = x;
      if (opt.centroEn) px = opt.centroEn[0] + (opt.centroEn[1] - opt.centroEn[0] - ancho(st, f, s)) / 2;
      if (opt.derechaEn != null) px = opt.derechaEn - ancho(st, f, s);
      page.drawText(st, { x: px, y: Y(yTop), size: s, font: f, color: opt.color ?? NEGRO });
    };

    const linea = (x1: number, y1: number, x2: number, y2: number, grosor = 0.5, color = LINEA) =>
      page.drawLine({ start: { x: x1, y: Y(y1) }, end: { x: x2, y: Y(y2) }, thickness: grosor, color });

    /** Rectángulo con esquinas redondeadas (coordenadas desde arriba). */
    const rect = (
      x: number,
      yTop: number,
      w: number,
      hh: number,
      r: number,
      opt: { borde?: ReturnType<typeof rgb>; grosor?: number; relleno?: ReturnType<typeof rgb> } = {},
    ) => {
      const path = `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${hh - r} Q ${w} ${hh} ${w - r} ${hh} ` +
        `L ${r} ${hh} Q 0 ${hh} 0 ${hh - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
      page.drawSvgPath(path, {
        x,
        y: Y(yTop),
        borderColor: opt.borde,
        borderWidth: opt.borde ? opt.grosor ?? 0.8 : 0,
        color: opt.relleno,
      });
    };

    // ---- marca de agua: escudo del CMEE, tenue y centrado ----
    const wm = 330;
    page.drawImage(logo, { x: (W - wm) / 2, y: Y(445 + wm / 2), width: wm, height: wm, opacity: 0.07 });

    // ---- encabezado ----
    page.drawImage(logo, { x: MI, y: Y(30 + 64), width: 64, height: 64 });
    const cx: [number, number] = [100, 372];
    texto('CENTRO DE METROLOGÍA DEL EJÉRCITO ECUATORIANO', 0, 44, { f: negrita, s: 10.5, centroEn: cx });
    texto('“CMEE”', 0, 58, { f: negrita, s: 12, centroEn: cx });
    texto('DIRECCIÓN: FUERTE MILITAR “RUMIÑAHUI”', 0, 69, { f: negrita, s: 6.3, centroEn: cx });
    texto('Av. de los Pinos E7-105 y Manuel Cabeza de Vaca / Urb. Kennedy', 0, 77, { s: 6, centroEn: cx });
    texto('Teléfono: (593-2) 3285 202 / Telefax: (593-2) 2414 432', 0, 85, { s: 6, centroEn: cx });
    texto('e-mail: dpa_cmee@cmee.mil.ec / WEB SITE: www.cmee.mil.ec', 0, 93, { s: 6, centroEn: cx });
    texto('Quito - Ecuador', 0, 101, { f: negrita, s: 6, centroEn: cx });

    texto('AC1.2.F2-1', 0, 40, { f: negrita, s: 8.5, derechaEn: MD });
    rect(378, 48, MD - 378, 27, 4, { relleno: OSCURO });
    texto('NOTA DE ENTREGA', 0, 67, { f: negrita, s: 13.5, color: BLANCO, centroEn: [378, MD] });
    const { txt: numTxt, size: numSize } = ajustar(datos.numero, negrita, 15, MD - 378 - 10);
    texto(numTxt, 0, 96, { f: negrita, s: numSize, color: ROJO, centroEn: [378, MD] });

    // ---- registro de egreso ----
    linea(MI, 112, MD, 112, 0.7, OSCURO);
    texto('REGISTRO DE EGRESO', 0, 123, { f: negrita, s: 8.5, centroEn: [MI, MD] });
    linea(MI, 128, MD, 128, 0.7, OSCURO);

    const campo = (etiqueta: string, valor: string, x: number, yTop: number, xFin: number) => {
      texto(etiqueta, x, yTop, { f: cursiva, s: 7.5 });
      const xi = x + ancho(seguro(etiqueta, cursiva), cursiva, 7.5) + 4;
      linea(xi, yTop + 2, xFin, yTop + 2, 0.5, GRIS);
      const { txt, size } = ajustar(valor, normal, 9, xFin - xi - 4);
      texto(txt, xi + 3, yTop, { s: size });
    };
    campo('Fecha de Egreso:', fechaHoja(datos.fecha_egreso), MI + 4, 146, 300);
    campo('Cliente:', datos.cliente, MI + 4, 163, MD - 4);
    campo('Representante:', datos.representante, MI + 4, 180, 360);
    campo('Teléfono:', datos.telefono, 370, 180, MD - 4);
    campo('Dirección:', datos.direccion, MI + 4, 197, MD - 4);

    // ---- tabla de equipos ----
    const filas = datos.equipos.slice(h * FILAS_POR_HOJA, (h + 1) * FILAS_POR_HOJA);
    const colsEq = [16, 118, 92, 88, 108, ANCHO - 16 - 118 - 92 - 88 - 108]; // N°, equipo, marca, modelo, serie, accesorios
    const encEq = ['', 'EQUIPO', 'MARCA', 'MODELO', 'SERIE/CÓDIGO', 'ACCESORIOS'];
    const yTabla = 208;
    const altoHead = 13;
    const altoFila = 13.6;
    rect(MI, yTabla, ANCHO, altoHead + altoFila * FILAS_POR_HOJA, 5, { borde: OSCURO, grosor: 1 });
    rect(MI, yTabla, ANCHO, altoHead, 5, { relleno: OSCURO });
    let xc = MI;
    colsEq.forEach((w, i) => {
      if (encEq[i]) texto(encEq[i], 0, yTabla + 9, { f: negrita, s: 6.8, color: BLANCO, centroEn: [xc, xc + w] });
      if (i > 0) linea(xc, yTabla + altoHead, xc, yTabla + altoHead + altoFila * FILAS_POR_HOJA, 0.4);
      xc += w;
    });
    for (let i = 0; i < FILAS_POR_HOJA; i++) {
      const yf = yTabla + altoHead + altoFila * i;
      if (i > 0) linea(MI, yf, MD, yf, 0.4);
      const e = filas[i];
      texto(String(h * FILAS_POR_HOJA + i + 1), 0, yf + 9, { s: 6.5, centroEn: [MI, MI + colsEq[0]] });
      if (!e) continue;
      const celdas = [e.equipo, e.marca ?? '', e.modelo ?? '', e.serie_codigo ?? '', e.accesorios ?? ''];
      let x = MI + colsEq[0];
      celdas.forEach((v, j) => {
        const wcol = colsEq[j + 1];
        const { txt, size } = ajustar(v, normal, 8, wcol - 6);
        texto(txt, x + 3, yf + 9, { s: size });
        x += wcol;
      });
    }

    // ---- condición de salida ----
    const yCond = yTabla + altoHead + altoFila * FILAS_POR_HOJA + 8;
    rect(MI, yCond, ANCHO, altoHead + altoFila * FILAS_POR_HOJA, 5, { borde: OSCURO, grosor: 1 });
    rect(MI, yCond, ANCHO, altoHead, 5, { relleno: OSCURO });
    texto('CONDICIÓN DE SALIDA DE LOS EQUIPOS', 0, yCond + 9.3, { f: negrita, s: 7.8, color: BLANCO, centroEn: [MI, MD] });
    const wNum = 16;
    const wBloque = 92; // etiqueta + casilla
    const xs = [MI + wNum, MI + wNum + wBloque, MI + wNum + wBloque * 2, MI + wNum + wBloque * 3, MI + wNum + wBloque * 4];
    for (let i = 0; i < FILAS_POR_HOJA; i++) {
      const yf = yCond + altoHead + altoFila * i;
      if (i > 0) linea(MI, yf, MD, yf, 0.4);
      const e = filas[i];
      texto(String(h * FILAS_POR_HOJA + i + 1), 0, yf + 9, { s: 6.5, centroEn: [MI, MI + wNum] });
      const etiquetas = ['CALIB:', 'SIN CALIB:', 'CON CERTIF.:', 'SIN CERTIF.:'];
      const marcado = [
        e?.calibracion === 'CALIBRADO',
        e?.calibracion === 'SIN_CALIBRAR',
        e?.certificado === 'CON_CERTIFICADO',
        e?.certificado === 'SIN_CERTIFICADO',
      ];
      etiquetas.forEach((et, j) => {
        const x = xs[j];
        texto(et, x + 4, yf + 9, { s: 6.5 });
        const cxb = x + wBloque - 15;
        page.drawRectangle({ x: cxb, y: Y(yf + 10.6), width: 9.5, height: 9, borderColor: LINEA, borderWidth: 0.6 });
        if (marcado[j]) {
          linea(cxb + 1.5, yf + 3, cxb + 8, yf + 9.5, 1.2, NEGRO);
          linea(cxb + 8, yf + 3, cxb + 1.5, yf + 9.5, 1.2, NEGRO);
        }
      });
      texto('INFOR:', xs[4] + 4, yf + 9, { s: 6.5 });
      if (e?.informe) {
        const x0 = xs[4] + 4 + ancho('INFOR:', normal, 6.5) + 3;
        const { txt, size } = ajustar(e.informe, normal, 7.5, MD - x0 - 4);
        texto(txt, x0, yf + 9, { s: size });
      }
    }
    // separadores verticales de la franja de condición
    [...xs, MD].forEach((x, k) => {
      if (k < xs.length) linea(x, yCond + altoHead, x, yCond + altoHead + altoFila * FILAS_POR_HOJA, 0.4);
    });

    // ---- observaciones ----
    const yObs = yCond + altoHead + altoFila * FILAS_POR_HOJA + 8;
    const altoObs = 46;
    rect(MI, yObs, ANCHO, altoObs, 6, { borde: OSCURO, grosor: 1 });
    texto('OBSERVACIONES:', MI + 5, yObs + 11, { f: cursiva, s: 7 });
    const xo = MI + 5 + ancho('OBSERVACIONES:', cursiva, 7) + 4;
    [11, 22, 33].forEach((dy) => linea(xo - (dy === 11 ? 0 : xo - MI - 6), yObs + dy + 2, MD - 6, yObs + dy + 2, 0.4, GRIS));
    if (datos.observaciones) {
      const lineasObs = envolver(datos.observaciones, normal, 7.5, MD - xo - 10);
      lineasObs.slice(0, 1).forEach((l) => texto(l, xo + 2, yObs + 11, { s: 7.5 }));
      const resto = lineasObs.slice(1).join(' ');
      if (resto) {
        envolver(resto, normal, 7.5, ANCHO - 18).slice(0, 2).forEach((l, i) => texto(l, MI + 7, yObs + 22 + i * 11, { s: 7.5 }));
      }
    }

    // ---- instrucciones de envío ----
    const yEnv = yObs + altoObs + 8;
    const altoEnvHead = 12;
    const altoEnvFila = 14;
    rect(MI, yEnv, ANCHO, altoEnvHead + altoEnvFila * 2, 5, { borde: OSCURO, grosor: 1 });
    rect(MI, yEnv, ANCHO, altoEnvHead, 5, { relleno: OSCURO });
    texto('INSTRUCCIONES DE ENVÍO', 0, yEnv + 9, { f: negrita, s: 8, color: BLANCO, centroEn: [MI, MD] });
    const colEnv = [ANCHO * 0.38, ANCHO * 0.34, ANCHO * 0.28];
    const celdasEnv: [string, string][][] = [
      [['EMPRESA', datos.envio_empresa ?? ''], ['DESTINATARIO', datos.envio_destinatario ?? ''], ['CIUDAD', datos.envio_ciudad ?? '']],
      [['GUÍA #', datos.envio_guia ?? ''], ['FECHA DE ENVÍO', fechaHoja(datos.envio_fecha)], ['FACTURA CMEE#', datos.envio_factura_cmee ?? '']],
    ];
    linea(MI, yEnv + altoEnvHead + altoEnvFila, MD, yEnv + altoEnvHead + altoEnvFila, 0.4);
    let xe = MI;
    colEnv.forEach((w, j) => {
      if (j > 0) linea(xe, yEnv + altoEnvHead, xe, yEnv + altoEnvHead + altoEnvFila * 2, 0.4);
      celdasEnv.forEach((fila, i) => {
        const [et, val] = fila[j];
        const yf = yEnv + altoEnvHead + altoEnvFila * i + 10;
        texto(et, xe + 4, yf, { f: normal, s: 6.3 });
        const x0 = xe + 4 + ancho(et, normal, 6.3) + 4;
        const { txt, size } = ajustar(val, normal, 8, xe + w - x0 - 4);
        texto(txt, x0, yf, { s: size });
      });
      xe += w;
    });

    // ---- condiciones de entrega ----
    const yCe = yEnv + altoEnvHead + altoEnvFila * 2 + 10;
    rect(MI + 95, yCe, ANCHO - 190, 17, 7, { relleno: OSCURO });
    texto('CONDICIONES DE ENTREGA', 0, yCe + 12.5, { f: negrita, s: 11, color: BLANCO, centroEn: [MI + 95, MD - 95] });
    let yt = yCe + 27;
    CONDICIONES.forEach((c) => {
      envolver(c, normal, 6.6, ANCHO - 4).forEach((l) => {
        texto(l, MI + 2, yt, { s: 6.6 });
        yt += 8.2;
      });
    });

    // ---- firmas ----
    const yFirma = yt + 4;
    const altoFirma = Math.min(112, Math.max(84, H - 30 - yFirma));
    const mitad = (ANCHO - 12) / 2;
    const bloqueFirma = (x: number, titulo: string, nombre: string, ci: string, tituloIzq: boolean) => {
      rect(x, yFirma, mitad, altoFirma, 7, { borde: OSCURO, grosor: 1 });
      if (tituloIzq) texto(titulo, x + 8, yFirma + 11, { f: negrita, s: 7.8 });
      else texto(titulo, 0, yFirma + 11, { f: negrita, s: 7.8, centroEn: [x, x + mitad] });
      const yf = yFirma + altoFirma - 36;
      texto('f)', x + 10, yf, { f: normal, s: 8 });
      linea(x + 22, yf + 2, x + mitad - 14, yf + 2, 0.5, GRIS);
      texto('NOMBRE:', x + 10, yf + 13, { f: cursiva, s: 7 });
      const xn = x + 10 + ancho('NOMBRE:', cursiva, 7) + 4;
      linea(xn, yf + 15, x + mitad - 14, yf + 15, 0.5, GRIS);
      const n1 = ajustar(nombre, normal, 8.5, x + mitad - 16 - xn);
      texto(n1.txt, xn + 2, yf + 13, { s: n1.size });
      texto('C.I.:', x + 10, yf + 26, { f: cursiva, s: 7 });
      const xci = x + 10 + ancho('C.I.:', cursiva, 7) + 4;
      linea(xci, yf + 28, x + mitad - 14, yf + 28, 0.5, GRIS);
      texto(seguro(ci, normal), xci + 2, yf + 26, { s: 8.5 });
    };
    bloqueFirma(MI, 'CONFORME CLIENTE', datos.cliente_firma_nombre ?? '', datos.cliente_firma_ci ?? '', true);
    bloqueFirma(MI + mitad + 12, 'ENTREGA CONFORME CMEE', datos.cmee_firma_nombre ?? '', datos.cmee_firma_ci ?? '', false);

    if (hojas > 1) {
      texto(`Hoja ${h + 1} de ${hojas}`, 0, H - 18, { s: 6.5, color: GRIS, derechaEn: MD });
    }
  }

  return pdf.save();
}

/**
 * Abre desde ya una pestaña en blanco, en el mismo clic del usuario (después de
 * generar el PDF el navegador ya no la deja abrir por tratarse de una ventana
 * emergente). Se llena luego con `mostrarPdf`.
 */
export function prepararVentanaPdf(): Window | null {
  try {
    return window.open('', '_blank');
  } catch {
    return null;
  }
}

/** Muestra el PDF en la pestaña preparada (o lo descarga si no se pudo abrir). */
export function mostrarPdf(bytes: Uint8Array, nombre: string, ventana: Window | null) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  if (ventana && !ventana.closed) {
    ventana.location.href = url;
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
}
