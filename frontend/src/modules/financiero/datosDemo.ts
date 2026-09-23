import type {
  CategoriaEgreso,
  Cobro,
  Egreso,
  EstadoEgreso,
  Factura,
  LineaFactura,
  NotaCredito,
  OrdenTrabajoDemo,
} from './tipos';
import { HOY, diferenciaDias, sumarDias } from './formato';
import { redondear } from './calculos';

// Todo lo de este archivo es de demostración, salvo las facturas 262 a 265 y
// la nota de crédito 010, que reproducen los XML reales del SRI que compartió
// la administradora. Esos documentos reales se cargan desde "Subir facturas".

interface ClienteDemo {
  nombre: string;
  ruc: string;
  registrado: boolean;
}

export const CLIENTES_DEMO: ClienteDemo[] = [
  { nombre: 'ALIMENTOS ANDINOS DEL NORTE S.A.', ruc: '1790451236001', registrado: true },
  { nombre: 'METALMECANICA COTOPAXI CIA. LTDA.', ruc: '0590112345001', registrado: true },
  { nombre: 'CLINICA SAN GABRIEL S.A.', ruc: '1790876543001', registrado: true },
  { nombre: 'PLASTICOS DEL PACIFICO S.A.', ruc: '0991234567001', registrado: true },
  { nombre: 'LABORATORIOS QUITO NORTE CIA. LTDA.', ruc: '1791098765001', registrado: true },
  { nombre: 'PETROQUIMICA AMAZONICA S.A.', ruc: '1790345678001', registrado: true },
  { nombre: 'TEXTILES DE LA SIERRA S.A.', ruc: '0190456789001', registrado: true },
  { nombre: 'AGROINDUSTRIAL RIO CHONE S.A.', ruc: '1391234098001', registrado: false },
  { nombre: 'UNIDAD DE MANTENIMIENTO TECNICO No. 2', ruc: '1760001230001', registrado: true },
  { nombre: 'CEMENTOS DEL CHIMBORAZO S.A.', ruc: '0690234561001', registrado: true },
  { nombre: 'FARMACEUTICA ANDES CIA. LTDA.', ruc: '1791765432001', registrado: false },
];

const SERVICIOS: Array<[string, string]> = [
  ['CALMUL101', 'CALIBRACIÓN DE MULTÍMETRO DIGITAL'],
  ['CALBAL204', 'CALIBRACIÓN DE BALANZA ANALÍTICA'],
  ['CALTER310', 'CALIBRACIÓN DE TERMÓMETRO DIGITAL'],
  ['CALMAN415', 'CALIBRACIÓN DE MANÓMETRO'],
  ['CALPIE118', 'CALIBRACIÓN DE PIE DE REY'],
  ['CALMAS522', 'CALIBRACIÓN DE MASAS PATRÓN'],
  ['CALOSC130', 'CALIBRACIÓN DE OSCILOSCOPIO'],
  ['CALTOR607', 'CALIBRACIÓN DE TORQUÍMETRO'],
];

const PRECIOS = [51.94, 55.93, 87.89, 95.88, 147.82, 191.76, 315, 383.52, 420.5, 618];

const INFO_ADICIONAL = {
  'Descripción':
    'Re facturación Beneficiario: ESPE STORE RUC: 1793211474001',
  'RUC Proveedor': '0992560754001',
};

// Generador con semilla fija: las cifras de la maqueta son siempre las mismas.
function crearAleatorio(semilla: number) {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function claveAcceso(fecha: string, secuencia: number, azar: () => number): string {
  const [y, m, d] = fecha.split('-');
  const codigo = String(Math.floor(azar() * 90000000) + 10000000);
  const verificador = Math.floor(azar() * 10);
  return `${d}${m}${y}011793211474001200100500${String(secuencia).padStart(7, '0')}${codigo}1${verificador}`;
}

function generarFacturas(): Factura[] {
  const azar = crearAleatorio(2026);
  const cantidad = 165;
  const primeraSecuencia = 97;
  const inicio = '2026-04-01';
  const amplitud = diferenciaDias(inicio, '2026-09-16');
  const offsets = Array.from({ length: cantidad }, () =>
    Math.floor(azar() * (amplitud + 1)),
  ).sort((a, b) => a - b);

  let idCobro = 1;
  return offsets.map((offset, i) => {
    const cliente = CLIENTES_DEMO[Math.floor(azar() * CLIENTES_DEMO.length)];
    const lineas: LineaFactura[] = Array.from(
      { length: azar() < 0.7 ? 1 : 2 },
      () => {
        const [codigo, descripcion] = SERVICIOS[Math.floor(azar() * SERVICIOS.length)];
        const precio = PRECIOS[Math.floor(azar() * PRECIOS.length)];
        const cant = azar() < 0.8 ? 1 : 2;
        return {
          codigo,
          descripcion,
          cantidad: cant,
          precioUnitario: precio,
          total: redondear(precio * cant),
        };
      },
    );
    const subtotal = redondear(lineas.reduce((s, l) => s + l.total, 0));
    const iva = redondear(subtotal * 0.15);
    const total = redondear(subtotal + iva);
    const fechaEmision = sumarDias(inicio, offset);
    const p = azar();
    const plazoDias = p < 0.85 ? 30 : p < 0.95 ? 60 : 90;
    const secuencia = primeraSecuencia + i;
    const anulada = i % 31 === 7;
    const edad = diferenciaDias(fechaEmision, HOY);
    const cobros: Cobro[] = [];

    if (!anulada) {
      const r = azar();
      const umbralPagada = edad > 70 ? 0.84 : edad > 30 ? 0.58 : 0.28;
      const umbralParcial = edad > 70 ? 0.92 : edad > 30 ? 0.72 : 0.35;
      const referencia = `Transferencia ${100000 + Math.floor(azar() * 900000)}`;
      if (i % 60 === 12) {
        cobros.push({
          id: idCobro++,
          tipo: 'ENTREGA_EQUIPOS',
          fecha: sumarDias(fechaEmision, 25),
          monto: total,
          observacion: 'Cancelada con equipos entregados, según acta de recepción',
        });
      } else if (r < umbralPagada) {
        const fechaPago = sumarDias(
          fechaEmision,
          Math.min(edad, 8 + Math.floor(azar() * (plazoDias + 12))),
        );
        const retencion = azar() < 0.4 ? redondear(subtotal * 0.02 + iva * 0.3) : 0;
        cobros.push({
          id: idCobro++,
          tipo: 'PAGO',
          fecha: fechaPago,
          monto: redondear(total - retencion),
          referencia,
        });
        if (retencion > 0) {
          cobros.push({
            id: idCobro++,
            tipo: 'RETENCION',
            fecha: fechaPago,
            monto: retencion,
            referencia: `Comprobante de retención ${String(secuencia).padStart(9, '0')}`,
          });
        }
      } else if (r < umbralParcial) {
        cobros.push({
          id: idCobro++,
          tipo: 'PAGO',
          fecha: sumarDias(fechaEmision, Math.min(edad, 10 + Math.floor(azar() * 30))),
          monto: redondear(total * (0.5 + azar() * 0.4)),
          referencia,
        });
      }
    }

    const fecha = fechaEmision;
    const clave = claveAcceso(fecha, secuencia, azar);
    return {
      id: i + 1,
      numero: `001-005-${String(secuencia).padStart(9, '0')}`,
      claveAcceso: clave,
      numeroAutorizacion: clave,
      clienteNombre: cliente.nombre,
      clienteRuc: cliente.ruc,
      clienteRegistrado: cliente.registrado,
      fechaEmision,
      plazoDias,
      subtotal,
      iva,
      total,
      lineas,
      cobros,
      creditos: [],
      anulada,
      ordenTrabajo: azar() < 0.65 ? String(13400 + i).padStart(7, '0') : null,
      ambiente: 'PRODUCCIÓN',
      emisor: 'ESPE STORE',
      infoAdicional: INFO_ADICIONAL,
    };
  }).map((f) => (f.numero === NUMERO_FACTURA_ANULADA_POR_NC ? facturaAnuladaPorNota(f) : f));
}

// La factura 168 es la que anula la nota de crédito real 010: misma empresa,
// mismo servicio y mismo valor que la 263, sin cobros y con plazo de 30 días.
const NUMERO_FACTURA_ANULADA_POR_NC = '001-005-000000168';

function facturaAnuladaPorNota(base: Factura): Factura {
  return {
    ...base,
    clienteNombre: 'INDURAMA ECUADOR S.A.',
    clienteRuc: '0190061264001',
    clienteRegistrado: true,
    fechaEmision: '2026-06-09',
    plazoDias: 30,
    subtotal: 148.97,
    iva: 22.35,
    total: 171.32,
    lineas: [
      {
        codigo: 'CALAAP111',
        descripcion: 'CALIBRACIÓN DE ANALIZADOR DE ESPECTRO',
        cantidad: 1,
        precioUnitario: 148.97,
        total: 148.97,
      },
    ],
    cobros: [],
    creditos: [],
    anulada: false,
    ordenTrabajo: null,
  };
}

export const FACTURAS_DEMO: Factura[] = generarFacturas();

const INFO_REAL = {
  'RUC Proveedor': '0992560754001',
};

// --- Documentos reales (XML del SRI) -----------------------------------

export const FACTURA_REAL_262: Omit<Factura, 'id'> = {
  numero: '001-005-000000262',
  claveAcceso: '1709202601179321147400120010050000002623573017719',
  numeroAutorizacion: '1709202601179321147400120010050000002623573017719',
  clienteNombre: 'IDEAL ALAMBREC S.A.',
  clienteRuc: '1790050947001',
  clienteRegistrado: true,
  fechaEmision: '2026-09-17',
  plazoDias: 30,
  subtotal: 1320,
  iva: 198,
  total: 1518,
  lineas: [
    {
      codigo: 'CALME',
      descripcion:
        'CALIBRACIÓN MEDIDOR ENERGÍA',
      cantidad: 22,
      precioUnitario: 60,
      total: 1320,
    },
  ],
  cobros: [],
  creditos: [],
  anulada: false,
  ordenTrabajo: null,
  ordenCompra: '2710382687',
  ambiente: 'PRODUCCIÓN',
  emisor: 'ESPE STORE',
  infoAdicional: {
    'Descripción': 'ORDEN DE COMPRA: 2710382687 INGRESO POR SERVICIOS Beneficiario: ESPE STORE',
    ...INFO_REAL,
  },
};

export const FACTURA_REAL_263: Omit<Factura, 'id'> = {
  numero: '001-005-000000263',
  claveAcceso: '1709202601179321147400120010050000002633573212118',
  numeroAutorizacion: '1709202601179321147400120010050000002633573212118',
  clienteNombre: 'INDURAMA ECUADOR S.A.',
  clienteRuc: '0190061264001',
  clienteRegistrado: true,
  fechaEmision: '2026-09-17',
  plazoDias: 30,
  subtotal: 148.97,
  iva: 22.35,
  total: 171.32,
  lineas: [
    {
      codigo: 'CALAAP111',
      descripcion:
        'CALIBRACIÓN DE ANALIZADOR DE ESPECTRO',
      cantidad: 1,
      precioUnitario: 148.97,
      total: 148.97,
    },
  ],
  cobros: [],
  creditos: [],
  anulada: false,
  ordenTrabajo: null,
  ambiente: 'PRODUCCIÓN',
  emisor: 'ESPE STORE',
  infoAdicional: {
    'Descripción': 'Re facturación Beneficiario: ESPE STORE',
    ...INFO_REAL,
  },
};

export const FACTURA_REAL_264: Omit<Factura, 'id'> = {
  numero: '001-005-000000264',
  claveAcceso: '2109202601179321147400120010050000002643592536511',
  numeroAutorizacion: '2109202601179321147400120010050000002643592536511',
  clienteNombre: 'PROYECTOS, CONSTRUCCIONES E INSTRUMENTACION PCI S.A',
  clienteRuc: '1793199053001',
  clienteRegistrado: false,
  fechaEmision: '2026-09-21',
  plazoDias: 30,
  subtotal: 180,
  iva: 27,
  total: 207,
  lineas: [
    {
      codigo: 'CALBMGMT84',
      descripcion:
        'MULTICALIBRADOR 725 DIGITAL EN MAG ELECTRICO-HACER CALIBRADO IN SITU EN RANGO Y METODOS ACREDITADOS POR EL SAE',
      cantidad: 1,
      precioUnitario: 180,
      total: 180,
    },
  ],
  cobros: [],
  creditos: [],
  anulada: false,
  ordenTrabajo: null,
  ambiente: 'PRODUCCIÓN',
  emisor: 'ESPE STORE',
  infoAdicional: {
    'Descripción': 'INGRESO POR SERVICIOS Beneficiario: ESPE STORE',
    ...INFO_REAL,
  },
};

export const FACTURA_REAL_265: Omit<Factura, 'id'> = {
  numero: '001-005-000000265',
  claveAcceso: '2109202601179321147400120010050000002653592556615',
  numeroAutorizacion: '2109202601179321147400120010050000002653592556615',
  clienteNombre: 'PECMANOIL CIA LTDA',
  clienteRuc: '1792096715001',
  clienteRegistrado: true,
  fechaEmision: '2026-09-21',
  plazoDias: 30,
  subtotal: 51.94,
  iva: 7.79,
  total: 59.73,
  lineas: [
    {
      codigo: 'CALHL124',
      descripcion:
        'HOROMETRO ANALOGICO-HACER CALIBRADO EN LAB EN RANGO Y METODOS ACREDITADOS POR EL SAE',
      cantidad: 1,
      precioUnitario: 51.94,
      total: 51.94,
    },
  ],
  cobros: [],
  creditos: [],
  anulada: false,
  ordenTrabajo: null,
  ambiente: 'PRODUCCIÓN',
  emisor: 'ESPE STORE',
  infoAdicional: {
    'Descripción': 'INGRESO POR SERVICIOS Beneficiario: ESPE STORE',
    ...INFO_REAL,
  },
};

export const NOTA_CREDITO_010: Omit<NotaCredito, 'id'> = {
  numero: '001-005-000000010',
  claveAcceso: '1709202604179321147400120010050000000103573145014',
  fechaEmision: '2026-09-17',
  clienteNombre: 'INDURAMA ECUADOR S.A.',
  clienteRuc: '0190061264001',
  facturaModificada: '001-005-000000168',
  fechaFacturaOriginal: '2026-06-09',
  subtotal: 148.97,
  iva: 22.35,
  valor: 171.32,
  motivo: 'Nota emitida a solicitud del cliente (Carmen Toledo - Indurama)',
};

export const ORDENES_DEMO: OrdenTrabajoDemo[] = [
  { numero: '0013734', clienteRuc: '0190061264001', clienteNombre: 'INDURAMA ECUADOR S.A.', equipos: 2, fecha: '2026-09-10' },
  { numero: '0013741', clienteRuc: '0190061264001', clienteNombre: 'INDURAMA ECUADOR S.A.', equipos: 1, fecha: '2026-09-12' },
  { numero: '0013689', clienteRuc: '0190061264001', clienteNombre: 'INDURAMA ECUADOR S.A.', equipos: 3, fecha: '2026-08-20' },
  { numero: '0013752', clienteRuc: '1791765432001', clienteNombre: 'FARMACEUTICA ANDES CIA. LTDA.', equipos: 1, fecha: '2026-09-15' },
  { numero: '0013748', clienteRuc: '1790451236001', clienteNombre: 'ALIMENTOS ANDINOS DEL NORTE S.A.', equipos: 4, fecha: '2026-09-14' },
  { numero: '0013745', clienteRuc: '1790876543001', clienteNombre: 'CLINICA SAN GABRIEL S.A.', equipos: 2, fecha: '2026-09-13' },
  { numero: '0013731', clienteRuc: '1790050947001', clienteNombre: 'IDEAL ALAMBREC S.A.', equipos: 22, fecha: '2026-09-08' },
  { numero: '0013756', clienteRuc: '1793199053001', clienteNombre: 'PROYECTOS, CONSTRUCCIONES E INSTRUMENTACION PCI S.A', equipos: 1, fecha: '2026-09-16' },
  { numero: '0013759', clienteRuc: '1792096715001', clienteNombre: 'PECMANOIL CIA LTDA', equipos: 1, fecha: '2026-09-18' },
];

let idEgreso = 1;
const egreso = (
  mes: number,
  categoria: CategoriaEgreso,
  detalle: string,
  monto: number,
  estado: EstadoEgreso = 'PAGADO',
  observacion?: string,
): Egreso => ({ id: idEgreso++, anio: 2026, mes, categoria, detalle, estado, monto, observacion });

export const EGRESOS_DEMO: Egreso[] = [
  egreso(4, 'HONORARIOS', 'Honorarios técnico de calibración 1', 1248.9),
  egreso(4, 'ADQUISICIONES', 'Multímetros patrón, anticipo del 50%', 4800),
  egreso(4, 'SUMINISTROS', 'Órdenes de trabajo impresas', 74),
  egreso(5, 'HONORARIOS', 'Honorarios técnico de calibración 1', 1248.9),
  egreso(5, 'PASANTES', 'Pasantes de mayo', 736.5),
  egreso(5, 'ADQUISICIONES', 'Renovación de dominio web', 516.48),
  egreso(5, 'VIATICOS', 'Viáticos comisión Guayaquil', 560),
  egreso(6, 'HONORARIOS', 'Honorarios técnico de calibración 1', 1248.9),
  egreso(6, 'HONORARIOS', 'Honorarios técnico de calibración 2', 1150),
  egreso(6, 'PASANTES', 'Pasantes de junio', 736.5),
  egreso(6, 'SERVICIOS_TECNICOS', 'Calibración de termómetros patrón (INEN)', 2300),
  egreso(6, 'ADQUISICIONES', 'Bloque seco, pago del 70%', 4200),
  egreso(6, 'VIATICOS', 'Viáticos comisión Cuenca', 730),
  egreso(7, 'HONORARIOS', 'Honorarios técnico de calibración 1', 1248.9),
  egreso(7, 'HONORARIOS', 'Honorarios técnico de calibración 2', 1150),
  egreso(7, 'PASANTES', 'Pasantes de julio', 736.5),
  egreso(7, 'SERVICIOS_TECNICOS', 'Calibración de presión, laboratorio externo', 3003.4),
  egreso(7, 'SERVICIOS_TECNICOS', 'Baño térmico, mantenimiento', 795.65),
  egreso(7, 'SUMINISTROS', 'Pilas y termocupla', 22.75),
  egreso(7, 'VIATICOS', 'Viáticos comisión Riobamba', 520),
  egreso(8, 'HONORARIOS', 'Honorarios técnico de calibración 1', 1248.9),
  egreso(8, 'HONORARIOS', 'Honorarios técnico de calibración 2', 1150),
  egreso(8, 'PASANTES', 'Pasantes de agosto', 736.5),
  egreso(8, 'ADQUISICIONES', 'Membresía anual de metrología', 515),
  egreso(8, 'ADQUISICIONES', 'Caja chica de agosto', 30),
  egreso(8, 'SERVICIOS_TECNICOS', 'Servicio de grúa para traslado de equipo', 34.62),
  egreso(8, 'VIATICOS', 'Viáticos comisión Ambato', 740),
  egreso(9, 'HONORARIOS', 'Honorarios técnico de calibración 1', 1248.9),
  egreso(9, 'HONORARIOS', 'Honorarios técnico de calibración 2', 1150, 'PENDIENTE', 'Aprobación del informe pendiente'),
  egreso(9, 'PASANTES', 'Pasantes de septiembre', 736.5, 'PENDIENTE'),
  egreso(9, 'ADQUISICIONES', 'Bloque seco, saldo del 30%', 1800, 'PENDIENTE', 'En proceso de pago'),
  egreso(9, 'ADQUISICIONES', 'Internet dedicado', 235.75, 'PENDIENTE', 'En proceso de instalación'),
  egreso(9, 'ADQUISICIONES', 'Caja chica de septiembre', 50, 'PENDIENTE'),
  egreso(9, 'SUMINISTROS', 'Cargador y tarjeta SIM', 12),
  egreso(9, 'VIATICOS', 'Viáticos comisión Loja', 150, 'PENDIENTE', 'En proceso de pago'),
];
