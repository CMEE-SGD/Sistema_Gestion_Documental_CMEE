import type { Factura, LineaFactura, NotaCredito } from './tipos';

// Lector de los XML autorizados por el SRI (factura y nota de crédito).
//
// El archivo que se descarga de Contífico es un sobre <autorizacion> que trae
// el comprobante real dentro de un bloque CDATA. Los montos se toman tal cual
// del comprobante: no se recalculan ni se redondean distinto.

// El único emisor aceptado: ESPE STORE.
export const EMISOR_RUC = '1793211474001';

export type LecturaXml =
  | { tipo: 'FACTURA'; factura: Omit<Factura, 'id'> }
  | { tipo: 'NOTA'; nota: Omit<NotaCredito, 'id'> }
  | { tipo: 'ERROR'; mensaje: string };

const error = (mensaje: string): LecturaXml => ({ tipo: 'ERROR', mensaje });

const NOMBRE_COMPROBANTE: Record<string, string> = {
  '05': 'una nota de débito',
  '06': 'una guía de remisión',
  '07': 'un comprobante de retención',
  '03': 'una liquidación de compra',
};

// Texto del primer descendiente con esa etiqueta ('' si no existe).
const texto = (desde: Element | Document | undefined, etiqueta: string): string =>
  desde?.getElementsByTagName(etiqueta)[0]?.textContent?.trim() ?? '';

const numero = (valor: string): number => {
  const n = Number(valor.replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : Number.NaN;
};

// "17/09/2026" -> "2026-09-17". Devuelve '' si no es una fecha real.
function fechaIso(valor: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
  if (!m) return '';
  const [, d, mes, a] = m;
  const f = new Date(Date.UTC(Number(a), Number(mes) - 1, Number(d)));
  const valida =
    f.getUTCFullYear() === Number(a) &&
    f.getUTCMonth() === Number(mes) - 1 &&
    f.getUTCDate() === Number(d);
  return valida ? `${a}-${mes}-${d}` : '';
}

// IVA del comprobante: suma de los impuestos con código 2.
function ivaDe(info: Element): number {
  const total = Array.from(info.getElementsByTagName('totalImpuesto'))
    .filter((t) => texto(t, 'codigo') === '2')
    .reduce((s, t) => s + numero(texto(t, 'valor')), 0);
  return Math.round(total * 100) / 100;
}

// "001-005-000000168" con o sin guiones -> "001-005-000000168".
function numeroDocumento(valor: string): string {
  const soloDigitos = valor.replace(/\D/g, '');
  return soloDigitos.length === 15
    ? `${soloDigitos.slice(0, 3)}-${soloDigitos.slice(3, 6)}-${soloDigitos.slice(6)}`
    : valor.trim();
}

function camposAdicionales(comprobante: Document): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const c of Array.from(comprobante.getElementsByTagName('campoAdicional'))) {
    const nombre = c.getAttribute('nombre')?.trim();
    const valor = c.textContent?.trim();
    if (nombre && valor) campos[nombre] = valor;
  }
  return campos;
}

// El cliente escribe su orden de compra dentro de un campo adicional libre.
function ordenDeCompra(campos: Record<string, string>): string | undefined {
  for (const valor of Object.values(campos)) {
    const m = /ORDEN\s+DE\s+COMPRA:?\s*([A-Za-z0-9\-/]+)/i.exec(valor);
    if (m) return m[1];
  }
  return undefined;
}

export function leerXmlSri(contenido: string): LecturaXml {
  const parser = new DOMParser();
  const sobre = parser.parseFromString(contenido.trim(), 'application/xml');
  if (sobre.getElementsByTagName('parsererror').length > 0) {
    return error('El archivo no es un XML válido.');
  }
  const raiz = sobre.documentElement;
  if (raiz.tagName !== 'autorizacion') {
    return error(
      'Este XML no trae la autorización del SRI. Usa el XML autorizado que descargas de Contífico.',
    );
  }

  const estado = texto(raiz, 'estado');
  if (estado.toUpperCase() !== 'AUTORIZADO') {
    return error(
      `El SRI no autorizó este comprobante${estado ? ` (estado: ${estado})` : ''}. Pide a Contífico el XML autorizado.`,
    );
  }
  const ambiente = texto(raiz, 'ambiente');
  if (!/PRODUCCI/i.test(ambiente)) {
    return error('Es un comprobante de pruebas, no de producción.');
  }

  const dentro = texto(raiz, 'comprobante');
  if (!dentro) return error('El XML no trae el comprobante.');
  const comprobante = parser.parseFromString(dentro.trim(), 'application/xml');
  if (comprobante.getElementsByTagName('parsererror').length > 0) {
    return error('No se pudo leer el comprobante que viene dentro del XML.');
  }

  const trib = comprobante.getElementsByTagName('infoTributaria')[0];
  if (!trib) return error('El comprobante no trae la información tributaria.');
  const ruc = texto(trib, 'ruc');
  if (ruc !== EMISOR_RUC) {
    return error(
      `Lo emitió el RUC ${ruc || 'desconocido'}. Solo se aceptan comprobantes de ESPE STORE.`,
    );
  }
  const claveAcceso = texto(trib, 'claveAcceso');
  if (!/^\d{49}$/.test(claveAcceso)) {
    return error('La clave de acceso no tiene los 49 dígitos que exige el SRI.');
  }
  const codDoc = texto(trib, 'codDoc');
  const numeroComprobante = `${texto(trib, 'estab')}-${texto(trib, 'ptoEmi')}-${texto(trib, 'secuencial')}`;
  const emisor = texto(trib, 'razonSocial');
  const numeroAutorizacion = texto(raiz, 'numeroAutorizacion');
  const tipo = comprobante.documentElement.tagName;

  if (tipo === 'factura' && codDoc === '01') {
    const info = comprobante.getElementsByTagName('infoFactura')[0];
    if (!info) return error('La factura no trae su información principal.');
    const fechaEmision = fechaIso(texto(info, 'fechaEmision'));
    const subtotal = numero(texto(info, 'totalSinImpuestos'));
    const total = numero(texto(info, 'importeTotal'));
    if (!fechaEmision || Number.isNaN(subtotal) || Number.isNaN(total)) {
      return error('Faltan la fecha o los montos de la factura, o no se pueden leer.');
    }

    const pago = info.getElementsByTagName('pago')[0];
    const plazo = pago ? Number(texto(pago, 'plazo')) || 0 : 0;
    const unidad = pago ? texto(pago, 'unidadTiempo').toLowerCase() : '';
    const plazoDias = unidad.startsWith('mes') ? plazo * 30 : plazo;

    const lineas: LineaFactura[] = Array.from(comprobante.getElementsByTagName('detalle')).map((d) => ({
      codigo: texto(d, 'codigoPrincipal') || texto(d, 'codigoInterno'),
      descripcion: texto(d, 'descripcion'),
      cantidad: Number(texto(d, 'cantidad')) || 0,
      precioUnitario: numero(texto(d, 'precioUnitario')) || 0,
      total: numero(texto(d, 'precioTotalSinImpuesto')) || 0,
    }));

    const infoAdicional = camposAdicionales(comprobante);
    return {
      tipo: 'FACTURA',
      factura: {
        numero: numeroComprobante,
        claveAcceso,
        numeroAutorizacion,
        clienteNombre: texto(info, 'razonSocialComprador'),
        clienteRuc: texto(info, 'identificacionComprador'),
        fechaEmision,
        plazoDias,
        subtotal,
        iva: ivaDe(info),
        total,
        lineas,
        cobros: [],
        creditos: [],
        anulada: false,
        ordenTrabajo: null,
        ordenCompra: ordenDeCompra(infoAdicional),
        ambiente,
        emisor,
        infoAdicional,
      },
    };
  }

  if (tipo === 'notaCredito' && codDoc === '04') {
    const info = comprobante.getElementsByTagName('infoNotaCredito')[0];
    if (!info) return error('La nota de crédito no trae su información principal.');
    const fechaEmision = fechaIso(texto(info, 'fechaEmision'));
    const subtotal = numero(texto(info, 'totalSinImpuestos'));
    const valor = numero(texto(info, 'valorModificacion'));
    const facturaModificada = numeroDocumento(texto(info, 'numDocModificado'));
    if (!fechaEmision || Number.isNaN(subtotal) || Number.isNaN(valor) || !facturaModificada) {
      return error('Faltan la fecha, los montos o la factura que modifica, o no se pueden leer.');
    }
    return {
      tipo: 'NOTA',
      nota: {
        numero: numeroComprobante,
        claveAcceso,
        fechaEmision,
        clienteNombre: texto(info, 'razonSocialComprador'),
        clienteRuc: texto(info, 'identificacionComprador'),
        facturaModificada,
        fechaFacturaOriginal: fechaIso(texto(info, 'fechaEmisionDocSustento')),
        subtotal,
        iva: ivaDe(info),
        valor,
        motivo: texto(info, 'motivo'),
      },
    };
  }

  const nombre = NOMBRE_COMPROBANTE[codDoc] ?? `un comprobante tipo ${codDoc || 'desconocido'}`;
  return error(`Este archivo es ${nombre}. Solo se aceptan facturas y notas de crédito.`);
}
