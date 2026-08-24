import { PartialType } from '@nestjs/swagger';
import { CreateClienteInstitucionalDto } from './create-clientes-institucionale.dto';

export class UpdateClientesInstitucionaleDto extends PartialType(
  CreateClienteInstitucionalDto,
) {}
