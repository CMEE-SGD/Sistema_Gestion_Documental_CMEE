import { createReadStream } from 'fs';
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('recepcion_equipo_id', ParseIntPipe) recepcionEquipoId: number,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo PDF del certificado es obligatorio.');
    }
    return this.certificadosService.upload(file, recepcionEquipoId, req.user);
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
    @Req() req: any,
    @Res() res: any,
  ) {
    const filePath = await this.certificadosService.download(id, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="certificado_${id}.pdf"`,
    );
    const stream = createReadStream(filePath);
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
