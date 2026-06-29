import { Module } from '@nestjs/common';
import { CarpetasService } from './carpetas.service';
import { CarpetasController } from './carpetas.controller';


/** Módulo controlador o servicio para gestionar la entidad CarpetasModule. */
@Module({
  controllers: [CarpetasController],
  providers: [CarpetasService],
  exports: [CarpetasService],
})
export class CarpetasModule {}
