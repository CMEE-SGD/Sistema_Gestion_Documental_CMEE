import { createReadStream, existsSync } from 'fs';
import { extname } from 'path';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
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
import { UpdateDistribucionDto } from './dto/update-distribucion.dto';
import { ImportarXmlFacturaDto } from './dto/importar-xml-factura.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { RegistrarCompensacionDto } from './dto/registrar-compensacion.dto';
import { ResolverAutorizacionCompensacionDto } from './dto/resolver-autorizacion-compensacion.dto';
import { CreateNotaEntregaDto } from './dto/create-nota-entrega.dto';

/**
 * Módulo financiero del flujograma de calibración. Aplicación independiente
 * ('Gestion Financiera') ligada a la recepción de equipos por sus datos
 * (órdenes, proformas y fechas de calibración). Esquema de niveles:
 * 1 lectura, 4 creación/actualización, 5 eliminación. Las proformas se
 * comparten con 'Recepcion Equipos' (lectura y gestión: crear, editar y
 * eliminar) porque el flujo de recepción puede emitir y vincular sus propias
 * proformas a la orden de trabajo.
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
  @RequireAccess([
    { app: 'Gestion Financiera', level: 4 },
    { app: 'Recepcion Equipos', level: 4 },
  ])
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  createProforma(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Record<string, string>,
  ) {
    // Endpoint multipart (campo 'archivo' opcional): los campos de texto
    // llegan como string, por eso se coercionan aquí antes del DTO.
    const clienteId = body?.cliente_id ? Number(body.cliente_id) : NaN;
    if (!Number.isInteger(clienteId)) {
      throw new BadRequestException('El cliente es obligatorio.');
    }
    const monto =
      body?.monto !== undefined && body.monto !== ''
        ? Number(body.monto)
        : NaN;
    if (!Number.isFinite(monto)) {
      throw new BadRequestException('El monto es obligatorio.');
    }
    const dto: CreateProformaDto = {
      cliente_id: clienteId,
      monto,
      numero: body?.numero?.trim() || undefined,
      fecha_emision: body?.fecha_emision || undefined,
      observaciones: body?.observaciones?.trim() || undefined,
    };
    return this.facturacionService.createProforma(dto, file);
  }

  @Get('proformas/:id/archivo')
  @RequireAccess([
    { app: 'Gestion Financiera', level: 1 },
    { app: 'Recepcion Equipos', level: 1 },
  ])
  async descargarArchivoProforma(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    const { filePath, nombreOriginal } =
      await this.facturacionService.descargarArchivoProforma(id);
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'El archivo de la proforma ya no está disponible en el servidor',
      );
    }
    const ext = extname(filePath).toLowerCase();
    const mime =
      ext === '.pdf'
        ? 'application/pdf'
        : ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : ext === '.webp'
              ? 'image/webp'
              : 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    const nombreAscii = (nombreOriginal || `proforma_${id}`)
      .replace(/[^\x20-\x7E]/g, '_')
      .replace(/"/g, '');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${nombreAscii}"; filename*=UTF-8''${encodeURIComponent(nombreOriginal || `proforma_${id}`)}`,
    );
    const stream = createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });
    stream.pipe(res);
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
  @RequireAccess([
    { app: 'Gestion Financiera', level: 4 },
    { app: 'Recepcion Equipos', level: 4 },
  ])
  updateProforma(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProformaDto) {
    return this.facturacionService.updateProforma(id, dto);
  }

  @Delete('proformas/:id')
  @RequireAccess([
    { app: 'Gestion Financiera', level: 5 },
    { app: 'Recepcion Equipos', level: 5 },
  ])
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

  // El usuario financiero solicita la autorización del Director antes de
  // registrar una compensación (entrega de equipos).
  @Post('facturas/:id/compensacion/solicitar')
  @RequireAccess('Gestion Financiera', 4)
  solicitarAutorizacionCompensacion(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.facturacionService.solicitarAutorizacionCompensacion(
      id,
      req.user.id,
    );
  }

  // El Director aprueba o rechaza la solicitud (sin acceso a Gestion
  // Financiera: la validación de puesto se hace en el servicio).
  @Post('facturas/:id/compensacion/autorizar')
  autorizarCompensacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverAutorizacionCompensacionDto,
    @Req() req: any,
  ) {
    return this.facturacionService.autorizarCompensacion(
      id,
      req.user.id,
      req.user.isGod === true,
      dto,
    );
  }

  // ---------------------- CARTERA Y ALERTAS ----------------------

  @Get('cartera')
  @RequireAccess('Gestion Financiera', 1)
  cartera() {
    return this.facturacionService.cartera();
  }

  // ---------------------- DISTRIBUCIÓN DE RESULTADOS ----------------------
  // Reparto 15% / 85% entre las dos empresas que llevan las cuentas. La
  // configuración (nombres, %, base) es editable desde el Resumen financiero.

  @Get('distribucion')
  @RequireAccess('Gestion Financiera', 1)
  distribucion() {
    return this.facturacionService.configurarDistribucion();
  }

  @Get('distribucion/resumen')
  @RequireAccess('Gestion Financiera', 1)
  resumenDistribucion() {
    return this.facturacionService.resumenDistribucion();
  }

  @Put('distribucion')
  @RequireAccess('Gestion Financiera', 4)
  actualizarDistribucion(@Body() dto: UpdateDistribucionDto) {
    return this.facturacionService.actualizarDistribucion(dto);
  }

  @Get('proximas-calibraciones')
  // Alertas de la Fase D, compartidas en lectura con 'Recepcion Equipos' (la
  // página también se ofrece desde el módulo de recepción).
  @RequireAccess([
    { app: 'Gestion Financiera', level: 1 },
    { app: 'Recepcion Equipos', level: 1 },
  ])
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