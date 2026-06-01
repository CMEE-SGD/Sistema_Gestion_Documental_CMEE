import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import { AuditoriaInterceptor } from './auditoria/auditoria.interceptor';
import { AuditoriaService } from './auditoria/auditoria.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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