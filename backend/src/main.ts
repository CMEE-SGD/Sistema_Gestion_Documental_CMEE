import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import { AuditoriaInterceptor } from './auditoria/auditoria.interceptor';
import { AuditoriaService } from './auditoria/auditoria.service';
import { PrismaService } from './prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // 👉 1. Especificamos explícitamente que es una aplicación Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Prefijo global de API
  app.setGlobalPrefix("api")

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // 👉 2. Exponemos la carpeta "uploads" para que el navegador pueda acceder a los PDFs
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("SGD CMEE API")
    .setDescription("Sistema de Gestión Documental - API REST")
    .setVersion("1.0")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  const prismaService = app.get(PrismaService);
  const auditoriaService = new AuditoriaService(prismaService);
  app.useGlobalInterceptors(new AuditoriaInterceptor(auditoriaService));

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`Aplicación corriendo en: http://localhost:${port}`)
  console.log(`Swagger disponible en: http://localhost:${port}/api/docs`)
}

bootstrap()