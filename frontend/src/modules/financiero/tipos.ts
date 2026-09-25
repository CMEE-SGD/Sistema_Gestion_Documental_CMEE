export type TipoCobro = 'PAGO' | 'RETENCION' | 'ENTREGA_EQUIPOS';

export type EstadoFactura =
  | 'PENDIENTE'
  | 'PARCIAL'
  | 'COBRADA'
  | 'VENCIDA'
  | 'ANULADA';

export type CategoriaEgreso =
  | 'ADQUISICIONES'
  | 'HONORARIOS'
  | 'PASANTES'
  | 'SERVICIOS_TECNICOS'
  | 'SUMINISTROS'
  | 'VIATICOS';

export type EstadoEgreso = 'PAGADO' | 'PENDIENTE';

export type ValorRevision = 'CORRECTO' | 'CORREGIR' | 'NO_SE';

export interface Cobro {
  id: number;
  tipo: TipoCobro;
  fecha: string;
  monto: number;
  referencia?: string;
  observacion?: string;
  comprobante?: string;
}

export interface LineaFactura {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface NotaCredito {
  id: number;
  numero: string;
  claveAcceso: string;
  fechaEmision: string;
  clienteNombre: string;
  clienteRuc: string;
  facturaModificada: string;
  fechaFacturaOriginal: string;
  subtotal: number;
  iva: number;
  valor: number;
  motivo: string;
}

export interface Factura {
  id: number;
  numero: string;
  claveAcceso: string;
  numeroAutorizacion: string;
  clienteNombre: string;
  clienteRuc: string;
  fechaEmision: string;
  plazoDias: number;
  subtotal: number;
  iva: number;
  total: number;
  lineas: LineaFactura[];
  cobros: Cobro[];
  creditos: NotaCredito[];
  anulada: boolean;
  ordenTrabajo: string | null;
  ordenCompra?: string;
  ambiente: string;
  emisor: string;
  infoAdicional: Record<string, string>;
}

export interface Egreso {
  id: number;
  anio: number;
  mes: number;
  categoria: CategoriaEgreso;
  detalle: string;
  estado: EstadoEgreso;
  monto: number;
  observacion?: string;
}
