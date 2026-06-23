import { Module } from '@nestjs/common';
import { LaboratoriosService } from './laboratorios.service';
import { LaboratoriosController } from './laboratorios.controller';

@Module({
  controllers: [LaboratoriosController],
  providers: [LaboratoriosService],
})
export class LaboratoriosModule {}
