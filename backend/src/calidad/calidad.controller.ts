import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, UploadedFiles, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { CalidadService } from './calidad.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { CreateNcDto } from './dto/create-nc.dto';
import { UpdateNcDto } from './dto/update-nc.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('calidad')
@UseGuards(JwtAuthGuard, AccessGuard)
export class CalidadController {
  constructor(
    private readonly calidadService: CalidadService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Escribe un archivo en uploads/calidad/{codigoAuditoria}/{subcarpeta} y
   * devuelve la URL pública (/uploads/...) para persistirla en BD.
   */
  private guardarArchivo(file: Express.Multer.File, codigoAuditoria: string, subcarpeta: string): string {
    const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = extname(original);
    const name = original.replace(ext, '').replace(/\s+/g, '_');
    const filename = `${name}_${Date.now()}${ext}`;
    const p = join('.', 'uploads', 'calidad', codigoAuditoria, subcarpeta);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(join(p, filename), file.buffer);
    return `/uploads/calidad/${codigoAuditoria}/${subcarpeta}/${filename}`;
  }

  /**
   * Convierte los campos JSON enviados como string (vía FormData) en objetos.
   */
  private parsearJson(dto: any): any {
    const jsonCampos = ['documentos_referencia', 'equipo_auditor', 'cronograma', 'testificaciones'];
    const data: any = { ...dto };
    for (const campo of jsonCampos) {
      if (typeof data[campo] === 'string') {
        try {
          data[campo] = JSON.parse(data[campo]);
        } catch {
          data[campo] = undefined;
        }
      }
    }
    return data;
  }

  /**
   * Guarda un archivo de NC en uploads/calidad/noconformidades/{año}/{mes}
   * con el nombre NC-{numero}-{DDMMYYYY}{ext} y devuelve su URL pública.
   */
  private guardarArchivoNc(file: Express.Multer.File, numero: number): string {
    const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = extname(original);
    const now = new Date();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const año = now.getFullYear().toString();
    const mes = meses[now.getMonth()];
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const filename = `NC-${numero}-${dd}${mm}${now.getFullYear()}${ext}`;
    const p = join('.', 'uploads', 'calidad', 'noconformidades', año, mes);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(join(p, filename), file.buffer);
    return `/uploads/calidad/noconformidades/${año}/${mes}/${filename}`;
  }

  /**
   * Guarda un archivo (p.ej. plan de acción) en la carpeta general
   * uploads/calidad/noconformidades/{año}/{mes} y devuelve su URL pública.
   */
  private guardarArchivoGeneral(file: Express.Multer.File): string {
    const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = extname(original);
    const name = original.replace(ext, '').replace(/\s+/g, '_');
    const filename = `${name}_${Date.now()}${ext}`;
    const now = new Date();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const año = now.getFullYear().toString();
    const mes = meses[now.getMonth()];
    const p = join('.', 'uploads', 'calidad', 'noconformidades', año, mes);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(join(p, filename), file.buffer);
    return `/uploads/calidad/noconformidades/${año}/${mes}/${filename}`;
  }

  // ==================== AUDITORÍAS ====================

  @Post('auditorias')
  @RequireAccess('Gestion de Calidad', 5)
  @UseInterceptors(FileInterceptor('archivo_planificacion', { storage: memoryStorage() }))
  async createAuditoria(@Body() dto: CreateAuditoriaDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = this.parsearJson(dto);
    data.codigo = await this.calidadService.generarCodigoAuditoria();
    if (file) data.archivo_planificacion = this.guardarArchivo(file, data.codigo, 'planificaciones');
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

  @Get('auditorias/siguiente-codigo')
  @RequireAccess('Gestion de Calidad', 2)
  siguienteCodigoAuditoria() {
    return this.calidadService.generarCodigoAuditoria();
  }

  @Get('auditorias/:id')
  @RequireAccess('Gestion de Calidad', 2)
  findOneAuditoria(@Param('id', ParseIntPipe) id: number) {
    return this.calidadService.findOneAuditoria(id);
  }

  @Patch('auditorias/:id')
  @RequireAccess('Gestion de Calidad', 4)
  @UseInterceptors(FileInterceptor('archivo_planificacion', { storage: memoryStorage() }))
  async updateAuditoria(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAuditoriaDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = this.parsearJson(dto);
    if (file) {
      const auditoria = await this.prisma.auditoriaInterna.findUnique({ where: { id }, select: { codigo: true } });
      const codigo = data.codigo || auditoria?.codigo || 'SIN_CODIGO';
      data.archivo_planificacion = this.guardarArchivo(file, codigo, 'planificaciones');
    }
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
  @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage() }))
  async createNc(@Body() dto: CreateNcDto, @UploadedFile() file?: Express.Multer.File) {
    const data: any = { ...dto };
    const numero = await this.calidadService.siguienteNumeroNc();
    data.codigo = String(numero);
    if (file) data.archivo = this.guardarArchivoNc(file, numero);
    try {
      return await this.calidadService.createNc(data);
    } catch (error: any) {
      console.error('Error creando no conformidad:', error);
      if (error.code === 'P2002') throw new BadRequestException(`La no conformidad con número "${data.codigo}" ya existe`);
      if (error.code === 'P2003') throw new BadRequestException('El responsable seleccionado no existe');
      throw new InternalServerErrorException(error?.message || 'Error al crear la no conformidad');
    }
  }

  @Get('no-conformidades')
  @RequireAccess('Gestion de Calidad', 2)
  findAllNcs() {
    return this.calidadService.findAllNcs();
  }

  @Get('no-conformidades/siguiente-numero')
  @RequireAccess('Gestion de Calidad', 2)
  siguienteNumeroNc() {
    return this.calidadService.siguienteNumeroNc();
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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'archivo', maxCount: 1 },
    { name: 'plan_accion_archivo', maxCount: 1 },
  ], { storage: memoryStorage() }))
  async updateNc(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNcDto,
    @UploadedFiles() files?: { archivo?: Express.Multer.File[]; plan_accion_archivo?: Express.Multer.File[] },
  ) {
    const data: any = { ...dto };
    if (files?.archivo?.[0] || files?.plan_accion_archivo?.[0]) {
      const nc = await this.prisma.noConformidad.findUnique({
        where: { id },
        select: { codigo: true },
      });
      if (files?.archivo?.[0]) {
        data.archivo = this.guardarArchivoNc(files.archivo[0], parseInt(nc?.codigo || '0', 10) || 0);
      }
      if (files?.plan_accion_archivo?.[0]) {
        data.plan_accion = {
          ...(typeof data.plan_accion === 'object' && data.plan_accion !== null ? data.plan_accion : {}),
          archivo: this.guardarArchivoGeneral(files.plan_accion_archivo[0]),
          archivo_nombre: files.plan_accion_archivo[0].originalname,
        };
      }
    }
    try {
      return await this.calidadService.updateNc(id, data);
    } catch (error: any) {
      console.error('Error actualizando no conformidad:', error);
      if (error.code === 'P2002') throw new BadRequestException(`El número "${data.codigo}" ya existe`);
      if (error.code === 'P2025') throw new NotFoundException('La no conformidad no existe');
      if (error.code === 'P2003') throw new BadRequestException('El responsable seleccionado no existe');
      throw new InternalServerErrorException(error?.message || 'Error al actualizar la no conformidad');
    }
  }

  @Delete('no-conformidades/:id')
  @RequireAccess('Gestion de Calidad', 5)
  removeNc(@Param('id', ParseIntPipe) id: number) {
    return this.calidadService.removeNc(id);
  }
}
