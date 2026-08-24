import { Module } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';

/** Módulo controlador o servicio para gestionar la entidad PersonasModule. */
@Module({
  controllers: [PersonasController],
  providers: [PersonasService],
})
export class PersonasModule {}
