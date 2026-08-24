import { Module } from '@nestjs/common';
import { CalidadService } from './calidad.service';
import { CalidadController } from './calidad.controller';

@Module({
  controllers: [CalidadController],
  providers: [CalidadService],
})
export class CalidadModule {}
