import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFiles, ConflictException, InternalServerErrorException, BadRequestException, Query
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

// Multer arma la carpeta de destino con nombre/apellidos/cédula tal como
// llegan en el body, ANTES de que corra cualquier validación del controller
// (el callback `destination` se ejecuta durante el parseo del multipart).
// Sin sanitizar, un valor como "../../etc" permitiría escribir fuera de
// uploads/Personas/. Se usa el mismo sanitizador aquí y al calcular
// `foto_ruta`, para que el nombre de carpeta coincida en ambos lados.
function sanitizarSegmentoRuta(valor: string): string {
  return valor.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 100) || '_';
}

// 'foto' debe ser una imagen; 'documentos' acepta PDF o imágenes (hojas de
// vida escaneadas, cédulas, etc.). Nunca se lanza dentro del fileFilter — un
// archivo rechazado simplemente no llega en `files`, igual que en documentos.
function filtroArchivosPersona(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: null, aceptar: boolean) => void,
) {
  if (file.fieldname === 'foto') {
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
    return;
  }
  cb(null, file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/'));
}

const LIMITES_ARCHIVOS_PERSONA = { fileSize: 10 * 1024 * 1024 }; // 10MB por archivo

// Multer entrega todos los campos como string (incluso los vacíos, cuando el
// formulario no los llenó); sin esto, @IsDateString/@IsEnum/etc. rechazarían
// un campo opcional simplemente por venir como '' en vez de estar ausente.
function limpiarVacios(dto: Record<string, unknown>) {
  for (const key of Object.keys(dto)) {
    if (dto[key] === '') delete dto[key];
  }
}

// La ValidationPipe global no corre aquí porque el body se tipa `any` (lo
// exige FileFieldsInterceptor) — validamos manualmente contra el DTO real
// antes de tocar la base de datos.
async function validarODevolverError<T extends object>(
  dtoClase: new () => T,
  datos: Record<string, unknown>,
) {
  const instancia = plainToInstance(dtoClase, datos);
  const errores = await validate(instancia as object);
  if (errores.length > 0) {
    const mensajes = errores.flatMap((e) => Object.values(e.constraints ?? {}));
    throw new BadRequestException(mensajes);
  }
}

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
        const nombre = sanitizarSegmentoRuta(req.body.nombre || 'Usuario');
        const apellidos = sanitizarSegmentoRuta(req.body.apellidos || '');
        const cedula = sanitizarSegmentoRuta(req.body.cedula_identidad || '0000000000');
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
    fileFilter: filtroArchivosPersona,
    limits: LIMITES_ARCHIVOS_PERSONA,
  }))
  async create(@Body() dto: any, @UploadedFiles() files: { foto?: Express.Multer.File[]; documentos?: Express.Multer.File[] }) {
    delete dto.eliminar_foto;
    if (files.foto) dto.foto_ruta = `/uploads/Personas/${sanitizarSegmentoRuta(dto.nombre || 'U')}_${sanitizarSegmentoRuta(dto.apellidos || '')}_${sanitizarSegmentoRuta(dto.cedula_identidad || '0')}/${files.foto[0].filename}`;
    
    // PATCH: try-catch defensivo contra JSON malformado
    try { dto.roles = typeof dto.roles === 'string' ? JSON.parse(dto.roles) : []; } catch { dto.roles = []; }
    try { dto.puestos_asignados = typeof dto.puestos_asignados === 'string' ? JSON.parse(dto.puestos_asignados) : []; } catch { dto.puestos_asignados = []; }
    dto.activo = dto.activo === 'true';

    // PATCH: whitelist manual (ValidationPipe global inefectivo con @Body() any)
    const camposCreate = ['grado', 'nombre', 'apellidos', 'cedula_identidad', 'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia', 'celular_1', 'celular_2', 'email_1', 'email_2', 'foto_ruta', 'hoja_vida_ruta', 'tipo_recurso', 'idioma', 'estado', 'eliminar_foto', 'roles', 'puestos_asignados', 'activo'];
    for (const key of Object.keys(dto)) { if (!camposCreate.includes(key)) delete dto[key]; }

    limpiarVacios(dto);
    await validarODevolverError(CreatePersonaDto, dto);

    return this.personasService.create(
      dto,
      files.documentos?.map((d) => ({
        nombre_archivo: d.originalname,
        ruta: d.path,
        tipo_documento: 'Adjunto',
      })),
    );
  }

  @Get()
  @RequireAccess('Recursos Humanos', 1)
  findAll(@Query('laboratorio_id') laboratorioId?: string) {
    return this.personasService.findAll(
      laboratorioId ? +laboratorioId : undefined,
    );
  }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  findOne(@Param('id', ParseIntPipe) id: number) { return this.personasService.findOne(id); }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 4)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'foto', maxCount: 1 }, { name: 'documentos', maxCount: 10 }], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const nombre = sanitizarSegmentoRuta(req.body.nombre || 'U');
        const apellidos = sanitizarSegmentoRuta(req.body.apellidos || '');
        const cedula = sanitizarSegmentoRuta(req.body.cedula_identidad || '0');
        const p = join('.', 'uploads', 'Personas', `${nombre}_${apellidos}_${cedula}`);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        cb(null, p);
      },
      filename: (req, file, cb) => { const ext = extname(file.originalname); cb(null, `${Date.now()}${ext}`); },
    }),
    fileFilter: filtroArchivosPersona,
    limits: LIMITES_ARCHIVOS_PERSONA,
  }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @UploadedFiles() files: { foto?: Express.Multer.File[]; documentos?: Express.Multer.File[] }) {
    // Multer entrega todo como strings; parseamos los campos compuestos
    // PATCH: try-catch defensivo contra JSON malformado
    try { dto.roles = typeof dto.roles === 'string' ? JSON.parse(dto.roles) : dto.roles; } catch { dto.roles = dto.roles ?? []; }
    try { dto.puestos_asignados = typeof dto.puestos_asignados === 'string' ? JSON.parse(dto.puestos_asignados) : dto.puestos_asignados; } catch { dto.puestos_asignados = dto.puestos_asignados ?? []; }

    // Si llegó una foto nueva, calculamos su ruta igual que en create()
    if (files.foto?.[0]) {
      const nombre = sanitizarSegmentoRuta(dto.nombre || 'U');
      const apellidos = sanitizarSegmentoRuta(dto.apellidos || '');
      const cedula = sanitizarSegmentoRuta(dto.cedula_identidad || '0');
      dto.foto_ruta = `/uploads/Personas/${nombre}_${apellidos}_${cedula}/${files.foto[0].filename}`;
      dto.eliminar_foto = false;
    }

    // PATCH: whitelist manual (ValidationPipe global inefectivo con @Body() any)
    const camposUpdate = ['grado', 'nombre', 'apellidos', 'cedula_identidad', 'fecha_nacimiento', 'sexo', 'domicilio', 'ciudad', 'provincia', 'celular_1', 'celular_2', 'email_1', 'email_2', 'foto_ruta', 'hoja_vida_ruta', 'tipo_recurso', 'idioma', 'estado', 'eliminar_foto', 'roles', 'puestos_asignados', 'puestos'];
    for (const key of Object.keys(dto)) { if (!camposUpdate.includes(key)) delete dto[key]; }

    limpiarVacios(dto);
    await validarODevolverError(UpdatePersonaDto, dto);

    const persona = await this.personasService.update(
      id,
      dto,
      files.documentos?.map((d) => ({
        nombre_archivo: d.originalname,
        ruta: d.path,
        tipo_documento: 'Adjunto',
      })),
    );
    return persona;
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  remove(@Param('id', ParseIntPipe) id: number) { return this.personasService.remove(id); }

  @Delete('documento/:id')
  @RequireAccess('Recursos Humanos', 4)
  removeDocumento(@Param('id', ParseIntPipe) id: number) { return this.personasService.eliminarDocumento(id); }
}