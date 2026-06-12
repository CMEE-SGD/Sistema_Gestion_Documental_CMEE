import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core'; // 👇 1. Importamos la constante core
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaInterceptor } from './auditoria.interceptor'; // 👇 2. Importamos tu interceptor

@Module({
  // Tus imports y controllers se quedan igual
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    // 👇 3. Registramos el interceptor global aquí adentro
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditoriaInterceptor,
    },
  ],
})
export class AuditoriaModule {}