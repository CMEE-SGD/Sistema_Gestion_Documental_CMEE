import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

/** Módulo controlador o servicio para gestionar la entidad UsuariosModule. */
@Module({
  imports: [NotificacionesModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
