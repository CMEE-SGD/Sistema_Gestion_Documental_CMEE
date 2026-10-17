import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/** Tamaño máximo de un archivo que no es PDF (los PDF conservan su comportamiento previo). */
export const TAMANO_MAXIMO_OTROS_BYTES = 25 * 1024 * 1024;

/**
 * Formatos admitidos en las carpetas "de cualquier formato", además del PDF.
 * Se excluyen a propósito los que llevan macros (.docm, .xlsm, .pptm, .xlsb…)
 * y todo lo ejecutable o interpretable por el navegador (.html, .svg, .js, .exe).
 */
const FIRMAS = {
  zip: [0x50, 0x4b, 0x03, 0x04], // .docx .xlsx .pptx
  ole: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], // .doc .xls .ppt
} as const;

type Tipo = 'zip' | 'ole' | 'texto';

const EXTENSIONES: Record<string, { tipo: Tipo; mime: string }> = {
  '.docx': { tipo: 'zip', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  '.xlsx': { tipo: 'zip', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  '.pptx': { tipo: 'zip', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  '.doc': { tipo: 'ole', mime: 'application/msword' },
  '.xls': { tipo: 'ole', mime: 'application/vnd.ms-excel' },
  '.ppt': { tipo: 'ole', mime: 'application/vnd.ms-powerpoint' },
  '.csv': { tipo: 'texto', mime: 'text/csv' },
  '.txt': { tipo: 'texto', mime: 'text/plain' },
};

export const EXTENSIONES_ADICIONALES = Object.keys(EXTENSIONES);

export const esPdf = (nombre: string) => path.extname(nombre).toLowerCase() === '.pdf';

export const esExtensionAdicional = (nombre: string) =>
  path.extname(nombre).toLowerCase() in EXTENSIONES;

/** Content-Type con el que se sirve un archivo al descargarlo. */
export function mimePorNombre(nombre: string): string {
  const ext = path.extname(nombre).toLowerCase();
  return EXTENSIONES[ext]?.mime ?? 'application/pdf';
}

/**
 * Valida el archivo ya recibido (en disco) contra el tipo de carpeta.
 * Si no es válido borra el temporal y lanza 400, para no dejar basura.
 */
export function validarArchivoParaCarpeta(
  file: Express.Multer.File,
  carpetaAdmiteCualquierFormato: boolean,
): void {
  const rechazar = (mensaje: string): never => {
    try {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch {
      /* el temporal ya no estaba */
    }
    throw new BadRequestException(mensaje);
  };

  const nombre = file.originalname || file.filename;
  if (esPdf(nombre)) return; // el PDF ya pasó el filtro de tipo en el módulo

  if (!carpetaAdmiteCualquierFormato) {
    return rechazar('Esta carpeta solo admite archivos PDF.');
  }
  const ext = path.extname(nombre).toLowerCase();
  const regla = EXTENSIONES[ext];
  if (!regla) {
    return rechazar(
      `Formato no admitido. Use PDF, Word, Excel, PowerPoint, CSV o TXT (${EXTENSIONES_ADICIONALES.join(', ')}). Los archivos con macros no se aceptan.`,
    );
  }
  if (file.size > TAMANO_MAXIMO_OTROS_BYTES) {
    return rechazar('El archivo supera el máximo de 25 MB.');
  }

  // El contenido debe corresponder a la extensión (no basta con renombrar).
  const fd = fs.openSync(file.path, 'r');
  let bytes: Buffer;
  try {
    const cabecera = Buffer.alloc(4096);
    const leidos = fs.readSync(fd, cabecera, 0, cabecera.length, 0);
    bytes = cabecera.subarray(0, leidos);
  } finally {
    fs.closeSync(fd);
  }
  if (regla.tipo === 'texto') {
    if (bytes.includes(0)) return rechazar('El contenido del archivo no corresponde a su extensión.');
  } else {
    const firma = FIRMAS[regla.tipo];
    const coincide = bytes.length >= firma.length && firma.every((b, i) => bytes[i] === b);
    if (!coincide) return rechazar('El contenido del archivo no corresponde a su extensión.');
  }
}

/** Para mover un documento: ¿puede vivir en la carpeta destino? */
export function archivoAdmitidoEnCarpeta(nombre: string, carpetaAdmiteCualquierFormato: boolean): boolean {
  return esPdf(nombre) || carpetaAdmiteCualquierFormato;
}
