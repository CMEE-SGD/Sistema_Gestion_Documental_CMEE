import { Module } from '@nestjs/common';
import { CalidadService } from './calidad.service';
import { CalidadController } from './calidad.controller';
import { AccionesService } from './acciones.service';
import { AccionesController } from './acciones.controller';

@Module({
  controllers: [CalidadController, AccionesController],
  providers: [CalidadService, AccionesService],
})
export class CalidadModule {}
