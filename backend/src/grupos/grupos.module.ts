import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';

/** Módulo controlador o servicio para gestionar la entidad GruposModule. */
@Module({
  controllers: [GruposController],
  providers: [GruposService],
})
export class GruposModule {}
