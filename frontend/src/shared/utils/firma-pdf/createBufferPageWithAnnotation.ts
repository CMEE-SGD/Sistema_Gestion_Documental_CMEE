// Vendorizado desde @signpdf/placeholder-plain@3.3.0 (dist/createBufferPageWithAnnotation.js), sin cambios de lógica.
// Nota: agrega el widget al array /Annots existente de la página en vez de
// reemplazarlo — así una segunda firma no borra el widget de la primera.
import { findObject } from './findObject';
import { getIndexFromRef } from './getIndexFromRef';
import type { ReadPdfReturnType } from './readPdf';

export function createBufferPageWithAnnotation(
  pdf: Buffer,
  info: ReadPdfReturnType,
  pageRef: string,
  widget: { toString(): string },
): Buffer {
  const pageDictionary = findObject(pdf, info.xref, pageRef).toString();

  let annotsStart: number;
  let annotsEnd: number;
  let annots: string;
  annotsStart = pageDictionary.indexOf('/Annots');
  if (annotsStart > -1) {
    annotsEnd = pageDictionary.indexOf(']', annotsStart);
    annots = pageDictionary.substr(annotsStart, annotsEnd + 1 - annotsStart);
    annots = annots.substr(0, annots.length - 1);
  } else {
    annotsStart = pageDictionary.length;
    annotsEnd = pageDictionary.length;
    annots = '/Annots [';
  }
  const pageDictionaryIndex = getIndexFromRef(info.xref, pageRef);
  const widgetValue = widget.toString();
  annots = `${annots} ${widgetValue}]`;

  const preAnnots = pageDictionary.substr(0, annotsStart);
  let postAnnots = '';
  if (pageDictionary.length > annotsEnd) {
    postAnnots = pageDictionary.substr(annotsEnd + 1);
  }
  return Buffer.concat([
    Buffer.from(`${pageDictionaryIndex} 0 obj\n`),
    Buffer.from('<<\n'),
    Buffer.from(`${preAnnots + annots + postAnnots}\n`),
    Buffer.from('\n>>\nendobj\n'),
  ]);
}
