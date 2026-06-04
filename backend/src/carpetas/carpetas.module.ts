import { Module } from '@nestjs/common';
import { CarpetasService } from './carpetas.service';
import { CarpetasController } from './carpetas.controller';


@Module({
  controllers: [CarpetasController],
  providers: [CarpetasService],
})
export class CarpetasModule {}
