import { Module } from '@nestjs/common';
import { PersonaPuestoService } from './persona-puesto.service';
import { PersonaPuestoController } from './persona-puesto.controller';

@Module({
  controllers: [PersonaPuestoController],
  providers: [PersonaPuestoService],
})
export class PersonaPuestoModule {}
