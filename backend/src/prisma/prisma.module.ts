import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Módulo controlador o servicio para gestionar la entidad PrismaModule. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
