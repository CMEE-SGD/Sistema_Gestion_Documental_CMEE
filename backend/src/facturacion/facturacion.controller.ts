import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { FacturacionService } from './facturacion.service';
import { CreateProformaDto } from './dto/create-proforma.dto';
import { UpdateProformaDto } from './dto/update-proforma.dto';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { ImportarXmlFacturaDto } from './dto/importar-xml-factura.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { RegistrarCompensacionDto } from './dto/registrar-compensacion.dto';
import { CreateNotaEntregaDto } from './dto/create-nota-entrega.dto';

/**
 * Módulo financiero del flujograma de calibración. Aplicación independiente
 * ('Gestion Financiera') ligada a la recepción de equipos por sus datos
 * (órdenes, proformas y fechas de calibración). Esquema de niveles:
 * 1 lectura, 4 creación/actualización, 5 eliminación. Los GET de proformas
 * se comparten como catálogo de solo-lectura con 'Recepcion Equipos' para
 * que el flujo de recepción pueda vincular la orden con su proforma.
 */
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  // ---------------------- PROFORMAS ----------------------

  @Get('proformas')
  @RequireAccess([
    { app: 'Gestion Financiera', level: 1 },
    { app: 'Recepcion Equipos', level: 1 },
  ])
  findAllProformas() {
    return this.facturacionService.findAllProformas();
  }

  @Post('proformas')
  @RequireAccess('Gestion Financiera', 4)
  createProforma(@Body() dto: CreateProformaDto) {
    return this.facturacionService.createProforma(dto);
  }

  @Get('proformas/:id')
  @RequireAccess([
    { app: 'Gestion Financiera', level: 1 },
    { app: 'Recepcion Equipos', level: 1 },
  ])
  findOneProforma(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOneProforma(id);
  }

  @Patch('proformas/:id')
  @RequireAccess('Gestion Financiera', 4)
  updateProforma(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProformaDto) {
    return this.facturacionService.updateProforma(id, dto);
  }

  @Delete('proformas/:id')
  @RequireAccess('Gestion Financiera', 5)
  removeProforma(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.removeProforma(id);
  }

  // ---------------------- FACTURAS ----------------------

  @Get('facturas')
  @RequireAccess('Gestion Financiera', 1)
  findAllFacturas() {
    return this.facturacionService.findAllFacturas();
  }

  // Datos de una orden de trabajo para el alta/importación de la factura.
  // Solo lectura; no exige permiso 'Recepcion Equipos' (el catálogo vive en
  // el módulo financiero porque la factura nace de la orden finalizada).
  @Get('ordenes/:id')
  @RequireAccess('Gestion Financiera', 1)
  findOrdenParaFactura(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOrdenParaFactura(id);
  }

  @Get('facturas/:id')
  @RequireAccess('Gestion Financiera', 1)
  findOneFactura(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOneFactura(id);
  }

  @Post('facturas')
  @RequireAccess('Gestion Financiera', 4)
  createFactura(@Body() dto: CreateFacturaDto) {
    return this.facturacionService.createFactura(dto);
  }

  // XML que emite la encargada del sistema financiero → se absorben los datos
  @Post('facturas/importar-xml')
  @RequireAccess('Gestion Financiera', 4)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  importarXml(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportarXmlFacturaDto,
  ) {
    return this.facturacionService.importarXml(dto, file);
  }

  @Patch('facturas/:id')
  @RequireAccess('Gestion Financiera', 4)
  updateFactura(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFacturaDto) {
    return this.facturacionService.updateFactura(id, dto);
  }

  @Delete('facturas/:id')
  @RequireAccess('Gestion Financiera', 5)
  removeFactura(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.removeFactura(id);
  }

  // ---------------------- NOTA DE ENTREGA ----------------------

  @Post('facturas/:id/nota-entrega')
  @RequireAccess('Gestion Financiera', 4)
  crearNotaEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateNotaEntregaDto,
    @Req() req: any,
  ) {
    const personaId = req.user?.persona_id ?? null;
    return this.facturacionService.crearNotaEntrega(id, dto, personaId);
  }

  // ---------------------- COBROS ----------------------

  @Post('facturas/:id/pagos')
  @RequireAccess('Gestion Financiera', 4)
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  registrarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarPagoDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: any,
  ) {
    const personaId = req.user?.persona_id ?? null;
    return this.facturacionService.registrarPago(id, dto, file, personaId);
  }

  @Post('facturas/:id/compensacion')
  @RequireAccess('Gestion Financiera', 4)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'factura_compra', maxCount: 1 },
        { name: 'acta', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  registrarCompensacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarCompensacionDto,
    @UploadedFiles()
    files: {
      factura_compra?: Express.Multer.File[];
      acta?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    const personaId = req.user?.persona_id ?? null;
    return this.facturacionService.registrarCompensacion(id, dto, files, personaId);
  }

  // ---------------------- CARTERA Y ALERTAS ----------------------

  @Get('cartera')
  @RequireAccess('Gestion Financiera', 1)
  cartera() {
    return this.facturacionService.cartera();
  }

  @Get('proximas-calibraciones')
  @RequireAccess('Gestion Financiera', 1)
  proximasCalibraciones(@Query('horizonte') horizonte?: string) {
    const h = horizonte ? parseInt(horizonte, 10) : undefined;
    return this.facturacionService.proximasCalibraciones(
      Number.isFinite(h) ? h : undefined,
    );
  }

  @Post('proximas-calibraciones/notificar')
  @RequireAccess('Gestion Financiera', 4)
  notificarProximasCalibraciones() {
    return this.facturacionService.notificarProximasCalibraciones();
  }
}