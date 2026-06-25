import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';

/** Módulo controlador o servicio para gestionar la entidad EquiposModule. */
@Module({
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
