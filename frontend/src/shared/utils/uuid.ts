// `crypto.randomUUID()` solo existe en contextos seguros (HTTPS o
// localhost) — en el servidor de producción, que hoy corre sobre HTTP
// plano mientras se resuelve el dominio/certificado, esa función no existe
// y rompe la firma con "crypto.randomUUID is not a function".
// `crypto.getRandomValues()` sí funciona en HTTP normal (es una API más
// vieja, sin esa restricción), así que la usamos para armar el UUID v4 a mano.
export function generarUuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // versión 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}
