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


@ApiTags('Personas')
@Controller('personas')
@UseGuards(JwtAuthGuard, AccessGuard)

export class PersonasController {
  constructor(private readonly personasService: PersonasService) { }

  @Post()
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Crear persona con foto y múltiples documentos' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto', maxCount: 1 },
    { name: 'documentos', maxCount: 10 }
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === 'foto') {
          cb(null, './uploads/fotosPersonas');
        } else {
          const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
          const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
          const path = join('.', 'uploads', 'documentosPersona', `${nombre}_${apellidos}`);

          if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        }
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

    if (archivos.foto && archivos.foto.length > 0) {
      createPersonaDto.foto_ruta = `/uploads/fotosPersonas/${archivos.foto[0].filename}`;
    }

    try { if (typeof createPersonaDto.roles === 'string') createPersonaDto.roles = JSON.parse(createPersonaDto.roles); } catch (e) { createPersonaDto.roles = []; }
    try { if (typeof createPersonaDto.puestos_asignados === 'string') createPersonaDto.puestos_asignados = JSON.parse(createPersonaDto.puestos_asignados); } catch (e) { createPersonaDto.puestos_asignados = []; }

    if (typeof createPersonaDto.activo === 'string') {
      createPersonaDto.activo = createPersonaDto.activo === 'true';
    }

    try {
      const persona = await this.personasService.create(createPersonaDto);

      // Guardar Documentos
      if (archivos.documentos && archivos.documentos.length > 0) {
        const nombre = (createPersonaDto.nombre || 'Usuario').replace(/\s+/g, '_');
        const apellidos = (createPersonaDto.apellidos || '').replace(/\s+/g, '_');
        const nombreCarpeta = `${nombre}_${apellidos}`;

        const docsToSave = archivos.documentos.map(doc => ({
          persona_id: persona.id,
          nombre_archivo: doc.originalname,
          ruta: `/uploads/documentosPersona/${nombreCarpeta}/${doc.filename}`,
          tipo_documento: 'Documento adjunto'
          // 👇 FIX 2: Ya NO enviamos 'peso_bytes' porque no existe en tu base de datos
        }));

        await this.personasService.guardarDocumentos(docsToSave);
      }

      return persona;
    } catch (error: any) {
      // 👇 FIX 3: Quitamos el alert() que bloqueaba el servidor. 
      // Ahora solo lo imprime en consola y lo pasa al frontend.
      console.error("=== ERROR EN EL SERVIDOR ===");
      console.error(error);
      throw error;
    }
  }

  @Get()
  @RequireAccess('Recursos Humanos', 2) // PDF: Nivel 2 mínimo para ver operativas
  @ApiOperation({ summary: 'Listar todas las personas activas' })
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  @ApiOperation({ summary: 'Obtener una persona por ID con sus roles y puestos' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 4)
  @ApiOperation({ summary: 'Actualizar datos de una persona, foto y agregar documentos' })
  // 👇 Nos aseguramos de que acepte ambos campos
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto', maxCount: 1 },
    { name: 'documentos', maxCount: 10 }
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === 'foto') {
          cb(null, './uploads/fotosPersonas');
        } else {
          // Gracias al frontend, ahora esto siempre tendrá los datos correctos
          const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
          const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
          const path = join('.', 'uploads', 'documentosPersona', `${nombre}_${apellidos}`);
          
          try {
            if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
          } catch(e) {}
          
          cb(null, path);
        }
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

    if (archivos.foto && archivos.foto.length > 0) {
      updatePersonaDto.foto_ruta = `/uploads/fotosPersonas/${archivos.foto[0].filename}`;
    }

    try { if (typeof updatePersonaDto.roles === 'string') updatePersonaDto.roles = JSON.parse(updatePersonaDto.roles); } catch (e) { updatePersonaDto.roles = undefined; }
    try { if (typeof updatePersonaDto.puestos_asignados === 'string') updatePersonaDto.puestos_asignados = JSON.parse(updatePersonaDto.puestos_asignados); } catch (e) { updatePersonaDto.puestos_asignados = undefined; }
    
    if (typeof updatePersonaDto.activo === 'string') updatePersonaDto.activo = updatePersonaDto.activo === 'true';

    // Actualiza la persona en la base de datos
    const personaActualizada = await this.personasService.update(id, updatePersonaDto);

    // Registra los documentos en la base de datos
    if (archivos.documentos && archivos.documentos.length > 0) {
      const nombre = (updatePersonaDto.nombre || personaActualizada.nombre).replace(/\s+/g, '_');
      const apellidos = (updatePersonaDto.apellidos || personaActualizada.apellidos).replace(/\s+/g, '_');
      const nombreCarpeta = `${nombre}_${apellidos}`;

      const docsToSave = archivos.documentos.map(doc => ({
        persona_id: id,
        nombre_archivo: doc.originalname,
        ruta: `/uploads/documentosPersona/${nombreCarpeta}/${doc.filename}`,
        tipo_documento: 'Documento adjunto'
      }));

      await this.personasService.guardarDocumentos(docsToSave);
    }

    return personaActualizada;
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Desactivar una persona (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }

  @Delete('documento/:id')
  @RequireAccess('Recursos Humanos', 4) // Nivel de permiso requerido
  @ApiOperation({ summary: 'Eliminar un documento adjunto de una persona' })
  removeDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.eliminarDocumento(id);
  }

}