import { Module } from '@nestjs/common';
import { ConfiguracionGeneralService } from './configuracion-general.service';
import { ConfiguracionGeneralController } from './configuracion-general.controller';

@Module({
  controllers: [ConfiguracionGeneralController],
  providers: [ConfiguracionGeneralService],
  exports: [ConfiguracionGeneralService],
})
export class ConfiguracionGeneralModule {}
