/** Formatea el correlativo interno como identificador legible: CMEE-{año}-{000000}. */
export function formatearNumeroCertificado(
  numero: number,
  fecha: Date,
): string {
  const anio = fecha.getUTCFullYear();
  return `CMEE-${anio}-${String(numero).padStart(6, '0')}`;
}
