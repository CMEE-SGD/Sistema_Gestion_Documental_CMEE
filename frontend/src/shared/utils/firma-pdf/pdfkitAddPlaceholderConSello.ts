// Fork de @signpdf/placeholder-pdfkit010@3.3.0 (dist/pdfkitAddPlaceholder.js). La única
// diferencia real: el widget de firma ahora incluye `AP: { N: apariencia }` para que
// muestre el sello visual como su propia apariencia — el original no aceptaba eso y
// siempre creaba un widget invisible (Rect [0,0,0,0]).
import {
  ANNOTATION_FLAGS,
  DEFAULT_BYTE_RANGE_PLACEHOLDER,
  DEFAULT_SIGNATURE_LENGTH,
  PDFKitReferenceMock,
  SIG_FLAGS,
  SUBFILTER_ADOBE_PKCS7_DETACHED,
} from '@signpdf/utils';

/** Mock mínimo de un PDFDocument de pdfkit — igual al que arma plainAddPlaceholder.js,
 * compartido por el orquestador (agregarSelloYPlaceholder.ts) y este archivo. */
export interface PdfKitMock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: (input: Record<string, any>, knownIndex?: number) => PDFKitReferenceMock;
  page: { dictionary: PDFKitReferenceMock & { data: { Annots: unknown[] } } };
  _root: { data: { AcroForm?: string | PDFKitReferenceMock } };
}

export interface AgregarPlaceholderConSelloInput {
  pdf: PdfKitMock;
  pdfBuffer: Buffer;
  reason: string;
  contactInfo: string;
  name: string;
  location: string;
  signingTime?: Date;
  signatureLength?: number;
  byteRangePlaceholder?: string;
  subFilter?: string;
  widgetRect: [number, number, number, number];
  appName?: string;
  /** Referencia (ya creada vía pdf.ref) al XObject Form con la apariencia del sello. */
  apariencia?: PDFKitReferenceMock;
}

export function pdfkitAddPlaceholderConSello({
  pdf,
  pdfBuffer,
  reason,
  contactInfo,
  name,
  location,
  signingTime = undefined,
  signatureLength = DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER,
  subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
  widgetRect,
  appName = undefined,
  apariencia,
}: AgregarPlaceholderConSelloInput): {
  signature: PDFKitReferenceMock;
  form: PDFKitReferenceMock;
  widget: PDFKitReferenceMock;
} {
  const signature = pdf.ref({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: subFilter,
    ByteRange: [0, byteRangePlaceholder, byteRangePlaceholder, byteRangePlaceholder],
    Contents: Buffer.from(String.fromCharCode(0).repeat(signatureLength)),
    Reason: new String(reason),
    M: signingTime ?? new Date(),
    ContactInfo: new String(contactInfo),
    Name: new String(name),
    Location: new String(location),
    Prop_Build: {
      Filter: { Name: 'Adobe.PPKLite' },
      ...(appName ? { App: { Name: appName } } : {}),
    },
  });

  const isAcroFormExists = typeof pdf._root.data.AcroForm !== 'undefined';
  let fieldIds: PDFKitReferenceMock[] = [];
  let acroFormId: number | undefined;
  if (isAcroFormExists) {
    const acroFormPosition = pdfBuffer.lastIndexOf('/Type /AcroForm');
    let acroFormStart = acroFormPosition;
    const charsUntilIdEnd = 10;
    const acroFormIdEnd = acroFormPosition - charsUntilIdEnd;
    const maxAcroFormIdLength = 12;
    for (let index = charsUntilIdEnd + 1; index < charsUntilIdEnd + maxAcroFormIdLength; index += 1) {
      const acroFormIdString = pdfBuffer.slice(acroFormPosition - index, acroFormIdEnd).toString();
      if (acroFormIdString[0] === '\n') break;
      acroFormStart = acroFormPosition - index;
    }
    const pdfSlice = pdfBuffer.slice(acroFormStart);
    const acroForm = pdfSlice.slice(0, pdfSlice.indexOf('endobj')).toString();
    acroFormId = parseInt(String(pdf._root.data.AcroForm), 10);
    const acroFormFields = acroForm.slice(acroForm.indexOf('/Fields [') + 9, acroForm.indexOf(']'));
    fieldIds = acroFormFields
      .split(' ')
      .filter(Boolean)
      .filter((_element, i) => i % 3 === 0)
      .map((fieldId) => new PDFKitReferenceMock(Number(fieldId)));
  }

  const signatureName = 'Signature';
  const widget = pdf.ref({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: widgetRect,
    V: signature,
    T: new String(signatureName + (fieldIds.length + 1)),
    F: ANNOTATION_FLAGS.PRINT,
    P: pdf.page.dictionary,
    ...(apariencia ? { AP: { N: apariencia } } : {}),
  });

  pdf.page.dictionary.data.Annots = [widget];

  let form: PDFKitReferenceMock;
  if (!isAcroFormExists) {
    form = pdf.ref({
      Type: 'AcroForm',
      SigFlags: SIG_FLAGS.SIGNATURES_EXIST | SIG_FLAGS.APPEND_ONLY,
      Fields: [...fieldIds, widget],
    });
  } else {
    form = pdf.ref(
      {
        Type: 'AcroForm',
        SigFlags: SIG_FLAGS.SIGNATURES_EXIST | SIG_FLAGS.APPEND_ONLY,
        Fields: [...fieldIds, widget],
      },
      acroFormId,
    );
  }
  pdf._root.data.AcroForm = form;

  return { signature, form, widget };
}
