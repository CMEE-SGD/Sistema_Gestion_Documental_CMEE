import { Module } from '@nestjs/common';
import { PersonaPuestoService } from './persona-puesto.service';
import { PersonaPuestoController } from './persona-puesto.controller';

/** Módulo controlador o servicio para gestionar la entidad PersonaPuestoModule. */
@Module({
  controllers: [PersonaPuestoController],
  providers: [PersonaPuestoService],
})
export class PersonaPuestoModule {}
