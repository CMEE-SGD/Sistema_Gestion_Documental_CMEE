import { Module } from '@nestjs/common';
import { CapacitacionesService } from './capacitaciones.service';
import { CapacitacionesController } from './capacitaciones.controller';

@Module({
  controllers: [CapacitacionesController],
  providers: [CapacitacionesService],
})
export class CapacitacionesModule {}
