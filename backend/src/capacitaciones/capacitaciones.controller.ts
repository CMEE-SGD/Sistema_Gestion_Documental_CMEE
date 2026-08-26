import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { CapacitacionesService } from './capacitaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

const tmpDir = join('.', 'uploads', 'Capacitaciones', '_tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = diskStorage({
  destination: (_req, _file, cb) => cb(null, tmpDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `cert_${Date.now()}_${Math.round(Math.random() * 1000)}${ext}`);
  },
});

@Controller('capacitaciones')
@UseGuards(JwtAuthGuard, AccessGuard)
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

  @Post()
  @RequireAccess('Recursos Humanos', 5)
  create(@Body() dto: any) {
    const parsed = this.parseBody(dto);
    return this.capacitacionesService.create(parsed);
  }

  @Get()
  @RequireAccess('Recursos Humanos', 1)
  findAll() {
    return this.capacitacionesService.findAll();
  }

  @Get('persona/:personaId')
  @RequireAccess('Recursos Humanos', 1)
  findByPersonaId(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.capacitacionesService.findByPersonaId(personaId);
  }

  @Get(':id')
  @RequireAccess('Recursos Humanos', 2)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.findOne(id);
  }

  @Patch(':id')
  @RequireAccess('Recursos Humanos', 5)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const parsed = this.parseBody(dto);
    return this.capacitacionesService.update(id, parsed);
  }

  @Post(':id/certificado/:personaId')
  @RequireAccess('Recursos Humanos', 5)
  @UseInterceptors(FileInterceptor('certificado', { storage, limits: { fileSize: 10 * 1024 * 1024 } }))
  async subirCertificado(
    @Param('id', ParseIntPipe) id: number,
    @Param('personaId', ParseIntPipe) personaId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.capacitacionesService.setCertificado(id, personaId, file.path);
  }

  @Delete(':id')
  @RequireAccess('Recursos Humanos', 5)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.remove(id);
  }

  private parseBody(dto: any): any {
    try { dto.persona_ids = typeof dto.persona_ids === 'string' ? JSON.parse(dto.persona_ids) : dto.persona_ids ?? []; } catch { dto.persona_ids = []; }
    for (const key of Object.keys(dto)) {
      if (dto[key] === '') delete dto[key];
    }
    return dto;
  }
}
