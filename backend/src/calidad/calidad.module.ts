import { Module } from '@nestjs/common';
import { CalidadService } from './calidad.service';
import { CalidadController } from './calidad.controller';
import { CalidadSeeder } from './calidad.seeder';

@Module({
  controllers: [CalidadController],
  providers: [CalidadService, CalidadSeeder],
})
export class CalidadModule {}
