import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';

/** Módulo controlador o servicio para gestionar la entidad PuestosModule. */
@Module({
  controllers: [PuestosController],
  providers: [PuestosService],
})
export class PuestosModule {}
