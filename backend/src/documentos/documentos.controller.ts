import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Query, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

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
  @RequireAccess('Gestor Documental', 2)
  findAll(@Query('carpeta_id') carpetaId?: string, @Req() req?: any) {
    return this.documentosService.findAll(
      carpetaId ? parseInt(carpetaId, 10) : undefined,
      req.user?.id,
    );
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
    return this.documentosService.createVersion(file, { ...body, documento_id: id });
  }

  @Get(':id/versiones')
  @RequireAccess('Gestor Documental', 2)
  getVersiones(@Param('id') id: string) {
    return this.documentosService.getVersiones(+id);
  }

  @Post(':id/versiones/:versionId/restaurar')
  @RequireAccess('Gestor Documental', 4)
  restaurarVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.documentosService.restaurarVersion(+id, +versionId);
  }

  @Get(':id/workflow')
  @RequireAccess('Gestor Documental', 2)
  getWorkflow(@Param('id') id: string) {
    return this.documentosService.getWorkflow(+id);
  }

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

  @Post(':id/workflow/rechazar')
  @RequireAccess('Gestor Documental', 4)
  rechazarFase(@Param('id') id: string, @Body() body: any) {
    return this.documentosService.rechazarFase(+id, body);
  }

  @Get(':id')
  @RequireAccess('Gestor Documental', 2)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.documentosService.findOne(+id, req.user?.id);
  }

  @Patch(':id')
  @RequireAccess('Gestor Documental', 4)
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.documentosService.update(+id, data, req.user?.id);
  }

  @Delete(':id')
  @RequireAccess('Gestor Documental', 5)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.documentosService.remove(+id, req.user?.id);
  }
}