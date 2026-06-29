import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CarpetasModule } from '../carpetas/carpetas.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

// Asegurarnos de que la carpeta temp exista al arrancar el módulo
const tempFolder = './uploads/Gestor_Documental/temp';
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

/** Módulo controlador o servicio para gestionar la entidad DocumentosModule. */
@Module({
  imports: [
    PrismaModule,
    CarpetasModule,
    MulterModule.register({
      storage: diskStorage({
        destination: tempFolder,
        filename: (req, file, cb) => {
          // 👉 CAMBIO: Eliminamos el sufijo numérico y conservamos el nombre original
          // Opcional: Reemplazamos los espacios por guiones bajos para evitar problemas en URLs
          const nombreLimpio = file.originalname.replace(/\s+/g, '_');
          cb(null, nombreLimpio);
        }
      })
    })
  ],
  controllers: [DocumentosController],
  providers: [DocumentosService],
})
export class DocumentosModule {}