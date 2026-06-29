import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Módulo controlador o servicio para gestionar la entidad AplicacionesSeeder. */
@Injectable()
export class AplicacionesSeeder implements OnModuleInit {
  private readonly logger = new Logger(AplicacionesSeeder.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Ejecuta la operación de negocio onModuleInit.
   * @returns Promise<void>
   */
  async onModuleInit() {
    this.logger.log('Sincronizando catálogo de Aplicaciones base...');

    // Nombres exactos que utiliza el AccessGuard y los controladores
    const aplicacionesBase = [
      {
        nombre: 'Gestion de Usuarios',
        descripcion: 'Módulo de administración de roles y credenciales',
      },
      {
        nombre: 'Recursos Humanos',
        descripcion: 'Gestión de personal, puestos y estructura organizacional',
      },
      {
        nombre: 'Gestor Documental',
        descripcion: 'Archivos, carpetas y flujos documentales',
      },
      {
        nombre: 'Laboratorios',
        descripcion: 'Gestión de laboratorios, equipos y servicios',
      },
      {
        nombre: 'Auditoria Global',
        descripcion: 'Registro de actividades del sistema',
      },
    ];

    for (const app of aplicacionesBase) {
      await this.prisma.aplicacion.upsert({
        where: { nombre: app.nombre },
        update: {}, // Si existe, no altera los datos
        create: {
          nombre: app.nombre,
          descripcion: app.descripcion,
          activo: true,
        },
      });
    }

    this.logger.log('Catálogo de Aplicaciones sincronizado.');
  }
}
