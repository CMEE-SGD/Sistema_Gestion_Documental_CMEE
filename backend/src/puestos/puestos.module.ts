import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';

@Module({
  controllers: [PuestosController],
  providers: [PuestosService],
})
export class PuestosModule {}
