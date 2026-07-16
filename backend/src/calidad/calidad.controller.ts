import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { CalidadService } from './calidad.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { CreateNcDto } from './dto/create-nc.dto';
import { UpdateNcDto } from './dto/update-nc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('calidad')
@UseGuards(JwtAuthGuard, AccessGuard)
export class CalidadController {
  constructor(private readonly calidadService: CalidadService) {}

  // ==================== AUDITORÍAS ====================

  @Post('auditorias')
  @RequireAccess('Gestion de Calidad', 5)
  @UseInterceptors(FileInterceptor('archivo_planificacion', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const p = join('.', 'uploads', 'calidad', 'planificaciones');
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
      },
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname);
        const name = file.originalname.replace(ext, '').replace(/\s+/g, '_');
        cb(null, `${name}_${Date.now()}${ext}`);
      },
    }),
  }))
  async createAuditoria(@Body() dto: CreateAuditoriaDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = { ...dto };
    if (file) data.archivo_planificacion = `/uploads/calidad/planificaciones/${file.filename}`;
    try {
      return await this.calidadService.createAuditoria(data);
    } catch (error: any) {
      console.error('Error creando auditoría:', error);
      if (error.code === 'P2002') throw new BadRequestException(`El código "${data.codigo}" ya existe`);
      if (error.code === 'P2003') throw new BadRequestException('El responsable seleccionado no existe');
      throw new InternalServerErrorException(error?.message || 'Error al crear la auditoría');
    }
  }

  @Get('auditorias')
  @RequireAccess('Gestion de Calidad', 2)
  findAllAuditorias() {
    return this.calidadService.findAllAuditorias();
  }

  @Get('auditorias/:id')
  @RequireAccess('Gestion de Calidad', 2)
  findOneAuditoria(@Param('id', ParseIntPipe) id: number) {
    return this.calidadService.findOneAuditoria(id);
  }

  @Patch('auditorias/:id')
  @RequireAccess('Gestion de Calidad', 4)
  @UseInterceptors(FileInterceptor('archivo_planificacion', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const p = join('.', 'uploads', 'calidad', 'planificaciones');
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
      },
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname);
        const name = file.originalname.replace(ext, '').replace(/\s+/g, '_');
        cb(null, `${name}_${Date.now()}${ext}`);
      },
    }),
  }))
  async updateAuditoria(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAuditoriaDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = { ...dto };
    if (file) data.archivo_planificacion = `/uploads/calidad/planificaciones/${file.filename}`;
    try {
      return await this.calidadService.updateAuditoria(id, data);
    } catch (error: any) {
      console.error('Error actualizando auditoría:', error);
      if (error.code === 'P2002') throw new BadRequestException(`El código "${data.codigo}" ya existe`);
      if (error.code === 'P2003') throw new BadRequestException('El responsable seleccionado no existe');
      throw new InternalServerErrorException(error?.message || 'Error al actualizar la auditoría');
    }
  }

  @Delete('auditorias/:id')
  @RequireAccess('Gestion de Calidad', 5)
  removeAuditoria(@Param('id', ParseIntPipe) id: number) {
    return this.calidadService.removeAuditoria(id);
  }

  // ==================== NO CONFORMIDADES ====================

  @Post('no-conformidades')
  @RequireAccess('Gestion de Calidad', 5)
  createNc(@Body() dto: CreateNcDto) {
    return this.calidadService.createNc(dto);
  }

  @Get('auditorias/:auditoriaId/no-conformidades')
  @RequireAccess('Gestion de Calidad', 2)
  findNcsByAuditoria(@Param('auditoriaId', ParseIntPipe) auditoriaId: number) {
    return this.calidadService.findNcsByAuditoria(auditoriaId);
  }

  @Get('no-conformidades/:id')
  @RequireAccess('Gestion de Calidad', 2)
  findOneNc(@Param('id', ParseIntPipe) id: number) {
    return this.calidadService.findOneNc(id);
  }

  @Patch('no-conformidades/:id')
  @RequireAccess('Gestion de Calidad', 4)
  updateNc(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNcDto) {
    return this.calidadService.updateNc(id, dto);
  }

  @Delete('no-conformidades/:id')
  @RequireAccess('Gestion de Calidad', 5)
  removeNc(@Param('id', ParseIntPipe) id: number) {
    return this.calidadService.removeNc(id);
  }
}
