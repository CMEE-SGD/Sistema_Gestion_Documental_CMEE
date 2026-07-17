import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
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
import { LaboratoriosModule } from './laboratorios/laboratorios.module';
import { CircuitosModule } from './circuitos/circuitos.module';
import { EquiposModule } from './equipos/equipos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ClientesInstitucionalesModule } from './clientes-institucionales/clientes-institucionales.module';
import { RecepcionEquiposModule } from './recepcion-equipos/recepcion-equipos.module';
import { CertificadosModule } from './certificados/certificados.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ReportesModule } from './reportes/reportes.module';
import { ConfiguracionGeneralModule } from './configuracion-general/configuracion-general.module';

/** Módulo controlador o servicio para gestionar la entidad AppModule. */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        redirect: false,
      },
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
    LaboratoriosModule,
    CircuitosModule,
    EquiposModule,
    ServiciosModule,
    ClientesInstitucionalesModule,
    RecepcionEquiposModule,
    CertificadosModule,
    NotificacionesModule,
    ReportesModule,
    ConfiguracionGeneralModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}