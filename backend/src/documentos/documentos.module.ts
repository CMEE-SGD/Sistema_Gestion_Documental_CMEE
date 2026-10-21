import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CarpetasModule } from '../carpetas/carpetas.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { esExtensionAdicional } from './formatos-permitidos';
import { decodificarNombreArchivo } from '../common/helpers/encoding';

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
    NotificacionesModule,
    MulterModule.register({
      storage: diskStorage({
        destination: tempFolder,
        filename: (req, file, cb) => {
          // 👉 CAMBIO: Eliminamos el sufijo numérico y conservamos el nombre original
          // Opcional: Reemplazamos los espacios por guiones bajos para evitar problemas en URLs
          const nombreLimpio = decodificarNombreArchivo(file.originalname).replace(/\s+/g, '_');
          cb(null, nombreLimpio);
        },
      }),
      // PDF, o uno de los formatos adicionales (Word, Excel, PowerPoint, CSV,
      // TXT). Aquí aún no se sabe a qué carpeta va (multer procesa el archivo
      // antes que los demás campos), así que la decisión final —solo PDF o
      // cualquier formato— la toma el servicio con validarArchivoParaCarpeta.
      fileFilter: (req, file, cb) => {
        cb(null, file.mimetype === 'application/pdf' || esExtensionAdicional(file.originalname));
      },
    }),
  ],
  controllers: [DocumentosController],
  providers: [DocumentosService],
})
export class DocumentosModule {}
