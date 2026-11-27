import { createReadStream, existsSync } from 'fs';
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { CertificadosService } from './certificados.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('certificados')
export class CertificadosController {
  constructor(
    private readonly certificadosService: CertificadosService,
    private readonly jwtService: JwtService,
  ) {}

  /** Envía el PDF con su nombre original (inline: el navegador lo muestra). */
  private enviarPdf(res: any, filePath: string, nombre: string) {
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'El archivo del certificado ya no está disponible en el servidor',
      );
    }
    const nombreAscii = nombre.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${nombreAscii}"; filename*=UTF-8''${encodeURIComponent(nombre)}`,
    );
    const stream = createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) res.status(500).end();
      else res.end();
    });
    stream.pipe(res);
  }

  // "Ver Documento": en vez de abrir una copia temporal del navegador (que no
  // tiene nombre y al descargarse sale con un código), se genera un enlace
  // de 10 minutos al PDF real. El navegador lo abre directo desde el
  // servidor, así que al descargarlo usa el nombre original del documento.
  // Los permisos se verifican aquí, igual que en download.
  @Post(':id/enlace')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 2)
  async enlace(
    @Param('id', ParseIntPipe) id: number,
    @Query('tipo') tipo: string,
    @Req() req: any,
  ) {
    const { filePath, nombreOriginal } = await this.certificadosService.download(
      id,
      tipo,
      req.user,
    );
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'El archivo del certificado ya no está disponible en el servidor',
      );
    }
    const token = this.jwtService.sign(
      { proposito: 'ver-certificado', id, tipo },
      { secret: process.env.JWT_SECRET || 'clave_secreta_desarrollo', expiresIn: '10m' },
    );
    const nombre = nombreOriginal || `${tipo}_${id}.pdf`;
    return { url: `/certificados/ver/${token}/${encodeURIComponent(nombre)}` };
  }

  // Abre el PDF con un enlace temporal (sin cabecera de sesión: lo abre el
  // navegador directamente). El nombre al final de la ruta es solo para que
  // el navegador lo use al descargar; el documento lo decide el token.
  @Get('ver/:token/:nombre')
  async ver(@Param('token') token: string, @Res() res: any) {
    let datos: { proposito?: string; id?: number; tipo?: string };
    try {
      datos = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'clave_secreta_desarrollo',
      });
    } catch {
      throw new BadRequestException(
        'El enlace del documento venció. Vuelva a abrirlo desde el sistema.',
      );
    }
    if (
      datos.proposito !== 'ver-certificado' ||
      typeof datos.id !== 'number' ||
      (datos.tipo !== 'reporte' && datos.tipo !== 'certificado')
    ) {
      throw new BadRequestException('Enlace de documento no válido.');
    }
    const { filePath, nombreOriginal } =
      await this.certificadosService.rutaDocumento(datos.id, datos.tipo);
    this.enviarPdf(res, filePath, nombreOriginal || `${datos.tipo}_${datos.id}.pdf`);
  }

  // Un solo PDF: el laboratorio ya entrega el reporte y el certificado como
  // un único documento combinado. Técnico, jefe y director firman ese mismo
  // archivo en cada etapa (ver certificados.service.ts#firmar) — no dos
  // documentos separados como antes.
  @Post('upload')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 3)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('recepcion_equipo_id', ParseIntPipe) recepcionEquipoId: number,
    @Req() req: any,
    @Body('servicio_id') servicioId?: string,
    @Body('fecha_calibracion') fechaCalibracion?: string,
    @Body('fecha_proxima_calibracion') fechaProximaCalibracion?: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe adjuntar el PDF del reporte y certificado.',
      );
    }
    return this.certificadosService.upload(
      file,
      recepcionEquipoId,
      req.user,
      servicioId ? Number(servicioId) : undefined,
      fechaCalibracion,
      fechaProximaCalibracion,
    );
  }

  // Firma digital real (PAdES/PKCS#7) — el PDF ya llega firmado desde el
  // navegador del firmante con su .p12 personal; este endpoint solo
  // verifica criptográficamente esa firma y transiciona el estado.
  @Post(':id/firmar')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 4)
  @UseInterceptors(FileInterceptor('file'))
  async firmar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('El PDF firmado es obligatorio.');
    }
    return this.certificadosService.firmar(id, file, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 1)
  findAll(@Req() req: any) {
    return this.certificadosService.findAll(undefined, req.user);
  }

  // Endpoint público — sin JwtAuthGuard/AccessGuard a propósito. Permite que
  // un tercero (cliente, auditor) confirme la autenticidad de un certificado
  // sin necesitar una cuenta en el sistema. Solo expone metadatos, nunca el
  // PDF ni la ruta del archivo.
  @Get('verificar/:codigo')
  verificar(@Param('codigo') codigo: string) {
    return this.certificadosService.verificar(codigo);
  }

  @Get('download/:id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 2)
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Query('tipo') tipo: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const { filePath, nombreOriginal } = await this.certificadosService.download(
      id,
      tipo,
      req.user,
    );
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'El archivo del certificado ya no está disponible en el servidor',
      );
    }
    res.setHeader('Content-Type', 'application/pdf');
    // filename= (ASCII, sin comillas para no romper el header) + filename*=
    // (UTF-8 percent-encoded, RFC 5987) para que tildes/ñ se vean bien en
    // navegadores que lo soportan; ambos caen al nombre genérico si por
    // algún motivo el certificado no tiene nombre_original guardado.
    const nombre = nombreOriginal || `${tipo}_${id}.pdf`;
    const nombreAscii = nombre.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${nombreAscii}"; filename*=UTF-8''${encodeURIComponent(nombre)}`,
    );
    const stream = createReadStream(filePath);
    // Sin este handler, un error del stream (archivo borrado tras el check
    // de arriba, permisos, disco) tumba TODO el proceso de Node — un
    // EventEmitter con un 'error' sin listener relanza y crashea el server
    // completo, no solo esta petición.
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 1)
  findOne(@Param('id') id: string) {
    return this.certificadosService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 5)
  remove(@Param('id') id: string) {
    return this.certificadosService.remove(+id);
  }
}
