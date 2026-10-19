import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEgresoDto } from './dto/create-egreso.dto';
import { UpdateEgresoDto } from './dto/update-egreso.dto';

interface EgresoData {
  fecha: Date;
  tipo_documento: string;
  numero_documento: string;
  numero_documento_relacionado?: string;
  autorizacion?: string;
  proveedor: string;
  identificacion?: string;
  referencia?: string;
  subtotal_iva: number;
  subtotal_cero: number;
  iva: number;
  ice: number;
  total: number;
  saldo: number;
  retenciones: number;
  estado: string;
  dias_vencimiento?: number | null;
  fecha_vencimiento?: Date | null;
  forma_pago?: string;
  tipo_emision?: string;
  descripcion?: string;
}

// Cabeceras del exportado del sistema tributario (SIAT) → campo del modelo.
// Las claves están normalizadas (minúsculas, sin tildes).
const CABECERAS: Record<string, string> = {
  fecha: 'fecha',
  'tipo documento': 'tipo_documento',
  '# documento': 'numero_documento',
  '# documento relacionado': 'numero_documento_relacionado',
  autorizacion: 'autorizacion',
  persona: 'proveedor',
  identificacion: 'identificacion',
  referencia: 'referencia',
  'subtotal iva mayor a 0%': 'subtotal_iva',
  'subtotal iva 0%': 'subtotal_cero',
  iva: 'iva',
  ice: 'ice',
  total: 'total',
  saldo: 'saldo',
  retenciones: 'retenciones',
  estado: 'estado',
  'dias vencimiento': 'dias_vencimiento',
  'fecha vencimiento': 'fecha_vencimiento',
  'formas de pago': 'forma_pago',
  'tipo de emision': 'tipo_emision',
  descripcion: 'descripcion',
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function claveDedupe(autorizacion?: string, numero?: string): string {
  return `${autorizacion?.trim() ?? ''}::${numero?.trim() ?? ''}`;
}

function texto(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function numero(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined) return 0;
  const s = String(v).trim().replace(/[$Bs.\s]/g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** Convierte una celda de fecha (Date, serial de Excel o texto dd/mm/yy) a Date. */
function fechaCelda(v: unknown): Date | null {
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : v;
  }
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
    // Serial de Excel (días desde 1899-12-30).
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return null;
    const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      const dia = Number(m[1]);
      const mes = Number(m[2]) - 1;
      const anio = Number(m[3]);
      const year = anio < 100 ? 2000 + anio : anio;
      const d = new Date(Date.UTC(year, mes, dia));
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const iso = new Date(t);
    return Number.isNaN(iso.getTime()) ? null : iso;
  }
  return null;
}

@Injectable()
export class EgresosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.egreso.findMany({
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    });
  }

  async importar(file: Express.Multer.File, registradoPorId: number | null) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('El archivo está vacío o no se recibió.');
    }
    const ext = (file.originalname.split('.').pop() ?? '').toLowerCase();
    if (!['xls', 'xlsx', 'csv'].includes(ext)) {
      throw new BadRequestException(
        'Formato no soportado. Suba un archivo Excel (.xls o .xlsx).',
      );
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
    } catch {
      throw new BadRequestException(
        'No se pudo leer el archivo Excel. Verifique que no esté dañado.',
      );
    }
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    if (!hoja) {
      throw new BadRequestException('El archivo Excel no contiene hojas.');
    }
    const filas = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
      header: 1,
      defval: '',
      raw: true,
    });

    // Ubica la fila de cabeceras: la que tenga más columnas reconocidas.
    let idxCabeceras = -1;
    let mejor = 0;
    for (let i = 0; i < filas.length && i < 40; i++) {
      const fila = filas[i];
      const hits = (fila ?? []).filter((c) =>
        CABECERAS[norm(texto(c))],
      ).length;
      if (hits > mejor) {
        mejor = hits;
        idxCabeceras = i;
      }
    }
    if (idxCabeceras === -1 || mejor < 3) {
      throw new BadRequestException(
        'No se encontró la fila de encabezados del exportado (Fecha, # Documento, Persona, Total…).',
      );
    }

    const indiceCol = new Map<string, number>();
    filas[idxCabeceras].forEach((c, j) => {
      const campo = CABECERAS[norm(texto(c))];
      if (campo) indiceCol.set(campo, j);
    });

    const celda = (fila: unknown[], campo: string): unknown => {
      const j = indiceCol.get(campo);
      return j === undefined ? '' : (fila[j] ?? '');
    };

    const pendientes: EgresoData[] = [];
    const omitidos: string[] = [];
    const vistos = new Set<string>();

    for (let i = idxCabeceras + 1; i < filas.length; i++) {
      const fila = filas[i] ?? [];
      const numeroDoc = texto(celda(fila, 'numero_documento'));
      const proveedor = texto(celda(fila, 'proveedor'));
      if (!numeroDoc && !proveedor) continue; // fila vacía

      const fecha = fechaCelda(celda(fila, 'fecha'));
      if (!fecha) {
        omitidos.push(`Fila ${i + 1}: fecha inválida (${texto(celda(fila, 'fecha')) || 'vacía'}).`);
        continue;
      }

      const clave = claveDedupe(
        texto(celda(fila, 'autorizacion')),
        numeroDoc,
      );
      if (vistos.has(clave)) {
        omitidos.push(`Fila ${i + 1}: documento duplicado en el archivo (${numeroDoc}).`);
        continue;
      }
      vistos.add(clave);

      pendientes.push({
        fecha,
        tipo_documento: texto(celda(fila, 'tipo_documento')) || 'Documento',
        numero_documento: numeroDoc || 'S/N',
        numero_documento_relacionado:
          texto(celda(fila, 'numero_documento_relacionado')) || undefined,
        autorizacion: texto(celda(fila, 'autorizacion')) || undefined,
        proveedor: proveedor || '—',
        identificacion: texto(celda(fila, 'identificacion')) || undefined,
        referencia: texto(celda(fila, 'referencia')) || undefined,
        subtotal_iva: numero(celda(fila, 'subtotal_iva')),
        subtotal_cero: numero(celda(fila, 'subtotal_cero')),
        iva: numero(celda(fila, 'iva')),
        ice: numero(celda(fila, 'ice')),
        total: numero(celda(fila, 'total')),
        saldo: numero(celda(fila, 'saldo')),
        retenciones: numero(celda(fila, 'retenciones')),
        estado: texto(celda(fila, 'estado')) || 'Pagado',
        dias_vencimiento: (() => {
          const d = numero(celda(fila, 'dias_vencimiento'));
          return d ? Math.round(d) : null;
        })(),
        fecha_vencimiento: fechaCelda(celda(fila, 'fecha_vencimiento')),
        forma_pago: texto(celda(fila, 'forma_pago')) || undefined,
        tipo_emision: texto(celda(fila, 'tipo_emision')) || undefined,
        descripcion: texto(celda(fila, 'descripcion')) || undefined,
      });
    }

    // Evita importar dos veces el mismo documento (por autorización + número).
    const existentes = await this.prisma.egreso.findMany({
      select: { autorizacion: true, numero_documento: true },
    });
    const existentesSet = new Set(
      existentes.map((e) =>
        claveDedupe(e.autorizacion ?? undefined, e.numero_documento),
      ),
    );
    const aInsertar = pendientes.filter(
      (p) => !existentesSet.has(claveDedupe(p.autorizacion, p.numero_documento)),
    );
    const omitidosPrevios = pendientes.length - aInsertar.length;

    if (aInsertar.length === 0) {
      return {
        filas_leidas: pendientes.length,
        importados: 0,
        omitidos: omitidos.length + omitidosPrevios,
        total: 0,
      };
    }

    await this.prisma.egreso.createMany({
      data: aInsertar.map((p) => ({
        ...p,
        registrado_por_id: registradoPorId,
      })),
    });

    return {
      filas_leidas: pendientes.length,
      importados: aInsertar.length,
      omitidos: omitidos.length + omitidosPrevios,
      total: aInsertar.reduce((acc, p) => acc + p.total, 0),
    };
  }

  async eliminar(id: number) {
    const existe = await this.prisma.egreso.findUnique({ where: { id } });
    if (!existe) {
      throw new NotFoundException('El egreso no existe.');
    }
    await this.prisma.egreso.delete({ where: { id } });
    return { eliminado: id };
  }

  /** Alta manual de un egreso (viáticos y otros gastos fuera del Excel). */
  async crear(dto: CreateEgresoDto, registradoPorId: number | null) {
    const esViatico = dto.es_viatico ?? false;
    return this.prisma.egreso.create({
      data: {
        fecha: new Date(dto.fecha),
        tipo_documento: dto.tipo_documento,
        numero_documento: dto.numero_documento,
        numero_documento_relacionado: dto.numero_documento_relacionado ?? null,
        autorizacion: dto.autorizacion ?? null,
        proveedor: dto.proveedor,
        identificacion: dto.identificacion ?? null,
        referencia: dto.referencia ?? null,
        subtotal_iva: dto.subtotal_iva ?? 0,
        subtotal_cero: dto.subtotal_cero ?? 0,
        iva: dto.iva ?? 0,
        ice: dto.ice ?? 0,
        total: dto.total,
        saldo: dto.saldo ?? 0,
        retenciones: dto.retenciones ?? 0,
        estado: dto.estado ?? 'Pagado',
        dias_vencimiento: dto.dias_vencimiento ?? null,
        fecha_vencimiento: dto.fecha_vencimiento
          ? new Date(dto.fecha_vencimiento)
          : null,
        forma_pago: dto.forma_pago ?? null,
        tipo_emision: dto.tipo_emision ?? null,
        descripcion: dto.descripcion ?? null,
        es_viatico: esViatico,
        cumple_viatico: esViatico ? (dto.cumple_viatico ?? null) : null,
        registrado_por_id: registradoPorId,
      },
    });
  }

  /** Actualiza el control de viáticos de un egreso (¿Cumple?). */
  async actualizar(id: number, dto: UpdateEgresoDto) {
    const existe = await this.prisma.egreso.findUnique({ where: { id } });
    if (!existe) {
      throw new NotFoundException('El egreso no existe.');
    }
    return this.prisma.egreso.update({
      where: { id },
      data: {
        ...(dto.es_viatico !== undefined && { es_viatico: dto.es_viatico }),
        ...(dto.cumple_viatico !== undefined && {
          cumple_viatico: dto.cumple_viatico,
        }),
      },
    });
  }

  async eliminarTodos() {
    const total = await this.prisma.egreso.count();
    if (total > 0) {
      await this.prisma.egreso.deleteMany({});
    }
    return { eliminados: total };
  }
}