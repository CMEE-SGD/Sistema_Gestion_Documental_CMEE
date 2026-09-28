import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { EstadoFactura, EstadoProforma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateProformaDto } from './dto/create-proforma.dto';
import { UpdateProformaDto } from './dto/update-proforma.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { RegistrarCompensacionDto } from './dto/registrar-compensacion.dto';
import { ResolverAutorizacionCompensacionDto } from './dto/resolver-autorizacion-compensacion.dto';
import { CreateNotaEntregaDto } from './dto/create-nota-entrega.dto';

const CLIENTE_SELECT = {
  select: {
    id: true,
    nombre: true,
    ruc: true,
    representante: true,
    telefono: true,
    email: true,
  },
};

const FACTURA_INCLUDE = {
  cliente: CLIENTE_SELECT,
  orden_trabajo: {
    select: {
      id: true,
      orden_trabajo_fisica: true,
      fecha_ingreso: true,
      proforma_id: true,
      n_proforma: true,
    },
  },
  detalle: {
    include: {
      equipo_recepcion: {
        select: { id: true, equipo_descripcion: true, codigo_serie: true },
      },
    },
  },
  pagos: {
    include: {
      registrado_por: { select: { id: true, nombre: true, apellidos: true } },
      compensacion: true,
    },
    orderBy: { fecha: 'desc' as const },
  },
  notas_entrega: {
    include: {
      entregado_por: { select: { id: true, nombre: true, apellidos: true } },
    },
    orderBy: { id: 'desc' as const },
  },
  compensaciones: true,
  solicitudes_compensacion: {
    include: {
      solicitado_por: { select: { id: true, nombre: true, apellidos: true } },
      resuelto_por: { select: { id: true, nombre: true, apellidos: true } },
    },
    orderBy: { id: 'desc' as const },
  },
};

const PROFORMA_INCLUDE = {
  cliente: CLIENTE_SELECT,
  ordenes_trabajo: {
    select: { id: true, orden_trabajo_fisica: true, fecha_ingreso: true },
  },
};

@Injectable()
export class FacturacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  // ------------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------------

  private toDate(value?: string): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  /**
   * Valida que una orden de trabajo pueda facturarse: debe existir y TODOS sus
   * equipos deben estar en FINALIZADO. Devuelve la orden con sus equipos.
   */
  private async validarOrdenFacturable(ordenId: number) {
    const orden = await this.prisma.ordenTrabajo.findUnique({
      where: { id: ordenId },
      include: {
        equipos: { select: { id: true, estado: true, equipo_descripcion: true } },
        cliente: { select: { id: true, nombre: true } },
      },
    });
    if (!orden) {
      throw new NotFoundException(`Orden de trabajo ${ordenId} no encontrada`);
    }
    if (orden.equipos.length === 0) {
      throw new BadRequestException(
        `La orden ${orden.orden_trabajo_fisica} no tiene equipos registrados.`,
      );
    }
    const incompletos = orden.equipos.filter((e) => e.estado !== 'FINALIZADO');
    if (incompletos.length > 0) {
      const nombres = incompletos
        .slice(0, 3)
        .map((e) => `"${e.equipo_descripcion}" (${e.estado})`)
        .join(', ');
      const restantes =
        incompletos.length > 3
          ? ` y ${incompletos.length - 3} más`
          : '';
      throw new BadRequestException(
        `La factura se habilita cuando todos los equipos de la orden ${orden.orden_trabajo_fisica} estén FINALIZADO. Pendientes: ${nombres}${restantes}.`,
      );
    }
    return orden;
  }

  private n(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private esMismoDia(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  /** Subtotal/IVA/total vienen como DECIMAL de Prisma → number para JSON. */
  private enriquecer(f: any) {
    const pagado = (f.pagos ?? []).reduce(
      (s: number, p: any) => s + this.n(p.monto),
      0,
    );
    const total = this.n(f.total);
    const saldo = total - pagado;

    // Última solicitud de autorización de compensación (si existe).
    const { solicitudes_compensacion, ...resto } = f;
    const solicitudCompensacion = Array.isArray(solicitudes_compensacion)
      ? (solicitudes_compensacion[0] ?? null)
      : null;

    let estado: EstadoFactura = f.estado;
    if (estado !== 'ANULADA') {
      if (saldo <= 0.005) estado = 'PAGADA';
      else if (pagado > 0) estado = 'PARCIAL';
      else estado = 'EMITIDA';
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const venc = new Date(f.fecha_vencimiento);
    venc.setHours(0, 0, 0, 0);
    const dias = Math.round(
      (venc.getTime() - hoy.getTime()) / 86400000,
    );

    return {
      ...resto,
      subtotal: this.n(f.subtotal),
      iva: this.n(f.iva),
      total,
      pagado,
      saldo,
      estado,
      solicitud_compensacion: solicitudCompensacion
        ? {
            id: solicitudCompensacion.id,
            estado: solicitudCompensacion.estado,
            observaciones: solicitudCompensacion.observaciones,
            resuelto_at: solicitudCompensacion.resuelto_at,
            createdAt: solicitudCompensacion.created_at,
            solicitado_por: solicitudCompensacion.solicitado_por,
            resuelto_por: solicitudCompensacion.resuelto_por,
          }
        : null,
      estado_cartera:
        estado !== 'ANULADA' && saldo > 0.005
          ? dias < 0
            ? 'VENCIDA'
            : 'POR_VENCER'
          : 'OK',
      dias_vencida: dias < 0 ? Math.abs(dias) : 0,
      dias_restantes: dias >= 0 ? dias : 0,
    };
  }

  /** Genera numeración propia: PF-<año>-NNNN, FAC-<año>-NNNN, NE-<año>-NNNN. */
  private async generarNumeroSecuencia(
    tipo: 'proforma' | 'factura' | 'nota_entrega',
  ): Promise<string> {
    const anio = new Date().getFullYear();
    let prefijo = '';
    let buscar: () => Promise<{ numero: string } | null>;

    if (tipo === 'proforma') {
      prefijo = `PF-${anio}-`;
      buscar = () =>
        this.prisma.proforma.findFirst({
          where: { numero: { startsWith: prefijo } },
          orderBy: { numero: 'desc' },
          select: { numero: true },
        });
    } else if (tipo === 'factura') {
      prefijo = `FAC-${anio}-`;
      buscar = () =>
        this.prisma.factura.findFirst({
          where: { numero: { startsWith: prefijo } },
          orderBy: { numero: 'desc' },
          select: { numero: true },
        });
    } else {
      prefijo = `NE-${anio}-`;
      buscar = () =>
        this.prisma.notaEntrega.findFirst({
          where: { numero: { startsWith: prefijo } },
          orderBy: { numero: 'desc' },
          select: { numero: true },
        });
    }

    const ultimo = await buscar();
    let n = 1;
    if (ultimo) {
      const partes = ultimo.numero.split('-');
      n = parseInt(partes[partes.length - 1] ?? '0', 10) + 1;
    }
    return `${prefijo}${String(n).padStart(4, '0')}`;
  }

  /** Reintenta el create cuando el número generado choca (carrera). */
  private async crearConNumeroUnico<T>(
    generar: () => Promise<string>,
    crear: (numero: string) => Promise<T>,
  ): Promise<T> {
    for (let intento = 0; intento < 5; intento++) {
      try {
        return await crear(await generar());
      } catch (error: any) {
        if (error?.code === 'P2002') continue;
        throw error;
      }
    }
    throw new BadRequestException(
      'No se pudo asignar un número único. Intente de nuevo.',
    );
  }

  /** Guarda un archivo en uploads/financiero/<carpeta>/<subcarpeta>/ */
  private guardarArchivo(
    file: Express.Multer.File,
    subcarpeta: string,
    prefijo: string,
  ): { ruta: string; original: string } {
    const dir = path.join('.', 'uploads', 'financiero', subcarpeta);
    fs.mkdirSync(dir, { recursive: true });
    const ext = path.extname(file.originalname || '.bin');
    const nombre = `${prefijo}-${Date.now()}${ext}`;
    fs.writeFileSync(path.join(dir, nombre), file.buffer);
    return {
      ruta: `/uploads/financiero/${subcarpeta}/${nombre}`,
      original: file.originalname,
    };
  }

  // ------------------------------------------------------------------
  // PROFORMAS
  // ------------------------------------------------------------------

  async createProforma(dto: CreateProformaDto) {
    const cliente = await this.prisma.clienteInstitucional.findUnique({
      where: { id: dto.cliente_id },
    });
    if (!cliente) throw new NotFoundException('Cliente institucional no encontrado');

    return this.crearConNumeroUnico(
      async () => dto.numero ?? (await this.generarNumeroSecuencia('proforma')),
      async (numero) =>
        this.prisma.proforma.create({
          data: {
            numero,
            cliente_id: dto.cliente_id,
            fecha_emision: this.toDate(dto.fecha_emision) ?? new Date(),
            monto: dto.monto,
            // Toda proforma nace EMITIDA; recién al vincularse a una orden de
            // trabajo pasa a ACEPTADA (ver recepcion-equipos.service.ts).
            estado: EstadoProforma.EMITIDA,
            observaciones: dto.observaciones,
          },
          include: PROFORMA_INCLUDE,
        }),
    );
  }

  async findAllProformas() {
    const proformas = await this.prisma.proforma.findMany({
      include: PROFORMA_INCLUDE,
      orderBy: { fecha_emision: 'desc' },
    });
    return proformas.map((p) => ({ ...p, monto: this.n(p.monto) }));
  }

  async findOneProforma(id: number) {
    const proforma = await this.prisma.proforma.findUnique({
      where: { id },
      include: PROFORMA_INCLUDE,
    });
    if (!proforma) throw new NotFoundException(`Proforma ${id} no encontrada`);
    return { ...proforma, monto: this.n(proforma.monto) };
  }

  /**
   * Datos mínimos de una orden de trabajo para el flujo de facturación:
   * número físico, cliente y equipos. Lo consume el módulo financiero para
   * precargar el alta/importación de la factura de una orden finalizada —
   * no requiere acceso al módulo 'Recepcion Equipos'.
   */
  async findOrdenParaFactura(id: number) {
    const orden = await this.prisma.ordenTrabajo.findUnique({
      where: { id },
      select: {
        id: true,
        orden_trabajo_fisica: true,
        n_proforma: true,
        cliente: { select: { id: true, nombre: true } },
        equipos: {
          select: { id: true, equipo_descripcion: true, estado: true },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!orden) throw new NotFoundException(`Orden de trabajo ${id} no encontrada`);
    return orden;
  }

  async updateProforma(id: number, dto: UpdateProformaDto) {
    await this.findOneProforma(id);
    return this.prisma.proforma.update({
      where: { id },
      data: {
        numero: dto.numero,
        fecha_emision: this.toDate(dto.fecha_emision),
        monto: dto.monto,
        estado: dto.estado,
        observaciones: dto.observaciones,
      },
      include: PROFORMA_INCLUDE,
    });
  }

  async removeProforma(id: number) {
    await this.findOneProforma(id);
    // Desvincula las órdenes que la referenciaban (n_proforma queda como texto)
    await this.prisma.ordenTrabajo.updateMany({
      where: { proforma_id: id },
      data: { proforma_id: null },
    });
    await this.prisma.proforma.delete({ where: { id } });
    return { id };
  }

  // ------------------------------------------------------------------
  // FACTURAS
  // ------------------------------------------------------------------

  async findAllFacturas() {
    const facturas = await this.prisma.factura.findMany({
      include: {
        cliente: CLIENTE_SELECT,
        pagos: { select: { monto: true } },
      },
      orderBy: { fecha_emision: 'desc' },
    });
    return facturas.map((f) => this.enriquecer(f));
  }

  async findOneFactura(id: number) {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      include: FACTURA_INCLUDE,
    });
    if (!factura) throw new NotFoundException(`Factura ${id} no encontrada`);
    return this.enriquecer(factura);
  }

  async createFactura(dto: CreateFacturaDto) {
    const cliente = await this.prisma.clienteInstitucional.findUnique({
      where: { id: dto.cliente_id },
    });
    if (!cliente) throw new NotFoundException('Cliente institucional no encontrado');

    // Si la factura nace de una orden, ésta debe tener TODOS sus equipos FINALIZADO.
    let ordenId: number | undefined;
    if (dto.orden_trabajo_id !== undefined) {
      const orden = await this.validarOrdenFacturable(dto.orden_trabajo_id);
      ordenId = orden.id;
    }

    const detalle = (dto.detalle ?? []).map((d) => ({
      concepto: d.concepto,
      cantidad: d.cantidad ?? 1,
      precio_unitario: d.precio_unitario ?? 0,
      valor_total:
        d.valor_total ?? (d.precio_unitario ?? 0) * (d.cantidad ?? 1),
      equipo_recepcion_id: d.equipo_recepcion_id,
    }));

    const subtotal = dto.subtotal ?? detalle.reduce((s, d) => s + d.valor_total, 0);
    const iva = dto.iva ?? 0;
    const total = dto.total ?? subtotal + iva;
    const fechaEmision = this.toDate(dto.fecha_emision) ?? new Date();
    const plazo = dto.plazo_dias ?? 30;
    const vencimiento = new Date(fechaEmision);
    vencimiento.setDate(vencimiento.getDate() + plazo);

    return this.crearConNumeroUnico(
      async () => dto.numero ?? (await this.generarNumeroSecuencia('factura')),
      async (numero) => {
        const factura = await this.prisma.factura.create({
          data: {
            numero,
            clave_acceso: dto.clave_acceso || null,
            cliente_id: dto.cliente_id,
            orden_trabajo_id: ordenId ?? null,
            fecha_emision: fechaEmision,
            subtotal,
            iva,
            total,
            plazo_dias: plazo,
            fecha_vencimiento: vencimiento,
            notas: dto.notas,
            detalle: { create: detalle },
          },
          include: FACTURA_INCLUDE,
        });
        return this.enriquecer(factura);
      },
    );
  }

  /**
   * Fase B: la encargada del sistema financiero emite la factura en su propio
   * sistema; aquí SOLO se absorbe el XML (SRI) y se guardan los datos.
   */
  async importarXml(
    dto: { cliente_id: number; plazo_dias?: number; orden_trabajo_id?: number },
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Debe adjuntar el archivo XML de la factura');

    const xmlText = file.buffer.toString('utf-8');
    const datos = this.parsearXmlSRI(xmlText);

    const cliente = await this.prisma.clienteInstitucional.findUnique({
      where: { id: dto.cliente_id },
    });
    if (!cliente) throw new NotFoundException('Cliente institucional no encontrado');

    // Si la factura nace de una orden, ésta debe tener TODOS sus equipos FINALIZADO.
    let ordenId: number | undefined;
    if (dto.orden_trabajo_id !== undefined) {
      const orden = await this.validarOrdenFacturable(dto.orden_trabajo_id);
      ordenId = orden.id;
    }

    const existente = await this.prisma.factura.findUnique({
      where: { numero: datos.numero },
    });
    if (existente) {
      throw new BadRequestException(
        `Ya existe una factura registrada con el número ${datos.numero}.`,
      );
    }
    const conClave = datos.clave_acceso
      ? await this.prisma.factura.findUnique({
          where: { clave_acceso: datos.clave_acceso },
        })
      : null;
    if (conClave) {
      throw new BadRequestException(
        'Esa clave de acceso ya está registrada en otra factura.',
      );
    }

    const fechaEmision = datos.fecha_emision;
    const plazo = dto.plazo_dias ?? datos.plazo_sugerido ?? 30;
    const vencimiento = new Date(fechaEmision);
    vencimiento.setDate(vencimiento.getDate() + plazo);

    const guardado = this.guardarArchivo(file, 'facturas', datos.numero);

    const factura = await this.prisma.factura.create({
      data: {
        numero: datos.numero,
        clave_acceso: datos.clave_acceso,
        ruta_xml: guardado.ruta,
        nombre_original_xml: guardado.original,
        numero_autorizacion: datos.numero_autorizacion ?? null,
        fecha_autorizacion: datos.fecha_autorizacion ?? null,
        ambiente: datos.ambiente ?? null,
        info_adicional:
          datos.info_adicional && Object.keys(datos.info_adicional).length > 0
            ? datos.info_adicional
            : undefined,
        cliente_id: dto.cliente_id,
        orden_trabajo_id: ordenId ?? null,
        razon_social_cliente: datos.razon_social_cliente,
        ruc_cliente: datos.ruc_cliente,
        fecha_emision: fechaEmision,
        subtotal: datos.subtotal,
        iva: datos.iva,
        total: datos.total,
        plazo_dias: plazo,
        fecha_vencimiento: vencimiento,
        detalle: {
          create: datos.detalle.map((d) => ({
            concepto: d.concepto,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            valor_total: d.valor_total,
          })),
        },
      },
      include: FACTURA_INCLUDE,
    });
    return this.enriquecer(factura);
  }

  async updateFactura(id: number, dto: UpdateFacturaDto) {
    await this.findOneFactura(id);
    const data: any = {
      estado: dto.estado,
      notas: dto.notas,
    };
    if (dto.plazo_dias !== undefined) {
      const actual = await this.prisma.factura.findUnique({
        where: { id },
        select: { fecha_emision: true },
      });
      const venc = new Date(actual!.fecha_emision);
      venc.setDate(venc.getDate() + dto.plazo_dias);
      data.plazo_dias = dto.plazo_dias;
      data.fecha_vencimiento = venc;
    }
    await this.prisma.factura.update({ where: { id }, data });
    return this.findOneFactura(id);
  }

  async removeFactura(id: number) {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      select: { id: true, ruta_xml: true },
    });
    if (!factura) throw new NotFoundException(`Factura ${id} no encontrada`);

    await this.prisma.$transaction([
      this.prisma.pago.deleteMany({ where: { factura_id: id } }),
      this.prisma.notaEntrega.deleteMany({ where: { factura_id: id } }),
      this.prisma.compensacion.deleteMany({ where: { factura_id: id } }),
      this.prisma.facturaDetalle.deleteMany({ where: { factura_id: id } }),
      this.prisma.factura.delete({ where: { id } }),
    ]);

    if (factura.ruta_xml) {
      try {
        const abs = path.join('.', factura.ruta_xml.replace(/^\/uploads\//, 'uploads'));
        fs.rmSync(abs, { force: true });
      } catch {
        // eliminar el archivo es best-effort
      }
    }
    return { id };
  }

  // ------------------------------------------------------------------
  // NOTA DE ENTREGA
  // ------------------------------------------------------------------

  async crearNotaEntrega(
    facturaId: number,
    dto: CreateNotaEntregaDto,
    personaId: number | null,
  ) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
    });
    if (!factura) throw new NotFoundException(`Factura ${facturaId} no encontrada`);

    const nota = await this.crearConNumeroUnico(
      async () => this.generarNumeroSecuencia('nota_entrega'),
      async (numero) =>
        this.prisma.notaEntrega.create({
          data: {
            numero,
            factura_id: facturaId,
            entregado_por_id: personaId ?? undefined,
            recibido_por: dto.recibido_por,
            fecha_entrega: this.toDate(dto.fecha_entrega),
            observaciones: dto.observaciones,
          },
        }),
    );
    return nota;
  }

  // ------------------------------------------------------------------
  // COBROS: pagos y compensación
  // ------------------------------------------------------------------

  private async obtenerSaldo(facturaId: number) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      include: { pagos: { select: { monto: true } } },
    });
    if (!factura) throw new NotFoundException(`Factura ${facturaId} no encontrada`);
    if (factura.estado === 'ANULADA') {
      throw new BadRequestException('No se puede registrar cobros en una factura anulada');
    }
    const pagado = (factura.pagos ?? []).reduce(
      (s, p) => s + this.n(p.monto),
      0,
    );
    const total = this.n(factura.total);
    return { factura, pagado, saldo: total - pagado };
  }

  private async actualizarEstadoPorSaldo(facturaId: number) {
    const { pagado, saldo } = await this.obtenerSaldo(facturaId);
    const estado: EstadoFactura = saldo <= 0.005 ? 'PAGADA' : 'PARCIAL';
    await this.prisma.factura.update({
      where: { id: facturaId },
      data: { estado },
    });
    return { pagado, saldo, estado };
  }

  async registrarPago(
    facturaId: number,
    dto: RegistrarPagoDto,
    file: Express.Multer.File | undefined,
    personaId: number | null,
  ) {
    const { saldo } = await this.obtenerSaldo(facturaId);
    if (dto.monto > saldo + 0.005) {
      throw new BadRequestException(
        `El monto (${dto.monto}) excede el saldo pendiente (${saldo.toFixed(2)}).`,
      );
    }

    const archivo = file
      ? this.guardarArchivo(file, 'pagos', `F${facturaId}`)
      : null;

    await this.prisma.pago.create({
      data: {
        factura_id: facturaId,
        monto: dto.monto,
        fecha: this.toDate(dto.fecha) ?? new Date(),
        metodo: dto.metodo,
        referencia: dto.referencia,
        compensacion_id: dto.compensacion_id,
        observaciones: dto.observaciones,
        ruta_comprobante: archivo?.ruta,
        nombre_original_comprobante: archivo?.original,
        registrado_por_id: personaId ?? undefined,
      },
    });

    const { estado } = await this.actualizarEstadoPorSaldo(facturaId);
    void estado;
    return this.findOneFactura(facturaId);
  }

  /**
   * Fase C: cancelación por entrega de equipos. Registra la compensación y
   * genera automáticamente un pago con método COMPENSACION por el valor
   * acordado (descuento_autorizado) o el saldo pendiente si no se especifica.
   */
  async registrarCompensacion(
    facturaId: number,
    dto: RegistrarCompensacionDto,
    files: { factura_compra?: Express.Multer.File[]; acta?: Express.Multer.File[] },
    personaId: number | null,
  ) {
    const { saldo } = await this.obtenerSaldo(facturaId);
    const monto = dto.descuento_autorizado ?? saldo;
    if (monto > saldo + 0.005) {
      throw new BadRequestException(
        `El valor de la compensación (${monto}) excede el saldo pendiente (${saldo.toFixed(2)}).`,
      );
    }

    const dirBase = path.join('.', 'uploads', 'financiero', 'compensaciones');
    fs.mkdirSync(dirBase, { recursive: true });

    const guardar = (file?: Express.Multer.File, prefijo?: string) => {
      if (!file) return null;
      const ext = path.extname(file.originalname || '.bin');
      const nombre = `${facturaId}-${prefijo ?? 'archivo'}-${Date.now()}${ext}`;
      fs.writeFileSync(path.join(dirBase, nombre), file.buffer);
      return `/uploads/financiero/compensaciones/${nombre}`;
    };

    const compensacion = await this.prisma.compensacion.create({
      data: {
        factura_id: facturaId,
        descripcion_equipo: dto.descripcion_equipo,
        autorizacion_previa: dto.autorizacion_previa ?? false,
        ruta_factura_compra: guardar(files?.factura_compra?.[0], 'factura-compra'),
        ruta_acta: guardar(files?.acta?.[0], 'acta'),
        descuento_autorizado: dto.descuento_autorizado,
        observaciones: dto.observaciones,
      },
    });

    await this.prisma.pago.create({
      data: {
        factura_id: facturaId,
        monto,
        metodo: 'COMPENSACION',
        compensacion_id: compensacion.id,
        observaciones: 'Cancelación por entrega de equipos',
        registrado_por_id: personaId ?? undefined,
      },
    });

    await this.actualizarEstadoPorSaldo(facturaId);
    return this.findOneFactura(facturaId);
  }

  // ------------------------------------------------------------------
  // AUTORIZACIÓN DE COMPENSACIONES (por el Director)
  // ------------------------------------------------------------------

  /** Puestos cuyo nombre contiene "director" → destinatarios de las notificaciones. */
  private async personasDirector() {
    const puestos = await this.prisma.personaPuesto.findMany({
      where: {
        activo: true,
        puesto: { nombre: { contains: 'director', mode: 'insensitive' } },
      },
      select: { persona_id: true },
    });
    return [...new Set(puestos.map((p) => p.persona_id))];
  }

  /**
   * El usuario financiero solicita al Director la autorización para registrar
   * una compensación. Crea la solicitud PENDIENTE y notifica a todos los
   * directores activos para que la aprueben desde el detalle de la factura.
   */
  async solicitarAutorizacionCompensacion(facturaId: number, userId: number) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      select: { id: true, numero: true, estado: true },
    });
    if (!factura) {
      throw new NotFoundException(`Factura ${facturaId} no encontrada`);
    }
    if (factura.estado === 'ANULADA') {
      throw new BadRequestException(
        'No se puede solicitar autorización para una factura anulada.',
      );
    }

    const ultima = await this.prisma.solicitudCompensacion.findFirst({
      where: { factura_id: facturaId },
      orderBy: { id: 'desc' },
    });
    if (ultima?.estado === 'PENDIENTE') {
      throw new BadRequestException(
        'Ya existe una solicitud de autorización pendiente para esta factura.',
      );
    }
    if (ultima?.estado === 'APROBADA') {
      throw new BadRequestException(
        'La compensación de esta factura ya fue autorizada por el Director.',
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { persona_id: true },
    });

    const solicitud = await this.prisma.solicitudCompensacion.create({
      data: {
        factura_id: facturaId,
        solicitado_por_id: usuario?.persona_id ?? null,
        estado: 'PENDIENTE',
      },
      include: {
        solicitado_por: { select: { id: true, nombre: true, apellidos: true } },
      },
    });

    const mensaje = `Solicitud de autorización para compensar la factura ${factura.numero} (entrega de equipos). Apruebe o rechace desde el detalle de la factura.`;
    for (const personaId of await this.personasDirector()) {
      await this.notificaciones.crear(
        'compensacion_autorizacion',
        mensaje,
        personaId,
        factura.id,
      );
    }

    return solicitud;
  }

  /**
   * El Director aprueba o rechaza la solicitud pendiente. Solo pueden resolver
   * los usuarios cuyo puesto contenga "director" (o el usuario administrador).
   * Al resolver se notifica al solicitante: si es APROBADA, el formulario de
   * compensación queda habilitado en el detalle de la factura.
   */
  async autorizarCompensacion(
    facturaId: number,
    userId: number,
    isGod: boolean,
    dto: ResolverAutorizacionCompensacionDto,
  ) {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      select: { id: true, numero: true },
    });
    if (!factura) {
      throw new NotFoundException(`Factura ${facturaId} no encontrada`);
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        persona: {
          select: {
            id: true,
            puestos: {
              where: { activo: true },
              orderBy: { orden_puesto: 'asc' },
              take: 1,
              include: { puesto: { select: { nombre: true } } },
            },
          },
        },
      },
    });

    const puesto =
      usuario?.persona?.puestos?.[0]?.puesto?.nombre?.toLowerCase() ?? '';
    const esDirector = puesto.includes('director');
    if (!isGod && !esDirector) {
      throw new ForbiddenException(
        'Solo el Director puede autorizar compensaciones.',
      );
    }

    const solicitud = await this.prisma.solicitudCompensacion.findFirst({
      where: { factura_id: facturaId, estado: 'PENDIENTE' },
      orderBy: { id: 'desc' },
    });
    if (!solicitud) {
      throw new BadRequestException(
        'No hay una solicitud de autorización pendiente para esta factura.',
      );
    }

    const resuelta = await this.prisma.solicitudCompensacion.update({
      where: { id: solicitud.id },
      data: {
        estado: dto.estado,
        observaciones: dto.observaciones ?? null,
        resuelto_por_id: usuario?.persona?.id ?? null,
        resuelto_at: new Date(),
      },
    });

    if (solicitud.solicitado_por_id) {
      const mensaje =
        dto.estado === 'APROBADA'
          ? `La compensación de la factura ${factura.numero} fue APROBADA por el Director. Ya puede registrarla.`
          : `La solicitud de compensación de la factura ${factura.numero} fue RECHAZADA${
              dto.observaciones ? ` — Motivo: "${dto.observaciones}"` : ''
            }.`;
      await this.notificaciones.crear(
        dto.estado === 'APROBADA'
          ? 'compensacion_autorizada'
          : 'compensacion_rechazada',
        mensaje,
        solicitud.solicitado_por_id,
        factura.id,
      );
    }

    return resuelta;
  }

  // ------------------------------------------------------------------
  // CARTERA (por vencer / vencida)
  // ------------------------------------------------------------------

  async cartera() {
    const facturas = await this.prisma.factura.findMany({
      where: { NOT: { estado: 'ANULADA' } },
      include: {
        cliente: CLIENTE_SELECT,
        pagos: { select: { monto: true } },
      },
      orderBy: { fecha_vencimiento: 'asc' },
    });

    const items = facturas.map((f) => this.enriquecer(f));
    const vencida = items.filter((i) => i.estado_cartera === 'VENCIDA');
    const porVencer = items.filter((i) => i.estado_cartera === 'POR_VENCER');

    return {
      vencida,
      por_vencer: porVencer,
      total_vencida: vencida.reduce((s, i) => s + i.saldo, 0),
      total_por_vencer: porVencer.reduce((s, i) => s + i.saldo, 0),
      conteo_vencida: vencida.length,
      conteo_por_vencer: porVencer.length,
    };
  }

  // ------------------------------------------------------------------
  // FASE D — alertas de próxima calibración
  // ------------------------------------------------------------------

  async proximasCalibraciones(horizonte?: number) {
    const h = horizonte ?? 90;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + h);

    const equipos = await this.prisma.equipoRecepcion.findMany({
      where: {
        fecha_proxima_calibracion: { not: null, lte: limite },
      },
      include: {
        orden_trabajo: {
          select: {
            id: true,
            orden_trabajo_fisica: true,
            cliente: { select: { id: true, nombre: true } },
          },
        },
        laboratorio: { select: { id: true, nombre: true } },
        tecnico: { select: { id: true, nombre: true, apellidos: true } },
        certificados: {
          select: { id: true, numero_certificado: true },
          orderBy: { id: 'desc' as const },
          take: 1,
        },
      },
      orderBy: { fecha_proxima_calibracion: 'asc' as const },
    });

    return equipos.map((e) => {
      const venc = new Date(e.fecha_proxima_calibracion!);
      venc.setHours(0, 0, 0, 0);
      const dias = Math.round(
        (venc.getTime() - hoy.getTime()) / 86400000,
      );
      return {
        ...e,
        dias_restantes: dias,
        estado_calibracion: dias < 0 ? 'VENCIDA' : 'PROXIMA',
      };
    });
  }

  /**
   * Genera notificaciones a los responsables de servicio al cliente para los
   * equipos con calibración vencida o que vence en los próximos 30 días.
   */
  async notificarProximasCalibraciones() {
    const alertas = await this.proximasCalibraciones(30);
    const relevantes = alertas.filter((a) => a.dias_restantes <= 30);
    if (relevantes.length === 0) return { notificadas: 0, total: 0 };

    const asignaciones = await this.prisma.personaPuesto.findMany({
      where: {
        activo: true,
        puesto: {
          nombre: { contains: 'responsable servicio al cliente', mode: 'insensitive' },
        },
      },
      select: { persona_id: true },
    });
    const personaIds = [...new Set(asignaciones.map((a) => a.persona_id))];
    if (personaIds.length === 0) return { notificadas: 0, total: relevantes.length };

    let notificadas = 0;
    for (const eq of relevantes) {
      const cliente = eq.orden_trabajo?.cliente?.nombre ?? '';
      const mensaje =
        eq.dias_restantes < 0
          ? `El equipo "${eq.equipo_descripcion}" (${cliente}) tiene la calibración VENCIDA desde hace ${Math.abs(eq.dias_restantes)} días.`
          : `El equipo "${eq.equipo_descripcion}" (${cliente}) vence su calibración en ${eq.dias_restantes} día(s).`;
      for (const personaId of personaIds) {
        try {
          await this.notificaciones.crear(
            'calibracion_proxima',
            mensaje,
            personaId,
            eq.id,
          );
          notificadas++;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('No se pudo notificar próxima calibración:', error);
        }
      }
    }
    return { notificadas, total: relevantes.length };
  }

  // ------------------------------------------------------------------
  // Parser XML SRI (factura electrónica del sistema financiero)
  // ------------------------------------------------------------------

  private nDesdeString(v: any, def: number): number {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : def;
  }

  /** Fecha SRI dd/MM/yyyy → Date. */
  private parseFechaSRI(s: any): Date {
    if (!s) return new Date();
    const [dd, mm, yyyy] = String(s)
      .split('/')
      .map((x) => parseInt(x, 10));
    const d = new Date(yyyy || 1970, (mm || 1) - 1, dd || 1);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  private parsearXmlSRI(xmlText: string) {
    const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false });
    let raiz: any;
    try {
      raiz = parser.parse(xmlText);
    } catch {
      throw new BadRequestException('El archivo no es un XML válido.');
    }

    // Estructura real con la que se trabaja (SRI):
    //   <autorizacion>
    //     <estado>AUTORIZADO</estado>
    //     <numeroAutorizacion>…</numeroAutorizacion>
    //     <fechaAutorizacion>…</fechaAutorizacion>
    //     <ambiente>PRODUCCIÓN</ambiente>
    //     <comprobante><![CDATA[ <factura …>…</factura> ]]></comprobante>
    //     <mensajes/>
    //   </autorizacion>
    const autorizacion = raiz?.autorizacion ?? null;

    let factura: any = null;
    let informacionAutorizacion: {
      numero: string | null;
      fecha: Date | null;
      ambiente: string | null;
    } = { numero: null, fecha: null, ambiente: null };

    if (autorizacion) {
      informacionAutorizacion = {
        numero: autorizacion.numeroAutorizacion ?? null,
        fecha: autorizacion.fechaAutorizacion
          ? new Date(String(autorizacion.fechaAutorizacion).replace(' ', 'T'))
          : null,
        ambiente: autorizacion.ambiente ?? null,
      };

      const comprobanteStr: unknown = autorizacion.comprobante;
      if (typeof comprobanteStr !== 'string' || !comprobanteStr.trim()) {
        throw new BadRequestException(
          'El XML de autorización no contiene el comprobante (CDATA).',
        );
      }

      // El comprobante viaja como texto CDATA: se re-parsea para obtener la
      // factura. Con ignoreAttributes:false se capturan también los atributos
      // (p. ej. campoAdicional nombre="…").
      try {
        const nodo = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          parseTagValue: false,
        }).parse(comprobanteStr);
        factura = nodo?.factura ?? nodo?.comprobante ?? null;
      } catch {
        throw new BadRequestException(
          'El comprobante dentro del XML no es un XML válido.',
        );
      }
    } else {
      // Compatibilidad: XML de la factura directo (sin envoltorio).
      factura = raiz?.factura ?? raiz?.comprobante ?? null;
    }

    if (!factura?.infoTributaria || !factura?.infoFactura) {
      throw new BadRequestException(
        'El XML no parece ser una factura electrónica válida (faltan infoTributaria/infoFactura).',
      );
    }

    const it: any = factura.infoTributaria;
    const inf: any = factura.infoFactura;

    const numero = [
      String(it.estab ?? '').padStart(3, '0'),
      String(it.ptoEmi ?? '').padStart(3, '0'),
      String(it.secuencial ?? '').padStart(9, '0'),
    ].join('-');

    const totalImpuestos = Array.isArray(inf?.totalConImpuestos?.totalImpuesto)
      ? inf.totalConImpuestos.totalImpuesto
      : inf?.totalConImpuestos?.totalImpuesto
        ? [inf.totalConImpuestos.totalImpuesto]
        : [];
    const iva = totalImpuestos.reduce(
      (s: number, t: any) => s + this.nDesdeString(t?.valor, 0),
      0,
    );

    const rawDetalles = factura?.detalles?.detalle;
    const detalleArr = Array.isArray(rawDetalles)
      ? rawDetalles
      : rawDetalles
        ? [rawDetalles]
        : [];

    const detalle = detalleArr.map((d: any) => ({
      concepto: String(d?.descripcion ?? 'Ítem'),
      cantidad: Math.max(1, Math.round(this.nDesdeString(d?.cantidad, 1))),
      precio_unitario: this.nDesdeString(d?.precioUnitario, 0),
      valor_total: this.nDesdeString(d?.precioTotalSinImpuesto, 0),
    }));

    // infoAdicional → { [nombre]: valor } (p. ej. "RUC Proveedor").
    const infoAdicional: Record<string, string> = {};
    const rawCampos = factura?.infoAdicional?.campoAdicional;
    const camposArr = Array.isArray(rawCampos)
      ? rawCampos
      : rawCampos
        ? [rawCampos]
        : [];
    for (const c of camposArr) {
      const nombre =
        c && typeof c === 'object' ? (c['@_nombre'] ?? null) : null;
      if (!nombre) continue;
      const valor =
        c && typeof c === 'object'
          ? String(c['#text'] ?? '')
          : String(c ?? '');
      infoAdicional[String(nombre)] = valor.trim();
    }

    // Plazo de crédito que sugiere el propio XML (pagos/pago/plazo).
    let plazoSugerido: number | null = null;
    const rawPago = inf?.pagos?.pago;
    const pagosArr = Array.isArray(rawPago) ? rawPago : rawPago ? [rawPago] : [];
    for (const p of pagosArr) {
      const plazo = parseInt(String(p?.plazo ?? ''), 10);
      if (Number.isFinite(plazo) && plazo > 0) {
        plazoSugerido = plazo;
        break;
      }
    }

    return {
      numero,
      clave_acceso: it?.claveAcceso ?? null,
      razon_social_cliente: inf?.razonSocialComprador ?? null,
      ruc_cliente: inf?.identificacionComprador ?? null,
      fecha_emision: this.parseFechaSRI(inf?.fechaEmision),
      subtotal: this.nDesdeString(inf?.totalSinImpuestos, 0),
      iva,
      total: this.nDesdeString(inf?.importeTotal, 0),
      detalle,
      numero_autorizacion: informacionAutorizacion.numero,
      fecha_autorizacion: informacionAutorizacion.fecha,
      ambiente: informacionAutorizacion.ambiente,
      info_adicional: infoAdicional,
      plazo_sugerido: plazoSugerido,
    };
  }
}