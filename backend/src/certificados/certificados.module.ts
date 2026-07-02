import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';

const UPLOAD_DIR = path.resolve('./uploads/certificados');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (_req, file, cb) => {
          const timestamp = Date.now();
          const safeName = file.originalname.replace(/\s+/g, '_');
          cb(null, `${timestamp}_${safeName}`);
        },
      }),
    }),
  ],
  controllers: [CertificadosController],
  providers: [CertificadosService],
})
export class CertificadosModule {}
