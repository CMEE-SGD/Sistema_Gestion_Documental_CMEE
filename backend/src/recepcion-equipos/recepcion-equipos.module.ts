import { Module } from '@nestjs/common';
import { RecepcionEquiposService } from './recepcion-equipos.service';
import { RecepcionEquiposController } from './recepcion-equipos.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [RecepcionEquiposController],
  providers: [RecepcionEquiposService],
})
export class RecepcionEquiposModule {}
