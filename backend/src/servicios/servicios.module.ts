import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';

/** Módulo controlador o servicio para gestionar la entidad ServiciosModule. */
@Module({
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}
