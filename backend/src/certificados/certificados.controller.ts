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
@UseGuards(JwtAuthGuard, AccessGuard)
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post('upload')
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

  @Get()
  @RequireAccess('Recepcion Equipos', 1)
  findAll(@Req() req: any) {
    return this.certificadosService.findAll();
  }

  @Get('download/:id')
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
  @RequireAccess('Recepcion Equipos', 1)
  findOne(@Param('id') id: string) {
    return this.certificadosService.findOne(+id);
  }

  @Delete(':id')
  @RequireAccess('Recepcion Equipos', 5)
  remove(@Param('id') id: string) {
    return this.certificadosService.remove(+id);
  }
}
