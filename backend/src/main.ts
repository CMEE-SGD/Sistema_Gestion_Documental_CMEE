import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuditoriaInterceptor } from './auditoria/auditoria.interceptor';
import { AuditoriaService } from './auditoria/auditoria.service';
import { PrismaService } from './prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // 1. Inicialización de la aplicación indicando explícitamente Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Configuración base de la API
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // 3. Validación global estricta (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Exposición de archivos estáticos (PDFs y Fotografías)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 5. Configuración de Swagger (Documentación Interactiva)
  const config = new DocumentBuilder()
    .setTitle('API SGD - Centro de Metrología')
    .setDescription('Documentación técnica de los endpoints del backend.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 6. Inyección de Interceptor Global de Auditoría
  const prismaService = app.get(PrismaService);
  const auditoriaService = new AuditoriaService(prismaService);
  app.useGlobalInterceptors(new AuditoriaInterceptor(auditoriaService));

  // 7. Inicialización del servidor
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}/api`);
  console.log(`📄 Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();