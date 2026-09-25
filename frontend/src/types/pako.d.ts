// Declaración mínima de tipos para `pako` (no trae tipos propios).
// Se usa únicamente para comprimir el stream de contenido del sello
// (ver agregarSelloYPlaceholder.ts): `deflate` produce zlib (RFC 1950),
// el mismo formato que espera /FlateDecode.
declare module 'pako' {
  export interface DeflateOptions {
    level?: number;
    windowBits?: number;
    memLevel?: number;
    strategy?: number;
    dictionary?: Uint8Array;
  }

  export function deflate(
    input: Uint8Array | ArrayBuffer,
    options?: DeflateOptions,
  ): Uint8Array;

  export function inflate(
    input: Uint8Array | ArrayBuffer,
    options?: DeflateOptions,
  ): Uint8Array;
}