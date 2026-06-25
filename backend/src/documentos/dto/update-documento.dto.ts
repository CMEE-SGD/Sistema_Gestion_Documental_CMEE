import { PartialType } from '@nestjs/swagger';
import { CreateDocumentoDto } from './create-documento.dto';

/** Módulo controlador o servicio para gestionar la entidad UpdateDocumentoDto. */
export class UpdateDocumentoDto extends PartialType(CreateDocumentoDto) {}
