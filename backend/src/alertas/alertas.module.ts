import { Module } from '@nestjs/common';
import { FacturacionModule } from '../facturacion/facturacion.module';
import { InventarioModule } from '../inventario/inventario.module';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';

@Module({
  imports: [FacturacionModule, InventarioModule],
  controllers: [AlertasController],
  providers: [AlertasService],
})
export class AlertasModule {}
