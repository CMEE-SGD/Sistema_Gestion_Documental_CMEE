import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

/** Módulo controlador o servicio para gestionar la entidad RolesModule. */
@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
