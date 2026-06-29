import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Query, UseGuards, Req } from '@nestjs/common';
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

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param file - Datos o identificador requerido (Express.Multer.File)
     * @param body - Datos o identificador requerido (any)
     * @returns Objeto complejo / PrismaResponse
     */
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
    return this.documentosService.findAll(carpetaId ? parseInt(carpetaId, 10) : undefined);
  }

  /**
     * Obtiene información de un registro específico.
     * @returns Array<Entidad>
     */
    @Get('circuitos')
  @RequireAccess('Gestor Documental', 2)
  getCircuitos() {
    return this.documentosService.getCircuitos();
  }

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param id - Datos o identificador requerido (string)
     * @param file - Datos o identificador requerido (Express.Multer.File)
     * @param body - Datos o identificador requerido (any)
     * @returns Objeto complejo / PrismaResponse
     */
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
    return this.documentosService.createVersion(file, { ...body, documento_id: id });
  }

  /**
     * Obtiene información de un registro específico.
     * @param id - Datos o identificador requerido (string)
     * @returns Array<Entidad>
     */
    @Get(':id/versiones')
  @RequireAccess('Gestor Documental', 2)
  getVersiones(@Param('id') id: string) {
    return this.documentosService.getVersiones(+id);
  }

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param id - Datos o identificador requerido (string)
     * @param versionId - Datos o identificador requerido (string)
     * @returns Objeto complejo / PrismaResponse
     */
    @Post(':id/versiones/:versionId/restaurar')
  @RequireAccess('Gestor Documental', 4)
  restaurarVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.documentosService.restaurarVersion(+id, +versionId);
  }

  /**
     * Obtiene información de un registro específico.
     * @param id - Datos o identificador requerido (string)
     * @returns Array<Entidad>
     */
    @Get(':id/workflow')
  @RequireAccess('Gestor Documental', 2)
  getWorkflow(@Param('id') id: string) {
    return this.documentosService.getWorkflow(+id);
  }

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param id - Datos o identificador requerido (string)
     * @param file - Datos o identificador requerido (Express.Multer.File)
     * @param body - Datos o identificador requerido (any)
     * @returns Array<Entidad>
     */
    @Post(':id/workflow/avanzar')
  @RequireAccess('Gestor Documental', 4)
  @UseInterceptors(FileInterceptor('archivo'))
  async avanzarFase(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('Debe subir el PDF firmado.');
    }
    return this.documentosService.avanzarFase(file, { ...body, documento_id: id });
  }

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param id - Datos o identificador requerido (string)
     * @param body - Datos o identificador requerido (any)
     * @returns Array<Entidad>
     */
    @Post(':id/workflow/rechazar')
  @RequireAccess('Gestor Documental', 4)
  rechazarFase(@Param('id') id: string, @Body() body: any) {
    return this.documentosService.rechazarFase(+id, body);
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