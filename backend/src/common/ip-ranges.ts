// backend/src/common/ip-ranges.ts
// Utilidades para validar si una IP cae dentro de los rangos permitidos.

type Netmask = { base: number; bits: number };

/** Convierte una IPv4 a un entero de 32 bits (o null si no es IPv4). */
function ipToInt(ip: string): number | null {
  const partes = ip.trim().split('.');
  if (partes.length !== 4) return null;
  let resultado = 0;
  for (const parte of partes) {
    const byte = Number(parte);
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) return null;
    resultado = (resultado << 8) | byte;
  }
  return resultado >>> 0;
}

/** Interpreta una entrada de rango: "192.168.1.0/24" o "10.0.0.5". */
function parsearRango(entrada: string): Netmask | null {
  const limpio = entrada.trim();
  if (!limpio) return null;

  let baseStr = limpio;
  let bits = 32;
  const barra = limpio.indexOf('/');
  if (barra !== -1) {
    baseStr = limpio.slice(0, barra);
    const bitsNum = Number(limpio.slice(barra + 1));
    if (!Number.isInteger(bitsNum) || bitsNum < 0 || bitsNum > 32) return null;
    bits = bitsNum;
  }

  const base = ipToInt(baseStr);
  if (base === null) return null;
  return { base, bits };
}

/**
 * Verifica si una IP cae dentro de ALGUNO de los rangos permitidos.
 * @param ip - IP del cliente (IPv4).
 * @param rangos - Texto con rangos, separados por coma, salto de línea o
 *                 espacio (ej. "192.168.1.0/24, 10.0.0.5\n172.16.0.0/16").
 */
export function ipEnRangosPermitidos(ip: string, rangos: string | null): boolean {
  if (!ip) return false;
  if (!rangos || !rangos.trim()) return true; // Sin restricción → acceso directo

  const ipInt = ipToInt(ip);
  if (ipInt === null) return false;

  const entradas = rangos.split(/[,\s;]+/).map(parsearRango).filter(Boolean) as Netmask[];

  for (const { base, bits } of entradas) {
    // Máscara: activa `bits` bits más altos.
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    if ((ipInt & mask) === (base & mask)) {
      return true;
    }
  }
  return false;
}

/** True si la IP es ::1 o 127.0.0.1 (acceso local). */
export function esLoopback(ip: string | null | undefined): boolean {
  if (!ip) return false;
  const limpio = ip.trim();
  return limpio === '::1' || limpio === '::ffff:127.0.0.1' || limpio === '127.0.0.1';
}