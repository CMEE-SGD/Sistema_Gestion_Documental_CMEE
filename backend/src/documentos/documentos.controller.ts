import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { existsSync, createReadStream } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Documentos. */
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 5) // Nivel 5: Subir un nuevo documento
  @UseInterceptors(FileInterceptor('archivo'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo PDF es obligatorio.');
    }
    return this.documentosService.create(file, body, req.user?.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Ver documentos
  findAll(@Query('carpeta_id') carpetaId?: string) {
    // carpeta_id es obligatorio: sin filtro, Prisma interpreta
    // `where: { carpeta_id: undefined }` como "sin filtro" y devolvería
    // TODOS los documentos del sistema sin paginación.
    if (!carpetaId) {
      throw new BadRequestException('carpeta_id es requerido.');
    }
    return this.documentosService.findAll(parseInt(carpetaId, 10));
  }

  @Get('circuitos')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 2)
  getCircuitos() {
    return this.documentosService.getCircuitos();
  }

  @Post(':id/versiones')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 5)
  @UseInterceptors(FileInterceptor('archivo'))
  async createVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo PDF es obligatorio.');
    }
    return this.documentosService.createVersion(file, {
      ...body,
      documento_id: id,
    });
  }

  @Get(':id/versiones')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 2)
  getVersiones(@Param('id') id: string) {
    return this.documentosService.getVersiones(+id);
  }

  @Post(':id/versiones/:versionId/restaurar')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 4)
  restaurarVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.documentosService.restaurarVersion(+id, +versionId);
  }

  @Get(':id/workflow')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 2)
  getWorkflow(@Param('id') id: string) {
    return this.documentosService.getWorkflow(+id);
  }

  // Firma digital real (PAdES/PKCS#7) — el PDF ya llega firmado desde el
  // navegador del firmante con su .p12 personal; este endpoint solo
  // verifica criptográficamente esa firma y avanza el workflow.
  @Post(':id/workflow/firmar')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 4)
  @UseInterceptors(FileInterceptor('archivo'))
  async firmarFase(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('El PDF firmado es obligatorio y debe ser un archivo PDF.');
    }
    return this.documentosService.firmarFase(+id, file, body, req.user);
  }

  // Avance de fase sin firma digital (ver aprobarFase en el service) — mismo
  // nivel de acceso que firmar/rechazar.
  @Post(':id/workflow/aprobar')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 4)
  aprobarFase(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentosService.aprobarFase(+id, body, req.user);
  }

  @Post(':id/workflow/rechazar')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 4)
  rechazarFase(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentosService.rechazarFase(+id, body, req.user);
  }

  @Get('verificar/:codigo')
  verificar(@Param('codigo') codigo: string) {
    return this.documentosService.verificar(codigo);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Ver detalle del documento
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(+id);
  }

  // Antes se descargaba directo desde /uploads/ (archivo estático): sin
  // guard, sin permisos, sin quedar registrado en auditoría. Mismo nivel
  // que ver el detalle — si lo puede ver, lo puede descargar.
  @Get(':id/descargar')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 2)
  async descargar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: any,
  ) {
    const { filePath, nombreOriginal } = await this.documentosService.descargar(
      id,
      req.user?.id,
    );
    if (!existsSync(filePath)) {
      throw new NotFoundException('El archivo ya no está disponible en el servidor');
    }
    res.setHeader('Content-Type', 'application/pdf');
    const nombreAscii = nombreOriginal.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nombreAscii}"; filename*=UTF-8''${encodeURIComponent(nombreOriginal)}`,
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 4) // Nivel 4: Modificar metadatos del documento
  update(@Param('id') id: string, @Body() data: any) {
    return this.documentosService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestor Documental', 5) // Nivel 5: Eliminar documento
  remove(@Param('id') id: string) {
    return this.documentosService.remove(+id);
  }
}