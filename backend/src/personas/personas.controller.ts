import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadedFiles } from '@nestjs/common';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Personas. */
@ApiTags('Personas')
@Controller('personas')
@UseGuards(JwtAuthGuard, AccessGuard)
export class PersonasController {
  constructor(private readonly personasService: PersonasService) { }

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param createPersonaDto - Datos o identificador requerido (any)
     * @param files - Datos o identificador requerido (Objeto complejo / PrismaResponse)
     * @returns Array<Entidad>
     */
    @Post()
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Crear persona con foto y múltiples documentos' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto', maxCount: 1 },
    { name: 'documentos', maxCount: 10 }
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
        const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
        const cedula = (req.body.cedula_identidad || '0000000000').replace(/\s+/g, '');
        const path = join('.', 'uploads', 'Personas', `${nombre}_${apellidos}_${cedula}`);

        try {
          if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        } catch (e) {
          console.error('Error creando carpeta de persona:', e);
        }
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        if (file.fieldname === 'foto') {
          const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
          const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
          cb(null, `Foto_de_${nombre}_${apellidos}_${uniqueSuffix}${ext}`);
        } else {
          const nombreOriginal = file.originalname.split('.')[0].replace(/\s+/g, '_');
          cb(null, `${nombreOriginal}_${uniqueSuffix}${ext}`);
        }
      }
    })
  }))
  async create(
    @Body() createPersonaDto: any,
    @UploadedFiles() files: { foto?: Express.Multer.File[], documentos?: Express.Multer.File[] }
  ) {
    const archivos = files || {};

    // ✅ Limpiamos errores de código anteriores en create
    delete createPersonaDto.eliminar_foto;

    if (archivos.foto && archivos.foto.length > 0) {
      const nombre = (createPersonaDto.nombre || 'Usuario').replace(/\s+/g, '_');
      const apellidos = (createPersonaDto.apellidos || '').replace(/\s+/g, '_');
      const cedula = (createPersonaDto.cedula_identidad || '0000000000').replace(/\s+/g, '');
      createPersonaDto.foto_ruta = `/uploads/Personas/${nombre}_${apellidos}_${cedula}/${archivos.foto[0].filename}`;
    }

    try { if (typeof createPersonaDto.roles === 'string') createPersonaDto.roles = JSON.parse(createPersonaDto.roles); } catch (e) { createPersonaDto.roles = []; }
    try { if (typeof createPersonaDto.puestos_asignados === 'string') createPersonaDto.puestos_asignados = JSON.parse(createPersonaDto.puestos_asignados); } catch (e) { createPersonaDto.puestos_asignados = []; }

    if (typeof createPersonaDto.activo === 'string') {
      createPersonaDto.activo = createPersonaDto.activo === 'true';
    }

    try {
      const persona = await this.personasService.create(createPersonaDto);

      if (archivos.documentos && archivos.documentos.length > 0) {
        const nombre = (createPersonaDto.nombre || 'Usuario').replace(/\s+/g, '_');
        const apellidos = (createPersonaDto.apellidos || '').replace(/\s+/g, '_');
        const cedula = (createPersonaDto.cedula_identidad || '0000000000').replace(/\s+/g, '');
        const nombreCarpeta = `${nombre}_${apellidos}_${cedula}`;

        const docsToSave = archivos.documentos.map(doc => ({
          persona_id: persona.id,
          nombre_archivo: doc.originalname,
          ruta: `/uploads/Personas/${nombreCarpeta}/${doc.filename}`,
          tipo_documento: 'Documento adjunto'
        }));

        await this.personasService.guardarDocumentos(docsToSave);
      }
      return persona;
    } catch (error: any) {
      console.error("=== ERROR EN EL SERVIDOR ===");
      console.error(error);
      throw error;
    }
  }

  /**
     * Obtiene información de múltiples registros.
     * @returns Array<Entidad>
     */
    @Get()
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Listar todas las personas activas' })
  findAll() {
    return this.personasService.findAll();
  }

  /**
     * Obtiene información de un registro específico.
     * @param id - Datos o identificador requerido (number)
     * @returns Array<Entidad>
     */
    @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Obtener una persona por ID con sus roles y puestos' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  /**
     * Actualiza parcialmente la información de un registro existente.
     * @param id - Datos o identificador requerido (number)
     * @param updatePersonaDto - Datos o identificador requerido (any)
     * @param files - Datos o identificador requerido (Objeto complejo / PrismaResponse)
     * @returns Array<Entidad>
     */
    @Patch(':id')
  @RequireAccess('Recursos Humanos', 4)
  @ApiOperation({ summary: 'Actualizar datos de una persona, foto y agregar documentos' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto', maxCount: 1 },
    { name: 'documentos', maxCount: 10 }
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
        const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
        const cedula = (req.body.cedula_identidad || '0000000000').replace(/\s+/g, '');
        const path = join('.', 'uploads', 'Personas', `${nombre}_${apellidos}_${cedula}`);

        try {
          if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        } catch (e) {
          console.error('Error creando carpeta de persona:', e);
        }
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        if (file.fieldname === 'foto') {
          const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
          const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
          cb(null, `Foto_de_${nombre}_${apellidos}_${uniqueSuffix}${ext}`);
        } else {
          const nombreOriginal = file.originalname.split('.')[0].replace(/\s+/g, '_');
          cb(null, `${nombreOriginal}_${uniqueSuffix}${ext}`);
        }
      }
    })
  }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: any,
    @UploadedFiles() files: { foto?: Express.Multer.File[], documentos?: Express.Multer.File[] }
  ) {
    const archivos = files || {};
    
    // ✅ ACTUALIZAR RUTA DE FOTO CON NUEVA ESTRUCTURA
    if (archivos.foto && archivos.foto.length > 0) {
        // Obtener la persona actual para construir la ruta correcta
        const personaActual = await this.personasService.findOne(id);
        const nombre = (updatePersonaDto.nombre || personaActual.nombre).replace(/\s+/g, '_');
        const apellidos = (updatePersonaDto.apellidos || personaActual.apellidos).replace(/\s+/g, '_');
        const cedula = (updatePersonaDto.cedula_identidad || personaActual.cedula_identidad || '0000000000').replace(/\s+/g, '');
        
        // ✅ ELIMINAR FOTO ANTERIOR SI EXISTE
        if (personaActual.foto_ruta) {
            const rutaAnterior = join(process.cwd(), personaActual.foto_ruta.startsWith('/') 
                ? personaActual.foto_ruta.substring(1) 
                : personaActual.foto_ruta);
            
            if (fs.existsSync(rutaAnterior)) {
                try {
                    fs.unlinkSync(rutaAnterior);
                } catch (error) {
                    console.error(`Aviso: No se pudo eliminar la foto anterior: ${rutaAnterior}`, error);
                }
            }
        }
        
        updatePersonaDto.foto_ruta = `/uploads/personas/${nombre}_${apellidos}_${cedula}/${archivos.foto[0].filename}`;
    }

    try { if (typeof updatePersonaDto.roles === 'string') updatePersonaDto.roles = JSON.parse(updatePersonaDto.roles); } catch (e) { updatePersonaDto.roles = undefined; }
    try { if (typeof updatePersonaDto.puestos_asignados === 'string') updatePersonaDto.puestos_asignados = JSON.parse(updatePersonaDto.puestos_asignados); } catch (e) { updatePersonaDto.puestos_asignados = undefined; }

    if (typeof updatePersonaDto.activo === 'string') updatePersonaDto.activo = updatePersonaDto.activo === 'true';

    const personaActualizada = await this.personasService.update(id, updatePersonaDto);

    if (archivos.documentos && archivos.documentos.length > 0) {
      const nombre = (updatePersonaDto.nombre || personaActualizada.nombre).replace(/\s+/g, '_');
      const apellidos = (updatePersonaDto.apellidos || personaActualizada.apellidos).replace(/\s+/g, '_');
      const cedula = (updatePersonaDto.cedula_identidad || personaActualizada.cedula_identidad || '0000000000').replace(/\s+/g, '');
      const nombreCarpeta = `${nombre}_${apellidos}_${cedula}`;

      const docsToSave = archivos.documentos.map(doc => ({
        persona_id: id,
        nombre_archivo: doc.originalname,
        ruta: `/uploads/Personas/${nombreCarpeta}/${doc.filename}`,
        tipo_documento: 'Documento adjunto'
      }));

      await this.personasService.guardarDocumentos(docsToSave);
    }

    return personaActualizada;
  }

  /**
     * Elimina lógicamente o inactiva un registro en el sistema.
     * @param id - Datos o identificador requerido (number)
     * @returns Entidad | PrismaResponse
     */
    @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Desactivar una persona (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }

  /**
     * Elimina lógicamente o inactiva un registro en el sistema.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    @Delete('documento/:id')
  @RequireAccess('Recursos Humanos', 4)
  @ApiOperation({ summary: 'Eliminar un documento adjunto de una persona' })
  removeDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.eliminarDocumento(id);
  }
}