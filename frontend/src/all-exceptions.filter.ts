import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : (exception as any)?.message || 'Error interno del servidor';

    // Esto imprime el error COMPLETO en la terminal del backend
    console.error('=== EXCEPCIÓN CAPTURADA ===');
    console.error('Tipo:', (exception as any)?.constructor?.name);
    console.error('Mensaje:', (exception as any)?.message);
    console.error('Stack:', (exception as any)?.stack);
    console.error('Code (Prisma):', (exception as any)?.code);
    console.error('Meta (Prisma):', (exception as any)?.meta);

    response.status(status).json({
      statusCode: status,
      message,
      error_type: (exception as any)?.constructor?.name,
      prisma_code: (exception as any)?.code,
      prisma_meta: (exception as any)?.meta,
    });
  }
}