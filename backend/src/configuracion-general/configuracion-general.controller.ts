import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ConfiguracionGeneralService } from './configuracion-general.service';
import { UpdateConfiguracionGeneralDto } from './dto/update-configuracion-general.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@Controller('configuracion-general')
export class ConfiguracionGeneralController {
  constructor(
    private readonly configuracionGeneralService: ConfiguracionGeneralService,
  ) {}

  /**
   * Pública a propósito: la pantalla de login (sin sesión) necesita el
   * nombre institucional antes de que exista un token JWT.
   */
  @Get()
  obtener() {
    return this.configuracionGeneralService.obtener();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 5)
  actualizar(@Body() dto: UpdateConfiguracionGeneralDto) {
    return this.configuracionGeneralService.actualizar(dto);
  }
}
