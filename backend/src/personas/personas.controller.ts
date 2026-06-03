import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadedFiles } from '@nestjs/common';
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
  // CAMBIO AQUÍ: FileFieldsInterceptor permite recibir ambos campos
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto', maxCount: 1 },
    { name: 'documentos', maxCount: 10 }
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === 'foto') {
          cb(null, './uploads/fotosPersonas');
        } else {
          // Lógica de carpeta dinámica para documentos
          const nombre = (req.body.nombre || 'Usuario').replace(/\s+/g, '_');
          const apellidos = (req.body.apellidos || '').replace(/\s+/g, '_');
          const path = join('.', 'uploads', 'documentosPersona', `${nombre}_${apellidos}`);
          if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
          cb(null, path);
        }
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        const fecha = Date.now();
        if (file.fieldname === 'foto') {
          cb(null, `Foto_de_${req.body.nombre}_${req.body.apellidos}_${fecha}${ext}`);
        } else {
          cb(null, `${file.originalname.split('.')[0]}_${fecha}${ext}`);
        }
      }
    })
  }))
  async create(
    @Body() createPersonaDto: any,
    @UploadedFiles() files: { foto?: Express.Multer.File[], documentos?: Express.Multer.File[] } // CAMBIO AQUÍ
  ) {
    // Procesamiento de datos (igual que antes)
    if (files.foto) createPersonaDto.foto_ruta = `/uploads/fotosPersonas/${files.foto[0].filename}`;

    // Parseo de JSON
    if (typeof createPersonaDto.roles === 'string') createPersonaDto.roles = JSON.parse(createPersonaDto.roles);
    if (typeof createPersonaDto.puestos_asignados === 'string') createPersonaDto.puestos_asignados = JSON.parse(createPersonaDto.puestos_asignados);

    const persona = await this.personasService.create(createPersonaDto);

    // Guardar registros en la tabla DocumentoPersona
    if (files.documentos) {
      const docsToSave = files.documentos.map(doc => ({
        persona_id: persona.id,
        nombre_archivo: doc.originalname,
        ruta: doc.path,
        tipo_documento: 'Documento adjunto'
      }));
      // Asegúrate de tener un método en tu servicio para insertar estos documentos
      await this.personasService.guardarDocumentos(docsToSave);
    }

    return persona;
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
  @ApiOperation({ summary: 'Actualizar datos de una persona y sus roles' })
  // 👇 1. AGREGAMOS EL INTERCEPTOR DE ARCHIVOS
  @UseInterceptors(FileInterceptor('foto', {
    storage: diskStorage({
      destination: './uploads/fotosPersonas',
      filename: (req, file, cb) => {
        let nombre = req.body.nombre || 'Usuario';
        let apellidos = req.body.apellidos || '';

        nombre = nombre.trim().replace(/\s+/g, '_');
        apellidos = apellidos.trim().replace(/\s+/g, '_');

        const fechaCorta = Date.now();
        const ext = extname(file.originalname);

        cb(null, `Foto_de_${nombre}_${apellidos}_${fechaCorta}${ext}`);
      }
    })
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: any, // Cambiamos temporalmente a any
    @UploadedFile() file: Express.Multer.File // Atrapamos el archivo
  ) {
    // 2. Si viene una nueva foto, sobrescribimos la ruta en el DTO
    if (file) {
      updatePersonaDto.foto_ruta = `/uploads/fotosPersonas/${file.filename}`;
    }

    // 3. Volvemos a parsear los arreglos y booleanos (porque llegaron como strings en el FormData)
    if (typeof updatePersonaDto.roles === 'string') {
      updatePersonaDto.roles = JSON.parse(updatePersonaDto.roles);
    }
    if (typeof updatePersonaDto.puestos_asignados === 'string') {
      updatePersonaDto.puestos_asignados = JSON.parse(updatePersonaDto.puestos_asignados);
    }
    if (typeof updatePersonaDto.activo === 'string') {
      updatePersonaDto.activo = updatePersonaDto.activo === 'true';
    }

    return this.personasService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  @ApiOperation({ summary: 'Desactivar una persona (Soft Delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }
}