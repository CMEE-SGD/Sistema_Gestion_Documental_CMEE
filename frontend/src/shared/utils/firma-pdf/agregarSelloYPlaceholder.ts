// Orquestador nuevo que reemplaza la combinación anterior de agregarSelloVisual()
// (pdf-lib, re-serializaba el PDF completo y por eso rompía firmas previas — ver
// diagnóstico en firmarPdf.ts) + plainAddPlaceholder() de @signpdf/placeholder-plain.
//
// Sigue el mismo patrón "solo agregar al final" (actualización incremental clásica de
// PDF) que ya usaba plainAddPlaceholder.js — nunca reparsea ni reescribe los bytes
// existentes del PDF, así que firmas anteriores en cadenas de varios firmantes quedan
// intactas. La diferencia es que ahora también agrega el sello visual como la
// apariencia (/AP /N) del propio widget de firma, en el mismo paso.
import {
  DEFAULT_SIGNATURE_LENGTH,
  PDFKitReferenceMock,
  PDFObject,
  removeTrailingNewLine,
  SUBFILTER_ADOBE_PKCS7_DETACHED,
} from '@signpdf/utils';
import { deflate } from 'pako';
import { readPdf, type ReadPdfReturnType } from './readPdf';
import { getPageRef } from './getPageRef';
import { getIndexFromRef } from './getIndexFromRef';
import { findObject } from './findObject';
import { createBufferRootWithAcroform } from './createBufferRootWithAcroform';
import { createBufferPageWithAnnotation } from './createBufferPageWithAnnotation';
import { createBufferTrailer } from './createBufferTrailer';
import { pdfkitAddPlaceholderConSello, type PdfKitMock } from './pdfkitAddPlaceholderConSello';
import { construirAparienciaSello } from './crearAparienciaSello';
import type { PosicionFirma } from '../../components/organisms/SelectorPosicionFirma';

const ANCHO_PAGINA_DEFECTO = 612; // Carta, usado solo si no se puede leer /MediaBox
const ALTO_PAGINA_DEFECTO = 792;

function obtenerAcroFormRef(slice: string): string | undefined {
  const regex = /\/AcroForm\s+(\d+\s\d+\sR)/g;
  const match = regex.exec(slice);
  return match?.[1] ?? undefined;
}

/** Lee /MediaBox del objeto (página u hoja /Pages) para saber el tamaño real de la página. */
function leerTamanoPagina(objetoDictionary: Buffer): { ancho: number; alto: number } | null {
  const match = /\/MediaBox\s*\[\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*\]/.exec(
    objetoDictionary.toString(),
  );
  if (!match) return null;
  const [, x0, y0, x1, y1] = match.map(Number) as unknown as number[];
  return { ancho: x1 - x0, alto: y1 - y0 };
}

export interface OpcionesFirmaPlaceholder {
  pdfBuffer: Buffer;
  reason: string;
  contactInfo: string;
  name: string;
  location: string;
  signatureLength?: number;
  /** Si se provee, el sello visual se dibuja como la apariencia del widget de firma.
 * El tamaño final (ancho/alto) viene en `posicion` — lo eligió el usuario al
 * redimensionar el recuadro; el contenido base se escala con una matriz `cm`. */
  sello?: {
    posicion: PosicionFirma;
    etiqueta: string;
    nombre: string;
    qrUrl?: string;
  };
}

export function agregarSelloYPlaceholder({
  pdfBuffer,
  reason,
  contactInfo,
  name,
  location,
  signatureLength = DEFAULT_SIGNATURE_LENGTH,
  sello,
}: OpcionesFirmaPlaceholder): Buffer {
  let pdf = removeTrailingNewLine(pdfBuffer);
  const info: ReadPdfReturnType = readPdf(pdf);
  const pageRef = getPageRef(pdf, info, sello?.posicion.pagina ?? 0);
  const pageIndex = getIndexFromRef(info.xref, pageRef);
  const addedReferences = new Map<number, number>();

  const pdfKitMock: PdfKitMock = {
    ref: (input, knownIndex) => {
      info.xref.maxIndex += 1;
      const index = knownIndex != null ? knownIndex : info.xref.maxIndex;
      addedReferences.set(index, pdf.length + 1);
      pdf = Buffer.concat([
        pdf,
        Buffer.from('\n'),
        Buffer.from(`${index} 0 obj\n`),
        Buffer.from(PDFObject.convert(input)),
        Buffer.from('\nendobj\n'),
      ]);
      return new PDFKitReferenceMock(info.xref.maxIndex);
    },
    page: {
      dictionary: new PDFKitReferenceMock(pageIndex, { data: { Annots: [] as unknown[] } }) as PdfKitMock['page']['dictionary'],
    },
    _root: { data: {} },
  };

  const acroFormRef = obtenerAcroFormRef(info.root.toString());
  if (acroFormRef) {
    pdfKitMock._root.data.AcroForm = acroFormRef;
  }

  // Agrega el XObject Form del sello ANTES del placeholder de firma, para poder
  // referenciarlo desde el widget (AP/N). Usa el mismo Buffer.concat "solo agregar"
  // que pdfKitMock.ref(), pero escribe el stream como bytes crudos (sin pasar por
  // PDFObject.convert, que fuerza utf8 y corrompería tildes/ñ en WinAnsi).
  let aparienciaRef: PDFKitReferenceMock | undefined;
  let widgetRect: [number, number, number, number] = [0, 0, 0, 0];

  if (sello) {
    // La apariencia se construye a su tamaño "natural" (según el contenido) y
    // luego se escala con una matriz `cm` al recuadro que eligió el usuario
    // en el selector. La escala es SIEMPRE uniforme (mismo factor en ambos
    // ejes, el más restrictivo) — nunca independiente por eje: el sello trae
    // un QR, y estirarlo de forma no uniforme deja de ser un cuadrado de
    // módulos parejos, lo que rompe la lectura del escáner y además hace que
    // el logo institucional (centrado en el QR a propósito) se vea
    // descuadrado. Si el recuadro elegido no tiene la proporción natural del
    // sello, el contenido queda centrado dentro de él (igual que
    // "object-fit: contain") en vez de deformarse para llenarlo.
    const base = construirAparienciaSello({
      etiqueta: sello.etiqueta,
      nombre: sello.nombre,
      qrUrl: sello.qrUrl,
    });
    const anchoObjetivo = sello.posicion.ancho;
    const altoObjetivo = sello.posicion.alto;
    const escalaX = base.ancho > 0 ? anchoObjetivo / base.ancho : 1;
    const escalaY = base.alto > 0 ? altoObjetivo / base.alto : 1;
    const escala = Math.min(escalaX, escalaY) || 1;
    const offsetX = (anchoObjetivo - base.ancho * escala) / 2;
    const offsetY = (altoObjetivo - base.alto * escala) / 2;
    const contentStreamEscalado = Buffer.concat([
      Buffer.from(
        `q\n${escala.toFixed(4)} 0 0 ${escala.toFixed(4)} ${offsetX.toFixed(4)} ${offsetY.toFixed(4)} cm\n`,
        'ascii',
      ),
      base.contentStream,
      Buffer.from('\nQ\n', 'ascii'),
    ]);

    const ancho = anchoObjetivo;
    const alto = altoObjetivo;
    const paginaDictionary = findObject(pdf, info.xref, pageRef);
    const tamanoPagina =
      leerTamanoPagina(paginaDictionary) ??
      { ancho: ANCHO_PAGINA_DEFECTO, alto: ALTO_PAGINA_DEFECTO };

    const x1 = Math.min(Math.max(sello.posicion.x, 0), Math.max(tamanoPagina.ancho - ancho, 0));
    const yTope = Math.min(Math.max(sello.posicion.y, alto), tamanoPagina.alto);
    const y1 = yTope - alto;
    widgetRect = [x1, y1, x1 + ancho, yTope];

    // Si el sello trae logo (XObject de imagen en el centro del QR), se
    // incrusta el objeto ANTES del XObject Form para poder referenciarlo desde
    // su diccionario /Resources. Igual que el resto, solo se agrega al final
    // (actualización incremental) sin tocar los bytes existentes.
    let recursoImagenRef: PDFKitReferenceMock | undefined;
    if (base.recursoImagen) {
      info.xref.maxIndex += 1;
      const imagenIndex = info.xref.maxIndex;
      addedReferences.set(imagenIndex, pdf.length + 1);
      const dictImagen: Record<string, unknown> = {
        Type: 'XObject',
        Subtype: 'Image',
        Width: base.recursoImagen.imagen.ancho,
        Height: base.recursoImagen.imagen.alto,
        ColorSpace: 'DeviceRGB',
        BitsPerComponent: 8,
        Filter: base.recursoImagen.imagen.filtro,
        Length: base.recursoImagen.imagen.streamBytes.length,
      };
      pdf = Buffer.concat([
        pdf,
        Buffer.from('\n'),
        Buffer.from(`${imagenIndex} 0 obj\n`),
        Buffer.from(PDFObject.convert(dictImagen)),
        Buffer.from('\nstream\n'),
        base.recursoImagen.imagen.streamBytes,
        Buffer.from('\nendstream\nendobj\n'),
      ]);
      recursoImagenRef = new PDFKitReferenceMock(imagenIndex);
    }

    // El QR en estilo "puntos" (círculos vía curvas Bézier — ver
    // crearBloqueQr.ts) genera muchísimos más operadores que el cuadriculado
    // anterior; comprimir el stream evita que cada firma agregue cientos de
    // KB de texto PDF sin comprimir. `pako.deflate` produce el mismo formato
    // zlib (RFC 1950) que `/FlateDecode` espera — cualquier lector de PDF lo
    // descomprime igual que si viniera sin comprimir, solo que más liviano.
    const contentStreamComprimido = Buffer.from(deflate(contentStreamEscalado));

    info.xref.maxIndex += 1;
    const aparienciaIndex = info.xref.maxIndex;
    addedReferences.set(aparienciaIndex, pdf.length + 1);
    const dictSinStream = PDFObject.convert({
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
      BBox: [0, 0, ancho, alto],
      Filter: 'FlateDecode',
      Resources: {
        Font: {
          F1: { Type: 'Font', Subtype: 'Type1', BaseFont: 'Courier', Encoding: 'WinAnsiEncoding' },
          F2: { Type: 'Font', Subtype: 'Type1', BaseFont: 'Courier-Bold', Encoding: 'WinAnsiEncoding' },
        },
        ExtGState: {
          GS1: { Type: 'ExtGState', ca: 0.9, CA: 0.9 },
          // Dedicado al QR: 100% opaco, para no arriesgar la fiabilidad del
          // escaneo por el mismo alpha 0.9 que ya usa el texto.
          GS2: { Type: 'ExtGState', ca: 1, CA: 1 },
        },
        // Logo institucional dibujado en el centro del QR (ver construirAparienciaSello).
        XObject: base.recursoImagen && recursoImagenRef
          ? { [base.recursoImagen.nombre]: recursoImagenRef }
          : {},
      },
      Length: contentStreamComprimido.length,
    });
    pdf = Buffer.concat([
      pdf,
      Buffer.from('\n'),
      Buffer.from(`${aparienciaIndex} 0 obj\n`),
      Buffer.from(dictSinStream),
      Buffer.from('\nstream\n'),
      contentStreamComprimido,
      Buffer.from('\nendstream\nendobj\n'),
    ]);
    aparienciaRef = new PDFKitReferenceMock(aparienciaIndex);
  }

  const { form, widget } = pdfkitAddPlaceholderConSello({
    pdf: pdfKitMock,
    pdfBuffer,
    reason,
    contactInfo,
    name,
    location,
    signatureLength,
    subFilter: SUBFILTER_ADOBE_PKCS7_DETACHED,
    widgetRect,
    apariencia: aparienciaRef,
  });

  if (!obtenerAcroFormRef(pdf.toString())) {
    const rootIndex = getIndexFromRef(info.xref, info.rootRef);
    addedReferences.set(rootIndex, pdf.length + 1);
    pdf = Buffer.concat([pdf, Buffer.from('\n'), createBufferRootWithAcroform(pdf, info, form)]);
  }

  addedReferences.set(pageIndex, pdf.length + 1);
  pdf = Buffer.concat([pdf, Buffer.from('\n'), createBufferPageWithAnnotation(pdf, info, pageRef, widget)]);

  pdf = Buffer.concat([pdf, Buffer.from('\n'), createBufferTrailer(pdf, info, addedReferences)]);

  return pdf;
}
