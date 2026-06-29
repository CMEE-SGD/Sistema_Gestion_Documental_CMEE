import { Module } from '@nestjs/common';
import { RecepcionEquiposService } from './recepcion-equipos.service';
import { RecepcionEquiposController } from './recepcion-equipos.controller';

@Module({
  controllers: [RecepcionEquiposController],
  providers: [RecepcionEquiposService],
})
export class RecepcionEquiposModule {}
