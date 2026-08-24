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
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Documentos. */
@Controller('documentos')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad global del controlador
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
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
  @RequireAccess('Gestor Documental', 2)
  getCircuitos() {
    return this.documentosService.getCircuitos();
  }

  @Post(':id/versiones')
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
  @RequireAccess('Gestor Documental', 2)
  getVersiones(@Param('id') id: string) {
    return this.documentosService.getVersiones(+id);
  }

  @Post(':id/versiones/:versionId/restaurar')
  @RequireAccess('Gestor Documental', 4)
  restaurarVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.documentosService.restaurarVersion(+id, +versionId);
  }

  @Get(':id/workflow')
  @RequireAccess('Gestor Documental', 2)
  getWorkflow(@Param('id') id: string) {
    return this.documentosService.getWorkflow(+id);
  }

  // Firma digital real (PAdES/PKCS#7) — el PDF ya llega firmado desde el
  // navegador del firmante con su .p12 personal; este endpoint solo
  // verifica criptográficamente esa firma y avanza el workflow.
  @Post(':id/workflow/firmar')
  @RequireAccess('Gestor Documental', 4)
  @UseInterceptors(FileInterceptor('archivo'))
  async firmarFase(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('El PDF firmado es obligatorio y debe ser un archivo PDF.');
    }
    return this.documentosService.firmarFase(+id, file, req.user);
  }

  @Post(':id/workflow/rechazar')
  @RequireAccess('Gestor Documental', 4)
  rechazarFase(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentosService.rechazarFase(+id, body, req.user);
  }

  @Get(':id')
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Ver detalle del documento
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(+id);
  }

  @Patch(':id')
  @RequireAccess('Gestor Documental', 4) // Nivel 4: Modificar metadatos del documento
  update(@Param('id') id: string, @Body() data: any) {
    return this.documentosService.update(+id, data);
  }

  @Delete(':id')
  @RequireAccess('Gestor Documental', 5) // Nivel 5: Eliminar documento
  remove(@Param('id') id: string) {
    return this.documentosService.remove(+id);
  }
}