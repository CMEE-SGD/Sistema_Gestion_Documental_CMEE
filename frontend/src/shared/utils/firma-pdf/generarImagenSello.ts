// Provee los bytes del sello institucional (LOGO_CENTRO.png) como un XObject de
// imagen de PDF listo para incrustar en el centro del QR del sello de firma.
//
// La imagen se rasterizo una sola vez a 160x160 (RGB compuesto sobre blanco) y
// se comprimio con FlateDecode — los bytes ya vienen precocinados en LOGO_160.ts
// (ver su cabecera). Resultado: esta funcion es puramente computacional, sincrona
// y libre de DOM/red/zlib en runtime: siempre devuelve datos validos.
import { LOGO_160_BASE64 } from './LOGO_160';

export interface ImagenSelloPdf {
  /** Lado del cuadrado en píxeles (siempre cuadrado). */
  ancho: number;
  alto: number;
  /** Bytes RGB (3 canales/píxel), ya con alpha compuesto sobre blanco y
   * comprimidos con FlateDecode. */
  streamBytes: Buffer;
  /** `deflateSync` siempre entrega FlateDecode. */
  filtro: 'FlateDecode';
}

export function generarImagenSelloPdf(): ImagenSelloPdf {
  return {
    ancho: 160,
    alto: 160,
    streamBytes: Buffer.from(LOGO_160_BASE64, 'base64'),
    filtro: 'FlateDecode',
  };
}