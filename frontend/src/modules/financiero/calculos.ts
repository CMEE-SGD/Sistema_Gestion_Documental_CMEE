import type {
  CategoriaEgreso,
  Egreso,
  EstadoFactura,
  Factura,
  NotaCredito,
  TipoCobro,
} from './tipos';
import {
  HOY,
  MESES,
  MESES_CORTOS,
  anioDeIso,
  diaDeIso,
  diasDelMes,
  diferenciaDias,
  mesAnterior,
  mesDeIso,
  sumarDias,
} from './formato';

// Reglas de la maqueta (todas visibles en "Reglas y supuestos").
export const CMEE_PCT = 85;
export const ESPE_PCT = 15;
export const PROVISION_PCT = 10;

export const redondear = (n: number): number => Math.round(n * 100) / 100;

export const CATEGORIAS_EGRESO: Record<CategoriaEgreso, string> = {
  ADQUISICIONES: 'Adquisiciones',
  HONORARIOS: 'Honorarios',
  PASANTES: 'Pasantes',
  SERVICIOS_TECNICOS: 'Servicios técnicos',
  SUMINISTROS: 'Suministros',
  VIATICOS: 'Viáticos',
};

export function totalesFactura(f: Factura) {
  const cobrado = redondear(
    f.cobros
      .filter((c) => c.tipo !== 'RETENCION')
      .reduce((s, c) => s + c.monto, 0),
  );
  const retenciones = redondear(
    f.cobros
      .filter((c) => c.tipo === 'RETENCION')
      .reduce((s, c) => s + c.monto, 0),
  );
  // Las notas de crédito aplicadas a la factura descuentan saldo igual que un cobro.
  const credito = redondear(f.creditos.reduce((s, c) => s + c.valor, 0));
  const anuladaPorNota = credito > 0 && credito >= f.total - 0.005;
  const saldo =
    f.anulada || anuladaPorNota
      ? 0
      : Math.max(0, redondear(f.total - cobrado - retenciones - credito));
  return { cobrado, retenciones, credito, saldo, anuladaPorNota };
}

export const vencimientoDe = (f: Factura): string =>
  sumarDias(f.fechaEmision, f.plazoDias);

// Positivo: faltan N días. Negativo: lleva N días vencida.
export const diasParaVencer = (f: Factura): number =>
  diferenciaDias(HOY, vencimientoDe(f));

export function estadoDe(f: Factura): EstadoFactura {
  if (f.anulada) return 'ANULADA';
  const { cobrado, retenciones, credito, saldo, anuladaPorNota } = totalesFactura(f);
  if (anuladaPorNota) return 'ANULADA';
  if (saldo <= 0.005) return 'COBRADA';
  if (diasParaVencer(f) < 0) return 'VENCIDA';
  if (cobrado + retenciones + credito > 0) return 'PARCIAL';
  return 'PENDIENTE';
}

export type Rango = 'MES' | 'ACUMULADO';

export interface Antiguedad {
  clave: 'POR_VENCER' | 'D1_30' | 'D31_60' | 'D61_90' | 'D90_MAS';
  etiqueta: string;
  color: string;
  monto: number;
  cantidad: number;
}

export function calcularDashboard(
  facturas: Factura[],
  egresos: Egreso[],
  rango: Rango,
  notasSueltas: NotaCredito[] = [],
  devolucionAnticipo = 0,
) {
  const vigentes = facturas.filter((f) => !f.anulada);
  const hoyAnio = anioDeIso(HOY);
  const hoyMes = mesDeIso(HOY);
  const hoyDia = diaDeIso(HOY);

  const enMes = (iso: string, anio: number, mes: number) =>
    anioDeIso(iso) === anio && mesDeIso(iso) === mes;
  const enRango = (iso: string) =>
    rango === 'ACUMULADO' || enMes(iso, hoyAnio, hoyMes);

  // Ingreso: bases de las facturas menos las bases de las notas de crédito,
  // cada una en el mes de su propia emisión.
  const todasLasNotas = [...facturas.flatMap((f) => f.creditos), ...notasSueltas];
  const notasDonde = (pred: (iso: string) => boolean) =>
    redondear(
      todasLasNotas
        .filter((n) => pred(n.fechaEmision))
        .reduce((s, n) => s + n.subtotal, 0),
    );
  const facturadoDonde = (pred: (iso: string) => boolean) =>
    redondear(
      vigentes
        .filter((f) => pred(f.fechaEmision))
        .reduce((s, f) => s + f.subtotal, 0) - notasDonde(pred),
    );

  const cobrosDonde = (pred: (iso: string) => boolean, tipos: TipoCobro[]) =>
    redondear(
      vigentes
        .flatMap((f) => f.cobros)
        .filter((c) => tipos.includes(c.tipo) && pred(c.fecha))
        .reduce((s, c) => s + c.monto, 0),
    );

  const facturado = facturadoDonde(enRango);
  const notasBase = notasDonde(enRango);
  const cobrado = cobrosDonde(enRango, ['PAGO', 'ENTREGA_EQUIPOS']);
  const retenciones = cobrosDonde(enRango, ['RETENCION']);

  // "Este mes" va hasta hoy, así que se compara con el mismo tramo del mes
  // anterior (del 1 al día de hoy) y no con el mes anterior completo.
  const previo = mesAnterior(hoyAnio, hoyMes);
  const diaCorte = Math.min(hoyDia, diasDelMes(previo.anio, previo.mes));
  const enTramoPrevio = (iso: string) =>
    enMes(iso, previo.anio, previo.mes) && diaDeIso(iso) <= diaCorte;
  const tramoPrevio = `${MESES[previo.mes - 1].toLowerCase()} del 1 al ${diaCorte}`;
  const facturadoPrevio = facturadoDonde(enTramoPrevio);
  const cobradoPrevio = cobrosDonde(enTramoPrevio, ['PAGO', 'ENTREGA_EQUIPOS']);

  // Cartera: siempre "a hoy", sin importar el rango elegido.
  const conSaldo = vigentes
    .map((f) => ({ f, saldo: totalesFactura(f).saldo, dias: diasParaVencer(f) }))
    .filter((x) => x.saldo > 0.005);
  const porCobrar = redondear(conSaldo.reduce((s, x) => s + x.saldo, 0));
  const vencido = redondear(
    conSaldo.filter((x) => x.dias < 0).reduce((s, x) => s + x.saldo, 0),
  );

  const antiguedad: Antiguedad[] = [
    { clave: 'POR_VENCER', etiqueta: 'Por vencer', color: '#2f6db5', monto: 0, cantidad: 0 },
    { clave: 'D1_30', etiqueta: '1 a 30 días', color: '#d99a1b', monto: 0, cantidad: 0 },
    { clave: 'D31_60', etiqueta: '31 a 60 días', color: '#d9711b', monto: 0, cantidad: 0 },
    { clave: 'D61_90', etiqueta: '61 a 90 días', color: '#c8442f', monto: 0, cantidad: 0 },
    { clave: 'D90_MAS', etiqueta: 'Más de 90 días', color: '#8e1f1f', monto: 0, cantidad: 0 },
  ];
  for (const { saldo, dias } of conSaldo) {
    const atraso = -dias;
    const idx =
      dias >= 0 ? 0 : atraso <= 30 ? 1 : atraso <= 60 ? 2 : atraso <= 90 ? 3 : 4;
    antiguedad[idx].monto = redondear(antiguedad[idx].monto + saldo);
    antiguedad[idx].cantidad += 1;
  }

  // Últimos 6 meses, contando los cambios de año. El mes en curso está
  // incompleto: se rotula con el día hasta el que llega.
  const mesParcial = hoyDia < diasDelMes(hoyAnio, hoyMes);
  const serieMensual = Array.from({ length: 6 }, (_, i) => {
    let mes = hoyMes - 5 + i;
    let anio = hoyAnio;
    if (mes < 1) {
      mes += 12;
      anio -= 1;
    }
    const parcial = i === 5 && mesParcial;
    return {
      etiqueta: parcial ? `${MESES_CORTOS[mes - 1]} al ${hoyDia}` : MESES_CORTOS[mes - 1],
      parcial,
      facturado: facturadoDonde((iso) => enMes(iso, anio, mes)),
      cobrado: cobrosDonde((iso) => enMes(iso, anio, mes), ['PAGO', 'ENTREGA_EQUIPOS']),
    };
  });

  // Cálculo del disponible CMEE
  const ingresoNeto = facturado;
  const espe = redondear((ingresoNeto * ESPE_PCT) / 100);
  const cmee = redondear(ingresoNeto - espe);
  const egresosRango = egresos.filter(
    (e) => rango === 'ACUMULADO' || (e.mes === hoyMes && e.anio === hoyAnio),
  );
  const totalEgresos = redondear(egresosRango.reduce((s, e) => s + e.monto, 0));
  const devolucion = rango === 'ACUMULADO' ? redondear(devolucionAnticipo) : 0;
  const disponible = redondear(cmee - totalEgresos + devolucion);
  const provision = redondear((Math.max(disponible, 0) * PROVISION_PCT) / 100);
  const totalDisponible = redondear(disponible - provision);

  const egresosPorCategoria = (
    Object.keys(CATEGORIAS_EGRESO) as CategoriaEgreso[]
  )
    .map((categoria) => ({
      categoria,
      etiqueta: CATEGORIAS_EGRESO[categoria],
      monto: redondear(
        egresosRango
          .filter((e) => e.categoria === categoria)
          .reduce((s, e) => s + e.monto, 0),
      ),
    }))
    .filter((c) => c.monto > 0)
    .sort((a, b) => b.monto - a.monto);

  const atencion = conSaldo
    .filter((x) => x.dias < 0)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 5)
    .map((x) => ({ factura: x.f, saldo: x.saldo, dias: x.dias }));

  return {
    facturado,
    notasBase,
    cobrado,
    retenciones,
    porCobrar,
    vencido,
    facturadoPrevio,
    cobradoPrevio,
    tramoPrevio,
    mesParcial,
    antiguedad,
    serieMensual,
    ingresoNeto,
    espe,
    cmee,
    totalEgresos,
    devolucion,
    disponible,
    provision,
    totalDisponible,
    egresosPorCategoria,
    atencion,
    facturasVencidas: conSaldo.filter((x) => x.dias < 0).length,
  };
}
