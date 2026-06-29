import { Module } from '@nestjs/common';
import { AplicacionesService } from './aplicaciones.service';
import { AplicacionesController } from './aplicaciones.controller';
import { AplicacionesSeeder } from './aplicaciones.seeder';

/** Módulo controlador o servicio para gestionar la entidad AplicacionesModule. */
@Module({
  controllers: [AplicacionesController],
  providers: [AplicacionesService, AplicacionesSeeder],
})
export class AplicacionesModule {}
