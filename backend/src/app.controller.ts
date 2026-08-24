import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/** Módulo controlador o servicio para gestionar la entidad App. */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Obtiene información de un registro específico.
   * @returns string
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
