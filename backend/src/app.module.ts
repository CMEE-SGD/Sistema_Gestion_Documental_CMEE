import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "./prisma/prisma.module"
import { RolesModule } from './roles/roles.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { PersonasModule } from './personas/personas.module';
import { PuestosModule } from './puestos/puestos.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}