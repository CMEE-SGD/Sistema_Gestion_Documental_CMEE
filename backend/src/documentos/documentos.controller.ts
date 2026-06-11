import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { CircuitoDocumento } from '@prisma/client';

// 👇 Importaciones de Seguridad
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
  ) {
    if (!file) {
      throw new BadRequestException('El archivo PDF es obligatorio.');
    }
    return this.documentosService.create(file, body);
  }

  @Get()
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Ver documentos
  findAll(@Query('carpeta_id') carpetaId?: string) {
    return this.documentosService.findAll(carpetaId ? parseInt(carpetaId, 10) : undefined);
  }

  @Get('circuitos')
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Obtener listado de catálogos
  getCircuitos() {
    // Devuelve un arreglo con todos los valores del Enum: ['SIN_CLASIFICAR', 'ALTA_FRECUENCIA', ...]
    return Object.values(CircuitoDocumento);
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