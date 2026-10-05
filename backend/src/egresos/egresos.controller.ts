import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AccessGuard } from '../auth/guards/access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';
import { EgresosService } from './egresos.service';
import { CreateEgresoDto } from './dto/create-egreso.dto';
import { UpdateEgresoDto } from './dto/update-egreso.dto';

/**
 * Egresos — compras/proveedores del módulo financiero. La información se
 * alimenta importando el Excel que emite el sistema tributario (SIAT): el
 * sistema extrae los datos y los registra, sin digitación manual. También
 * admite alta manual (viáticos y gastos fuera del Excel).
 */
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('egresos')
export class EgresosController {
  constructor(private readonly egresosService: EgresosService) {}

  @Get()
  @RequireAccess('Gestion Financiera', 1)
  listar() {
    return this.egresosService.findAll();
  }

  @Post('importar')
  @RequireAccess('Gestion Financiera', 4)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  importar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const personaId = req.user?.persona_id ?? null;
    return this.egresosService.importar(file, personaId);
  }

  @Post()
  @RequireAccess('Gestion Financiera', 4)
  crear(@Body() dto: CreateEgresoDto, @Req() req: any) {
    const personaId = req.user?.persona_id ?? null;
    return this.egresosService.crear(dto, personaId);
  }

  @Patch(':id')
  @RequireAccess('Gestion Financiera', 4)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEgresoDto,
  ) {
    return this.egresosService.actualizar(id, dto);
  }

  @Delete()
  @RequireAccess('Gestion Financiera', 5)
  eliminarTodos() {
    return this.egresosService.eliminarTodos();
  }

  @Delete(':id')
  @RequireAccess('Gestion Financiera', 5)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.egresosService.eliminar(id);
  }
}