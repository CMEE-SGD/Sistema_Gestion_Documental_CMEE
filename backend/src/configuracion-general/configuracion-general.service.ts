import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfiguracionGeneralDto } from './dto/update-configuracion-general.dto';

const NOMBRE_INSTITUCION_DEFECTO =
  'Centro de Metrología del Ejército Ecuatoriano';

@Injectable()
export class ConfiguracionGeneralService {
  constructor(private readonly prisma: PrismaService) {}

  /** La fila con id=1 siempre debe existir (creada por la migración); esto es una red de seguridad. */
  async obtener() {
    return this.prisma.configuracionGeneral.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, nombre_institucion: NOMBRE_INSTITUCION_DEFECTO },
    });
  }

  async actualizar(dto: UpdateConfiguracionGeneralDto) {
    await this.obtener();
    return this.prisma.configuracionGeneral.update({
      where: { id: 1 },
      data: dto,
    });
  }
}
