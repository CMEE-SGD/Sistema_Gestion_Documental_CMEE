import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "./prisma/prisma.module"
import { RolesModule } from './roles/roles.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { PersonasModule } from './personas/personas.module';
import { PuestosModule } from './puestos/puestos.module';
import { PersonaPuestoModule } from './persona-puesto/persona-puesto.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CarpetasModule } from './carpetas/carpetas.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}