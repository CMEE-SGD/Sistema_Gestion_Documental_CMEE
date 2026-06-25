import { Module } from '@nestjs/common';
import { CircuitosService } from './circuitos.service';
import { CircuitosController } from './circuitos.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 👉 Importamos Prisma

/** Módulo controlador o servicio para gestionar la entidad CircuitosModule. */
@Module({
  imports: [PrismaModule], // 👉 Lo agregamos al arreglo de imports
  controllers: [CircuitosController],
  providers: [CircuitosService],
})
export class CircuitosModule {}