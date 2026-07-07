import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFiles, ConflictException, InternalServerErrorException
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { PersonasService } from './personas.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@ApiTags('Personas')
@Controller('personas')
@UseGuards(JwtAuthGuard, AccessGuard)
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Crear persona' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'foto', maxCount: 1 }, { name: 'documentos', maxCount: 10 }], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
        const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
        const cedula = (req.body.cedula_identidad || '0000000000').replace(/\s+/g, '');
        const p = join('.', 'uploads', 'Personas', `${nombre}_${apellidos}_${cedula}`);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname === 'foto' ? `Foto_${uniqueSuffix}${ext}` : `${file.originalname.split('.')[0]}_${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async create(@Body() dto: any, @UploadedFiles() files: { foto?: Express.Multer.File[]; documentos?: Express.Multer.File[] }) {
    delete dto.eliminar_foto;
    if (files.foto) dto.foto_ruta = `/uploads/Personas/${(dto.nombre || 'U').replace(/\s+/g, '_')}_${(dto.apellidos || '').replace(/\s+/g, '_')}_${(dto.cedula_identidad || '0').replace(/\s+/g, '')}/${files.foto[0].filename}`;
    
    // PATCH: try-catch defensivo contra JSON malformado
    try { dto.roles = typeof dto.roles === 'string' ? JSON.parse(dto.roles) : []; } catch { dto.roles = []; }
    try { dto.puestos_asignados = typeof dto.puestos_asignados === 'string' ? JSON.parse(dto.puestos_asignados) : []; } catch { dto.puestos_asignados = []; }
    dto.activo = dto.activo === 'true';

    // PATCH: whitelist manual (ValidationPipe global inefectivo con @Body() any)
    const camposCreate = ['grado', 'nombre', 'apellidos', 'cedula_identidad', 'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia', 'celular_1', 'celular_2', 'email_1', 'email_2', 'foto_ruta', 'hoja_vida_ruta', 'tipo_recurso', 'idioma', 'estado', 'eliminar_foto', 'roles', 'puestos_asignados', 'activo'];
    for (const key of Object.keys(dto)) { if (!camposCreate.includes(key)) delete dto[key]; }

    const persona = await this.personasService.create(dto);
    if (files.documentos) {
      await this.personasService.guardarDocumentos(files.documentos.map(d => ({ persona_id: persona.id, nombre_archivo: d.originalname, ruta: d.path, tipo_documento: 'Adjunto' })));
    }
    return persona;
  }

  @Get()
  @RequireAccess('Recursos Humanos', 1)
  findAll() { return this.personasService.findAll(); }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  findOne(@Param('id', ParseIntPipe) id: number) { return this.personasService.findOne(id); }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 4)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'foto', maxCount: 1 }, { name: 'documentos', maxCount: 10 }], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const nombre = (req.body.nombre || 'U').replace(/\s+/g, '_');
        const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
        const cedula = (req.body.cedula_identidad || '0').replace(/\s+/g, '');
        const p = join('.', 'uploads', 'Personas', `${nombre}_${apellidos}_${cedula}`);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
      },
      filename: (req, file, cb) => { const ext = extname(file.originalname); cb(null, `${Date.now()}${ext}`); },
    }),
  }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @UploadedFiles() files: { foto?: Express.Multer.File[]; documentos?: Express.Multer.File[] }) {
    delete dto.eliminar_foto;

    // Multer entrega todo como strings; parseamos los campos compuestos
    // PATCH: try-catch defensivo contra JSON malformado
    try { dto.roles = typeof dto.roles === 'string' ? JSON.parse(dto.roles) : dto.roles; } catch { dto.roles = dto.roles ?? []; }
    try { dto.puestos_asignados = typeof dto.puestos_asignados === 'string' ? JSON.parse(dto.puestos_asignados) : dto.puestos_asignados; } catch { dto.puestos_asignados = dto.puestos_asignados ?? []; }

    // PATCH: whitelist manual (ValidationPipe global inefectivo con @Body() any)
    const camposUpdate = ['grado', 'nombre', 'apellidos', 'cedula_identidad', 'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia', 'celular_1', 'celular_2', 'email_1', 'email_2', 'foto_ruta', 'hoja_vida_ruta', 'tipo_recurso', 'idioma', 'estado', 'eliminar_foto', 'roles', 'puestos_asignados', 'puestos'];
    for (const key of Object.keys(dto)) { if (!camposUpdate.includes(key)) delete dto[key]; }

    const persona = await this.personasService.update(id, dto);
    return persona;
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  remove(@Param('id', ParseIntPipe) id: number) { return this.personasService.remove(id); }

  @Delete('documento/:id')
  @RequireAccess('Recursos Humanos', 4)
  removeDocumento(@Param('id', ParseIntPipe) id: number) { return this.personasService.eliminarDocumento(id); }
}