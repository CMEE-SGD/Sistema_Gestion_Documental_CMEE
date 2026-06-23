import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

// 👇 Importaciones de Seguridad
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, AccessGuard) // Activa la seguridad
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @RequireAccess('Auditoria Global', 2) // Nivel 2: Lectura de logs
  findAll() {
    return this.auditoriaService.findAll();
  }

  @Get('persona/:id')
  @RequireAccess('Auditoria Global', 2)
  findByPersona(@Param('id') id: string) {
    return this.auditoriaService.findByPersona(+id);
  }

  @Get('documento/:id')
  @RequireAccess('Auditoria Global', 2)
  findByDocumento(@Param('id') id: string) {
    return this.auditoriaService.findByDocumento(+id);
  }

  @Get('rol/:id')
  @RequireAccess('Auditoria Global', 2)
  findByRol(@Param('id') id: string) {
    return this.auditoriaService.findByRol(+id);
  }

  @Get('puesto/:id')
  @RequireAccess('Auditoria Global', 2)
  findByPuesto(@Param('id') id: string) {
    return this.auditoriaService.findByPuesto(+id);
  }
}