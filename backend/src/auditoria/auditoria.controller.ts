import { Controller, Get, Param } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  findAll() {
    return this.auditoriaService.findAll();
  }

  @Get('persona/:id')
  findByPersona(@Param('id') id: string) {
    return this.auditoriaService.findByPersona(+id);
  }

  @Get('documento/:id')
  findByDocumento(@Param('id') id: string) {
    return this.auditoriaService.findByDocumento(+id);
  }

  @Get('rol/:id')
  findByRol(@Param('id') id: string) {
    return this.auditoriaService.findByRol(+id);
  }

  @Get('puesto/:id')
  findByPuesto(@Param('id') id: string) {
    return this.auditoriaService.findByPuesto(+id);
  }
}