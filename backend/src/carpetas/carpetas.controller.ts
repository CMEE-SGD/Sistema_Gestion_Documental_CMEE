import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CarpetasService } from './carpetas.service';

// 👇 Importaciones de Seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('carpetas')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad global del controlador
export class CarpetasController {
  constructor(private readonly carpetasService: CarpetasService) {}

  @Post()
  @RequireAccess('Gestor Documental', 5) // Nivel 5: Crear carpetas
  async create(@Body() data: any, @Req() req: any) {
    return this.carpetasService.create(data, req.user?.id);
  }

  @Get()
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Leer listado
  findAll() {
    return this.carpetasService.findAll();
  }

  @Get(':id')
  @RequireAccess('Gestor Documental', 2) // Nivel 2: Leer detalle
  findOne(@Param('id') id: string) {
    return this.carpetasService.findOne(+id);
  }

  @Get(':id/mis-permisos')
  @RequireAccess('Gestor Documental', 2)
  misPermisos(@Param('id') id: string, @Req() req: any) {
    return this.carpetasService.obtenerPermisosUsuario(req.user?.id, +id);
  }

  @Patch(':id')
  @RequireAccess('Gestor Documental', 4) // Nivel 4: Editar carpeta
  async update(@Param('id') id: string, @Body() data: any) {
    return this.carpetasService.update(+id, data);
  }

  @Delete(':id')
  @RequireAccess('Gestor Documental', 5) // Nivel 5: Eliminar carpeta
  async remove(@Param('id') id: string) {
    return this.carpetasService.remove(+id);
  }
}