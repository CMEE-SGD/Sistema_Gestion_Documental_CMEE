import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { PrismaModule } from '../prisma/prisma.module'; // Ajusta la ruta si tu módulo de Prisma está en otra parte
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    PrismaModule,
    // Configuración de Multer para guardar archivos localmente
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/documentos',
        filename: (req, file, cb) => {
          // Generamos un nombre único: timestamp + número aleatorio + extensión original
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        }
      })
    })
  ],
  controllers: [DocumentosController],
  providers: [DocumentosService],
})
export class DocumentosModule {}