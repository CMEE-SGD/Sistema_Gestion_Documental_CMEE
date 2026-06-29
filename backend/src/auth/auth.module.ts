// backend/src/auth/auth.module.ts
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

/** Módulo controlador o servicio para gestionar la entidad AuthModule. */
@Global() // Lo hacemos global para poder usar el JwtGuard en cualquier módulo sin importarlo siempre
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave_secreta_desarrollo',
      signOptions: { expiresIn: '8h' }, // El token expira en 8 horas
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule], // Exportamos JwtModule para que UsuariosService pueda firmar tokens
})
export class AuthModule {}
