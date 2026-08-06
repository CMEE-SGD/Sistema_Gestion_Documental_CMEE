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
  /** Si se provee, el sello visual se dibuja como la apariencia del widget de firma. */
  sello?: { posicion: PosicionFirma; lineas: string[] };
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
    const { ancho, alto, contentStream } = construirAparienciaSello(sello.lineas);

    const paginaDictionary = findObject(pdf, info.xref, pageRef);
    const tamanoPagina =
      leerTamanoPagina(paginaDictionary) ??
      { ancho: ANCHO_PAGINA_DEFECTO, alto: ALTO_PAGINA_DEFECTO };

    const x1 = Math.min(Math.max(sello.posicion.x, 0), Math.max(tamanoPagina.ancho - ancho, 0));
    const yTope = Math.min(Math.max(sello.posicion.y, alto), tamanoPagina.alto);
    const y1 = yTope - alto;
    widgetRect = [x1, y1, x1 + ancho, yTope];

    info.xref.maxIndex += 1;
    const aparienciaIndex = info.xref.maxIndex;
    addedReferences.set(aparienciaIndex, pdf.length + 1);
    const dictSinStream = PDFObject.convert({
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
      BBox: [0, 0, ancho, alto],
      Resources: {
        Font: { F1: { Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica', Encoding: 'WinAnsiEncoding' } },
        ExtGState: { GS1: { Type: 'ExtGState', ca: 0.9, CA: 0.9 } },
      },
      Length: contentStream.length,
    });
    pdf = Buffer.concat([
      pdf,
      Buffer.from('\n'),
      Buffer.from(`${aparienciaIndex} 0 obj\n`),
      Buffer.from(dictSinStream),
      Buffer.from('\nstream\n'),
      contentStream,
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
