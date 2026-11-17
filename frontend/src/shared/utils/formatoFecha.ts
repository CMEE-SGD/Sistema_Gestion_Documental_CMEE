// Formato de fecha del sistema: AÑO-MES-DÍA (2026-10-06) y, con hora,
// "2026-10-06 18:12:03" — en lugar de día/mes/año.
//
// En toda la aplicación las fechas se muestran con toLocaleDateString /
// toLocaleString (en más de 30 pantallas, cada una con su propio idioma:
// es-BO, es-ES, es-EC o el del navegador). En vez de tocarlas una por una, aquí
// se cambia en un solo lugar cómo esos métodos ordenan una fecha numérica.
//
// - Solo afecta a las fechas numéricas en español (o sin idioma indicado).
// - Si una pantalla pide el nombre del mes o del día ("6 de octubre de 2026"),
//   se respeta tal cual.
// - Las zonas horarias y las opciones de hora (hour, minute…) se conservan.
// - Los números (dinero, cantidades) no se tocan.
//
// Los campos de calendario nativos (<input type="date">) los dibuja el
// navegador con el idioma del equipo y no se pueden cambiar desde aquí.

/** Idioma que escribe las fechas en orden año-mes-día. */
const LOCALE_AAAA_MM_DD = 'sv-SE';

type Locales = string | string[] | undefined;

function esEspanolOSinIdioma(locales: Locales): boolean {
  if (locales === undefined) return true;
  const primero = Array.isArray(locales) ? locales[0] : locales;
  return typeof primero === 'string' && /^es(-|$)/i.test(primero);
}

function pideNombresDeFecha(opciones?: Intl.DateTimeFormatOptions): boolean {
  if (!opciones) return false;
  if (opciones.weekday) return true;
  if (opciones.month === 'long' || opciones.month === 'short' || opciones.month === 'narrow') return true;
  // dateStyle 'full' | 'long' | 'medium' escriben el nombre del mes.
  if (opciones.dateStyle && opciones.dateStyle !== 'short') return true;
  return false;
}

let instalado = false;

/** Cambia el orden de las fechas numéricas a año-mes-día. Idempotente. */
export function instalarFormatoFecha(): void {
  if (instalado || typeof Date === 'undefined') return;
  instalado = true;

  const toLocaleDateStringOriginal = Date.prototype.toLocaleDateString;
  const toLocaleStringOriginal = Date.prototype.toLocaleString;

  Date.prototype.toLocaleDateString = function (
    this: Date,
    locales?: Locales,
    opciones?: Intl.DateTimeFormatOptions,
  ) {
    if (esEspanolOSinIdioma(locales) && !pideNombresDeFecha(opciones)) {
      return toLocaleDateStringOriginal.call(this, LOCALE_AAAA_MM_DD, opciones);
    }
    return toLocaleDateStringOriginal.call(this, locales, opciones);
  } as typeof Date.prototype.toLocaleDateString;

  Date.prototype.toLocaleString = function (
    this: Date,
    locales?: Locales,
    opciones?: Intl.DateTimeFormatOptions,
  ) {
    if (esEspanolOSinIdioma(locales) && !pideNombresDeFecha(opciones)) {
      return toLocaleStringOriginal.call(this, LOCALE_AAAA_MM_DD, opciones);
    }
    return toLocaleStringOriginal.call(this, locales, opciones);
  } as typeof Date.prototype.toLocaleString;
}
