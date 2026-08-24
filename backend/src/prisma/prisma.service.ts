import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** Módulo controlador o servicio para gestionar la entidad Prisma. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Ejecuta la operación de negocio onModuleInit.
   * @returns Promise<void>
   */
  async onModuleInit() {
    await this.$connect();
  }
}
