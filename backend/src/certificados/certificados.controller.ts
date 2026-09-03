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
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CertificadosService } from './certificados.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Recepcion Equipos', 3)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'reporte', maxCount: 1 },
      { name: 'certificado', maxCount: 1 },
    ]),
  )
  async upload(
    @UploadedFiles()
    files: {
      reporte?: Express.Multer.File[];
      certificado?: Express.Multer.File[];
    },
    @Body('recepcion_equipo_id', ParseIntPipe) recepcionEquipoId: number,
    @Req() req: any,
    @Body('servicio_id') servicioId?: string,
  ) {
    const fileReporte = files?.reporte?.[0];
    const fileCertificado = files?.certificado?.[0];
    if (!fileReporte || !fileCertificado) {
      throw new BadRequestException(
        'Debe adjuntar el PDF del reporte y el PDF del certificado.',
      );
    }
    return this.certificadosService.upload(
      fileReporte,
      fileCertificado,
      recepcionEquipoId,
      req.user,
      servicioId ? Number(servicioId) : undefined,
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
    return this.certificadosService.findAll();
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
    const filePath = await this.certificadosService.download(id, tipo, req.user);
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'El archivo del certificado ya no está disponible en el servidor',
      );
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${tipo}_${id}.pdf"`,
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
