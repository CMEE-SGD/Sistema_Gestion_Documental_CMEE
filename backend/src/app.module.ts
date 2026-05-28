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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}