import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { CircuitoDocumento } from '@prisma/client';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
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
  findAll(@Query('carpeta_id') carpetaId?: string) {
    return this.documentosService.findAll(carpetaId ? parseInt(carpetaId, 10) : undefined);
  }

  @Get('circuitos')
  getCircuitos() {
    // Devuelve un arreglo con todos los valores del Enum: ['SIN_CLASIFICAR', 'ALTA_FRECUENCIA', ...]
    return Object.values(CircuitoDocumento);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.documentosService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentosService.remove(+id);
  }
}