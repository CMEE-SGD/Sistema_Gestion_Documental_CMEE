import { Injectable } from '@nestjs/common';

/** Módulo controlador o servicio para gestionar la entidad App. */
@Injectable()
export class AppService {
  /**
     * Ejecuta la operación de negocio getHello.
     * @returns string
     */
    getHello(): string {
    return 'Hello World!';
  }
}
