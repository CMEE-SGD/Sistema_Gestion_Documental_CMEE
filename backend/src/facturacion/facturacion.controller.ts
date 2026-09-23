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
 * Módulo financiero del flujograma de calibración. Reutiliza el permiso
 * 'Recepcion Equipos' (misma aplicación) con el mismo esquema de niveles:
 * 1 lectura, 4 creación/actualización, 5 eliminación.
 */
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  // ---------------------- PROFORMAS ----------------------

  @Get('proformas')
  @RequireAccess('Recepcion Equipos', 1)
  findAllProformas() {
    return this.facturacionService.findAllProformas();
  }

  @Post('proformas')
  @RequireAccess('Recepcion Equipos', 4)
  createProforma(@Body() dto: CreateProformaDto) {
    return this.facturacionService.createProforma(dto);
  }

  @Get('proformas/:id')
  @RequireAccess('Recepcion Equipos', 1)
  findOneProforma(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOneProforma(id);
  }

  @Patch('proformas/:id')
  @RequireAccess('Recepcion Equipos', 4)
  updateProforma(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProformaDto) {
    return this.facturacionService.updateProforma(id, dto);
  }

  @Delete('proformas/:id')
  @RequireAccess('Recepcion Equipos', 5)
  removeProforma(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.removeProforma(id);
  }

  // ---------------------- FACTURAS ----------------------

  @Get('facturas')
  @RequireAccess('Recepcion Equipos', 1)
  findAllFacturas() {
    return this.facturacionService.findAllFacturas();
  }

  @Get('facturas/:id')
  @RequireAccess('Recepcion Equipos', 1)
  findOneFactura(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOneFactura(id);
  }

  @Post('facturas')
  @RequireAccess('Recepcion Equipos', 4)
  createFactura(@Body() dto: CreateFacturaDto) {
    return this.facturacionService.createFactura(dto);
  }

  // XML que emite la encargada del sistema financiero → se absorben los datos
  @Post('facturas/importar-xml')
  @RequireAccess('Recepcion Equipos', 4)
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
  @RequireAccess('Recepcion Equipos', 4)
  updateFactura(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFacturaDto) {
    return this.facturacionService.updateFactura(id, dto);
  }

  @Delete('facturas/:id')
  @RequireAccess('Recepcion Equipos', 5)
  removeFactura(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.removeFactura(id);
  }

  // ---------------------- NOTA DE ENTREGA ----------------------

  @Post('facturas/:id/nota-entrega')
  @RequireAccess('Recepcion Equipos', 4)
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
  @RequireAccess('Recepcion Equipos', 4)
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
  @RequireAccess('Recepcion Equipos', 4)
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
  @RequireAccess('Recepcion Equipos', 1)
  cartera() {
    return this.facturacionService.cartera();
  }

  @Get('proximas-calibraciones')
  @RequireAccess('Recepcion Equipos', 1)
  proximasCalibraciones(@Query('horizonte') horizonte?: string) {
    const h = horizonte ? parseInt(horizonte, 10) : undefined;
    return this.facturacionService.proximasCalibraciones(
      Number.isFinite(h) ? h : undefined,
    );
  }

  @Post('proximas-calibraciones/notificar')
  @RequireAccess('Recepcion Equipos', 4)
  notificarProximasCalibraciones() {
    return this.facturacionService.notificarProximasCalibraciones();
  }
}