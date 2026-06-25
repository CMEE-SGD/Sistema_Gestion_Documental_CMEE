import { Module } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { DepartamentosController } from './departamentos.controller';

/** Módulo controlador o servicio para gestionar la entidad DepartamentosModule. */
@Module({
  controllers: [DepartamentosController],
  providers: [DepartamentosService],
})
export class DepartamentosModule {}
