import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoMovimientoInventario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

export interface FiltrosProductos {
  q?: string;
  categoria_id?: number;
  bajo_stock?: boolean;
  inactivos?: boolean;
}

export interface FiltrosMovimientos {
  producto_id?: number;
  tipo?: TipoMovimientoInventario;
  desde?: string;
  hasta?: string;
}

/**
 * Inventario de insumos y materiales del centro. El stock vive
 * denormalizado en `productos.stock_actual` y CADA cambio se registra como
 * movimiento de kardex en la misma transacción, con snapshot del stock
 * anterior/posterior. Las salidas validan stock suficiente y los ajustes
 * usan bloqueo optimista, de modo que nunca queda stock negativo.
 *
 * Módulo independiente: la integración con Egresos (compras → entradas) y
 * con órdenes de trabajo (consumos → salidas) es una extensión futura.
 */
@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Productos
  // ---------------------------------------------------------------------------

  async findAll(filtros: FiltrosProductos) {
    const q = filtros.q?.trim();
    const productos = await this.prisma.producto.findMany({
      where: {
        // Por defecto solo activos; `inactivos=true` muestra el histórico completo.
        ...(filtros.inactivos ? {} : { activo: true }),
        ...(filtros.categoria_id && Number.isFinite(filtros.categoria_id)
          ? { categoria_id: filtros.categoria_id }
          : {}),
        ...(q
          ? {
              OR: [
                { codigo: { contains: q, mode: 'insensitive' } },
                { nombre: { contains: q, mode: 'insensitive' } },
                { descripcion: { contains: q, mode: 'insensitive' } },
                { ubicacion: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { categoria: { select: { id: true, nombre: true } } },
      orderBy: { nombre: 'asc' },
    });

    // Prisma no permite comparar dos columnas en el `where`, así que el
    // filtro de "bajo stock" se aplica en memoria: es un catálogo de
    // centenas de ítems como máximo, no de millones.
    if (filtros.bajo_stock) {
      return productos.filter((p) => this.esBajoStock(p.stock_actual, p.stock_minimo));
    }
    return productos;
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { select: { id: true, nombre: true } },
        movimientos: {
          orderBy: { fecha: 'desc' },
          take: 20,
          include: {
            registrado_por: { select: { nombre: true, apellidos: true } },
          },
        },
      },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async crear(dto: CreateProductoDto, personaId: number | null) {
    const codigo = dto.codigo.trim();
    if (!codigo) throw new BadRequestException('El código es obligatorio');

    const existente = await this.prisma.producto.findUnique({ where: { codigo } });
    if (existente) {
      throw new BadRequestException(`Ya existe un producto con el código "${codigo}"`);
    }

    const categoria = await this.prisma.categoriaInsumo.findUnique({
      where: { id: dto.categoria_id },
    });
    if (!categoria) throw new BadRequestException('La categoría indicada no existe');

    const stockInicial = dto.stock_inicial ?? 0;
    if (!Number.isFinite(stockInicial) || stockInicial < 0) {
      throw new BadRequestException('El stock inicial no es válido');
    }

    // Alta + movimiento inicial en la misma transacción: o todo o nada.
    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: {
          codigo,
          nombre: dto.nombre.trim(),
          descripcion: dto.descripcion?.trim() || null,
          unidad: dto.unidad ?? 'UNIDAD',
          categoria_id: dto.categoria_id,
          stock_actual: stockInicial,
          stock_minimo: dto.stock_minimo ?? 0,
          ubicacion: dto.ubicacion?.trim() || null,
          fecha_ultimo_mov: stockInicial > 0 ? new Date() : null,
        },
      });

      if (stockInicial > 0) {
        await tx.movimientoInventario.create({
          data: {
            producto_id: producto.id,
            tipo: 'ENTRADA',
            motivo: 'OTRO',
            cantidad: stockInicial,
            stock_anterior: 0,
            stock_posterior: stockInicial,
            descripcion: 'Stock inicial al crear el producto',
            registrado_por_id: personaId,
          },
        });
      }

      return producto;
    });
  }

  async actualizar(id: number, dto: UpdateProductoDto) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    if (dto.codigo !== undefined) {
      const codigo = dto.codigo.trim();
      if (!codigo) throw new BadRequestException('El código no puede quedar vacío');
      if (codigo !== producto.codigo) {
        const duplicado = await this.prisma.producto.findUnique({ where: { codigo } });
        if (duplicado) {
          throw new BadRequestException(`Ya existe un producto con el código "${codigo}"`);
        }
      }
    }

    if (dto.categoria_id !== undefined) {
      const categoria = await this.prisma.categoriaInsumo.findUnique({
        where: { id: dto.categoria_id },
      });
      if (!categoria) throw new BadRequestException('La categoría indicada no existe');
    }

    const data: Prisma.ProductoUncheckedUpdateInput = {};
    if (dto.codigo !== undefined) data.codigo = dto.codigo.trim();
    if (dto.nombre !== undefined) {
      if (!dto.nombre.trim()) throw new BadRequestException('El nombre no puede quedar vacío');
      data.nombre = dto.nombre.trim();
    }
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion.trim() || null;
    if (dto.unidad !== undefined) data.unidad = dto.unidad;
    if (dto.categoria_id !== undefined) data.categoria_id = dto.categoria_id;
    if (dto.stock_minimo !== undefined) data.stock_minimo = dto.stock_minimo;
    if (dto.ubicacion !== undefined) data.ubicacion = dto.ubicacion.trim() || null;
    if (dto.activo !== undefined) data.activo = dto.activo;

    return this.prisma.producto.update({ where: { id }, data });
  }

  /**
   * Baja lógica: el producto deja de aparecer en los listados pero su
   * historial de movimientos se conserva siempre (auditoría).
   */
  async eliminar(id: number) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    if (!producto.activo) return producto;
    return this.prisma.producto.update({ where: { id }, data: { activo: false } });
  }

  // ---------------------------------------------------------------------------
  // Categorías
  // ---------------------------------------------------------------------------

  findCategorias() {
    return this.prisma.categoriaInsumo.findMany({
      where: { activo: true },
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async crearCategoria(dto: CreateCategoriaDto) {
    const nombre = dto.nombre.trim();
    if (!nombre) throw new BadRequestException('El nombre de la categoría es obligatorio');
    const existente = await this.prisma.categoriaInsumo.findUnique({ where: { nombre } });
    if (existente) {
      throw new BadRequestException(`Ya existe la categoría "${nombre}"`);
    }
    return this.prisma.categoriaInsumo.create({ data: { nombre } });
  }

  async actualizarCategoria(id: number, dto: UpdateCategoriaDto) {
    const categoria = await this.prisma.categoriaInsumo.findUnique({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    const data: Prisma.CategoriaInsumoUpdateInput = {};
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre de la categoría no puede quedar vacío');
      if (nombre !== categoria.nombre) {
        const duplicada = await this.prisma.categoriaInsumo.findUnique({ where: { nombre } });
        if (duplicada) {
          throw new BadRequestException(`Ya existe la categoría "${nombre}"`);
        }
      }
      data.nombre = nombre;
    }
    if (dto.activo !== undefined) data.activo = dto.activo;

    return this.prisma.categoriaInsumo.update({ where: { id }, data });
  }

  // ---------------------------------------------------------------------------
  // Movimientos (kardex)
  // ---------------------------------------------------------------------------

  findAllMovimientos(filtros: FiltrosMovimientos) {
    const fecha: Prisma.DateTimeFilter = {};
    if (filtros.desde) fecha.gte = new Date(filtros.desde);
    if (filtros.hasta) {
      // `hasta` llega como YYYY-MM-DD: incluye todo el día.
      const fin = new Date(filtros.hasta);
      fin.setUTCHours(23, 59, 59, 999);
      fecha.lte = fin;
    }

    return this.prisma.movimientoInventario.findMany({
      where: {
        ...(filtros.producto_id && Number.isFinite(filtros.producto_id)
          ? { producto_id: filtros.producto_id }
          : {}),
        ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
        ...(filtros.desde || filtros.hasta ? { fecha } : {}),
      },
      include: {
        producto: { select: { id: true, codigo: true, nombre: true, unidad: true } },
        registrado_por: { select: { nombre: true, apellidos: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Registra un movimiento y actualiza el stock en la MISMA transacción.
   *
   * Concurrency: las ENTRADAS usan `increment` atómico; las SALIDAS exigen
   * `stock_actual >= cantidad` en el propio UPDATE (nunca queda negativo);
   * los AJUSTES comparan el stock leído contra el actual (bloqueo
   * optimista) y fallan con un mensaje claro si hubo movimiento concurrente.
   */
  async registrarMovimiento(dto: CreateMovimientoDto, personaId: number | null) {
    const cantidad = Number(dto.cantidad);
    if (!Number.isFinite(cantidad) || cantidad < 0) {
      throw new BadRequestException('La cantidad no es válida');
    }
    if (dto.tipo !== 'AJUSTE' && cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id: dto.producto_id },
      });
      if (!producto) throw new NotFoundException('Producto no encontrado');
      if (!producto.activo) {
        throw new BadRequestException('No se pueden registrar movimientos de un producto inactivo');
      }

      let stockAnterior: number;
      let stockPosterior: number;

      if (dto.tipo === 'ENTRADA') {
        await tx.producto.update({
          where: { id: producto.id },
          data: { stock_actual: { increment: cantidad }, fecha_ultimo_mov: new Date() },
        });
        const actualizado = await tx.producto.findUnique({
          where: { id: producto.id },
          select: { stock_actual: true },
        });
        stockPosterior = Number(actualizado?.stock_actual ?? 0);
        stockAnterior = stockPosterior - cantidad;
      } else if (dto.tipo === 'SALIDA') {
        const despues = await tx.producto.updateMany({
          where: { id: producto.id, stock_actual: { gte: cantidad } },
          data: { stock_actual: { decrement: cantidad }, fecha_ultimo_mov: new Date() },
        });
        if (despues.count === 0) {
          const actual = Number(producto.stock_actual);
          throw new BadRequestException(
            `Stock insuficiente: hay ${actual} ${producto.unidad.toLowerCase()} disponibles`,
          );
        }
        const actualizado = await tx.producto.findUnique({
          where: { id: producto.id },
          select: { stock_actual: true },
        });
        stockPosterior = Number(actualizado?.stock_actual ?? 0);
        stockAnterior = stockPosterior + cantidad;
      } else {
        // AJUSTE: `cantidad` es el stock resultante del conteo físico.
        const ajuste = await tx.producto.updateMany({
          where: { id: producto.id, stock_actual: producto.stock_actual },
          data: { stock_actual: cantidad, fecha_ultimo_mov: new Date() },
        });
        if (ajuste.count === 0) {
          throw new BadRequestException(
            'El stock cambió mientras registrabas el ajuste; vuelve a verificar el conteo',
          );
        }
        stockAnterior = Number(producto.stock_actual);
        stockPosterior = cantidad;
      }

      // En el kardex, `cantidad` es SIEMPRE la magnitud del cambio
      // (en ajustes, la diferencia entre conteo y stock anterior).
      const deltaMovimiento = Math.abs(stockPosterior - stockAnterior);

      return tx.movimientoInventario.create({
        data: {
          producto_id: producto.id,
          tipo: dto.tipo,
          motivo: dto.motivo,
          cantidad: deltaMovimiento,
          stock_anterior: stockAnterior,
          stock_posterior: stockPosterior,
          descripcion: dto.descripcion?.trim() || null,
          registrado_por_id: personaId,
        },
        include: {
          producto: { select: { id: true, codigo: true, nombre: true, unidad: true } },
          registrado_por: { select: { nombre: true, apellidos: true } },
        },
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Alertas de stock mínimo
  // ---------------------------------------------------------------------------

  /**
   * Productos activos cuyo stock está por debajo (o igual) del mínimo.
   * Solo aplican los productos con un mínimo configurado (> 0): los que
   * tienen mínimo 0 significan "sin control de mínimo" y no alertan.
   */
  async alertas() {
    const productos = await this.prisma.producto.findMany({
      where: { activo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        unidad: true,
        ubicacion: true,
        stock_actual: true,
        stock_minimo: true,
      },
      orderBy: { nombre: 'asc' },
    });
    const bajos = productos.filter((p) => this.esBajoStock(p.stock_actual, p.stock_minimo));
    return { total: bajos.length, productos: bajos };
  }

  private esBajoStock(stockActual: unknown, stockMinimo: unknown): boolean {
    const minimo = Number(stockMinimo);
    if (!Number.isFinite(minimo) || minimo <= 0) return false;
    return Number(stockActual) <= minimo;
  }
}
