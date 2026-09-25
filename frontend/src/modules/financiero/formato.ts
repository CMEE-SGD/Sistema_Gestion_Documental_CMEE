const dos = (n: number): string => String(n).padStart(2, '0');

// Fecha de hoy según el reloj del equipo. Todo lo que depende de "hoy"
// (vencimientos, cartera por antigüedad, el mes en curso) se calcula con ella.
const hoyLocalIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};

export const HOY = hoyLocalIso();

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
  if (abs >= 1000) {
    const miles = abs / 1000;
    return `${signo}$${Number.isInteger(miles) ? miles : miles.toFixed(1)}k`;
  }
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
export const diaDeIso = (iso: string): number => Number(iso.slice(8, 10));

export const diasDelMes = (anio: number, mes: number): number =>
  new Date(Date.UTC(anio, mes, 0)).getUTCDate();

export const mesAnterior = (anio: number, mes: number): { anio: number; mes: number } =>
  mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };

export const textoDias = (dias: number): string => {
  if (dias === 0) return 'vence hoy';
  if (dias > 0) return dias === 1 ? 'vence mañana' : `vence en ${dias} días`;
  const atraso = Math.abs(dias);
  return atraso === 1 ? 'vencida hace 1 día' : `vencida hace ${atraso} días`;
};
