import { CATEGORIAS_EGRESO } from './calculos';
import type { Egreso, Factura, NotaCredito, ValorRevision } from './tipos';

// La maqueta no tiene servidor: lo que se carga vive en este navegador
// (localStorage). Además se puede sacar una copia a un archivo y volver a
// cargarla, para respaldar o para llevar los datos a otro equipo.

const CLAVE = 'sgd-financiero-datos';
export const VERSION_COPIA = 1;

export interface DatosFinancieros {
  facturas: Factura[];
  // Notas de crédito cuya factura original todavía no está registrada.
  notasSueltas: NotaCredito[];
  egresos: Egreso[];
  revision: Record<string, ValorRevision>;
  devolucion: number;
}

export const DATOS_VACIOS: DatosFinancieros = {
  facturas: [],
  notasSueltas: [],
  egresos: [],
  revision: {},
  devolucion: 0,
};

const esObjeto = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const esTexto = (x: unknown): x is string => typeof x === 'string';
const esNumero = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

function esNota(x: unknown): x is NotaCredito {
  return (
    esObjeto(x) &&
    esNumero(x.id) &&
    esTexto(x.numero) &&
    esTexto(x.claveAcceso) &&
    esTexto(x.fechaEmision) &&
    esTexto(x.facturaModificada) &&
    esNumero(x.valor) &&
    esNumero(x.subtotal)
  );
}

function esFactura(x: unknown): x is Factura {
  return (
    esObjeto(x) &&
    esNumero(x.id) &&
    esTexto(x.numero) &&
    esTexto(x.claveAcceso) &&
    esTexto(x.fechaEmision) &&
    esTexto(x.clienteNombre) &&
    esNumero(x.plazoDias) &&
    esNumero(x.subtotal) &&
    esNumero(x.total) &&
    Array.isArray(x.lineas) &&
    Array.isArray(x.cobros) &&
    x.cobros.every((c) => esObjeto(c) && esNumero(c.id) && esNumero(c.monto) && esTexto(c.fecha)) &&
    Array.isArray(x.creditos) &&
    x.creditos.every(esNota) &&
    typeof x.anulada === 'boolean'
  );
}

function esEgreso(x: unknown): x is Egreso {
  return (
    esObjeto(x) &&
    esNumero(x.id) &&
    esNumero(x.anio) &&
    esNumero(x.mes) &&
    esNumero(x.monto) &&
    esTexto(x.detalle) &&
    esTexto(x.categoria) &&
    x.categoria in CATEGORIAS_EGRESO &&
    (x.estado === 'PAGADO' || x.estado === 'PENDIENTE')
  );
}

// Devuelve los datos si tienen la forma esperada; si no, null.
export function validarDatos(x: unknown): DatosFinancieros | null {
  if (!esObjeto(x)) return null;
  const { facturas, notasSueltas, egresos, revision, devolucion } = x;
  if (
    !Array.isArray(facturas) ||
    !facturas.every(esFactura) ||
    !Array.isArray(notasSueltas) ||
    !notasSueltas.every(esNota) ||
    !Array.isArray(egresos) ||
    !egresos.every(esEgreso) ||
    !esObjeto(revision) ||
    !esNumero(devolucion) ||
    devolucion < 0
  ) {
    return null;
  }
  return { facturas, notasSueltas, egresos, revision: revision as Record<string, ValorRevision>, devolucion };
}

export function cargarDatos(): DatosFinancieros | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? validarDatos(JSON.parse(crudo)) : null;
  } catch {
    return null;
  }
}

// false si el navegador no dejó guardar (almacenamiento lleno o bloqueado).
export function guardarDatos(datos: DatosFinancieros): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
    return true;
  } catch {
    return false;
  }
}

export function serializarCopia(datos: DatosFinancieros): string {
  return JSON.stringify(
    { version: VERSION_COPIA, exportadoEl: new Date().toISOString(), datos },
    null,
    2,
  );
}

export function leerCopia(contenido: string):
  | { ok: true; datos: DatosFinancieros }
  | { ok: false; mensaje: string } {
  let json: unknown;
  try {
    json = JSON.parse(contenido);
  } catch {
    return { ok: false, mensaje: 'El archivo no es una copia válida: no se pudo leer.' };
  }
  if (!esObjeto(json) || json.version !== VERSION_COPIA) {
    return {
      ok: false,
      mensaje: 'El archivo no es una copia de este módulo o es de una versión que no se reconoce.',
    };
  }
  const datos = validarDatos(json.datos);
  return datos
    ? { ok: true, datos }
    : { ok: false, mensaje: 'La copia está incompleta o dañada. No se cargó nada.' };
}
