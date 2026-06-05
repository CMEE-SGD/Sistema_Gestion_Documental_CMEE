import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { RolesModule } from './roles/roles.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { PersonasModule } from './personas/personas.module';
import { PuestosModule } from './puestos/puestos.module';
import { PersonaPuestoModule } from './persona-puesto/persona-puesto.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CarpetasModule } from './carpetas/carpetas.module';
import { DocumentosModule } from './documentos/documentos.module';
import { GruposModule } from './grupos/grupos.module';
import { AplicacionesModule } from './aplicaciones/aplicaciones.module';
import { AuthModule } from './auth/auth.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ServeStaticModule } from '@nestjs/serve-static'; // <- NUEVO
import { join } from 'path'; // <- NUEVO
import { CircuitosModule } from './circuitos/circuitos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    RolesModule,
    DepartamentosModule,
    PersonasModule,
    PuestosModule,
    PersonaPuestoModule,
    UsuariosModule,
    CarpetasModule,
    DocumentosModule,
    GruposModule,
    AplicacionesModule,
    AuthModule,
    AuditoriaModule,
    CircuitosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}