import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/guards/access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { InventarioService } from './inventario.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { TipoMovimientoInventario } from '@prisma/client';

/**
 * Inventario de insumos y materiales del centro (módulo independiente).
 * Niveles de acceso: 1-3 ver, 4 editar y registrar movimientos, 5 dar de
 * baja productos (el historial nunca se elimina).
 */
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  // --- Productos ---

  @Get('productos')
  @RequireAccess('Inventario', 1)
  listarProductos(@Query() query: Record<string, string>) {
    const categoriaId = Number(query.categoria_id);
    return this.inventarioService.findAll({
      q: query.q,
      categoria_id: Number.isFinite(categoriaId) && query.categoria_id ? categoriaId : undefined,
      bajo_stock: query.bajo_stock === 'true',
      inactivos: query.inactivos === 'true',
    });
  }

  @Get('productos/:id')
  @RequireAccess('Inventario', 1)
  detalleProducto(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.findOne(id);
  }

  @Post('productos')
  @RequireAccess('Inventario', 4)
  crearProducto(@Body() dto: CreateProductoDto, @Req() req: any) {
    const personaId = req.user?.persona_id ?? null;
    return this.inventarioService.crear(dto, personaId);
  }

  @Patch('productos/:id')
  @RequireAccess('Inventario', 4)
  actualizarProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductoDto,
  ) {
    return this.inventarioService.actualizar(id, dto);
  }

  @Delete('productos/:id')
  @RequireAccess('Inventario', 5)
  eliminarProducto(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.eliminar(id);
  }

  // --- Categorías ---

  @Get('categorias')
  @RequireAccess('Inventario', 1)
  listarCategorias() {
    return this.inventarioService.findCategorias();
  }

  @Post('categorias')
  @RequireAccess('Inventario', 4)
  crearCategoria(@Body() dto: CreateCategoriaDto) {
    return this.inventarioService.crearCategoria(dto);
  }

  @Patch('categorias/:id')
  @RequireAccess('Inventario', 4)
  actualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.inventarioService.actualizarCategoria(id, dto);
  }

  // --- Movimientos (kardex) ---

  @Get('movimientos')
  @RequireAccess('Inventario', 1)
  listarMovimientos(@Query() query: Record<string, string>) {
    const productoId = Number(query.producto_id);
    const tipo = query.tipo as TipoMovimientoInventario | undefined;
    return this.inventarioService.findAllMovimientos({
      producto_id: Number.isFinite(productoId) && query.producto_id ? productoId : undefined,
      tipo:
        tipo && ['ENTRADA', 'SALIDA', 'AJUSTE'].includes(tipo) ? tipo : undefined,
      desde: query.desde,
      hasta: query.hasta,
    });
  }

  @Post('movimientos')
  @RequireAccess('Inventario', 4)
  registrarMovimiento(@Body() dto: CreateMovimientoDto, @Req() req: any) {
    const personaId = req.user?.persona_id ?? null;
    return this.inventarioService.registrarMovimiento(dto, personaId);
  }

  // --- Alertas ---

  @Get('alertas')
  @RequireAccess('Inventario', 1)
  alertas() {
    return this.inventarioService.alertas();
  }
}
