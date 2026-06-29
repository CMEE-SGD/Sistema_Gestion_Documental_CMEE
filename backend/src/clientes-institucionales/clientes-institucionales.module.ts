import { Module } from '@nestjs/common';
import { ClientesInstitucionalesService } from './clientes-institucionales.service';
import { ClientesInstitucionalesController } from './clientes-institucionales.controller';

@Module({
  controllers: [ClientesInstitucionalesController],
  providers: [ClientesInstitucionalesService],
})
export class ClientesInstitucionalesModule {}
