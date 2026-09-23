// Fecha "de hoy" de la maqueta: fija, para que las cifras de demostración
// (vencimientos, antigüedad de cartera) no cambien de un día a otro.
export const HOY = '2026-09-23';

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MESES_CORTOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const fmtUSD = (n: number): string => usd.format(n);

export const fmtUSDCompacto = (n: number): string => {
  const abs = Math.abs(n);
  const signo = n < 0 ? '-' : '';
  if (abs >= 1000) return `${signo}$${(abs / 1000).toFixed(1)}k`;
  return `${signo}$${abs.toFixed(0)}`;
};

const aUTC = (iso: string): number => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const diferenciaDias = (desde: string, hasta: string): number =>
  Math.round((aUTC(hasta) - aUTC(desde)) / 86400000);

export const sumarDias = (iso: string, dias: number): string =>
  new Date(aUTC(iso) + dias * 86400000).toISOString().slice(0, 10);

export const fmtFecha = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const mesDeIso = (iso: string): number => Number(iso.slice(5, 7));
export const anioDeIso = (iso: string): number => Number(iso.slice(0, 4));

export const textoDias = (dias: number): string => {
  if (dias === 0) return 'vence hoy';
  if (dias > 0) return dias === 1 ? 'vence mañana' : `vence en ${dias} días`;
  const atraso = Math.abs(dias);
  return atraso === 1 ? 'vencida hace 1 día' : `vencida hace ${atraso} días`;
};
