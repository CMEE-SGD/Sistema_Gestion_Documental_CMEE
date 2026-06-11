import { Module } from '@nestjs/common';
import { AplicacionesService } from './aplicaciones.service';
import { AplicacionesController } from './aplicaciones.controller';
import { AplicacionesSeeder } from './aplicaciones.seeder';

@Module({
  controllers: [AplicacionesController],
  providers: [AplicacionesService, AplicacionesSeeder],
})
export class AplicacionesModule {}