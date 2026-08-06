import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientesInstitucionalesService } from './clientes-institucionales.service';
import { CreateClienteInstitucionalDto } from './dto/create-clientes-institucionale.dto';
import { UpdateClientesInstitucionaleDto } from './dto/update-clientes-institucionale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('clientes-institucionales')
export class ClientesInstitucionalesController {
  constructor(
    private readonly clientesService: ClientesInstitucionalesService,
  ) {}

  @Post()
  @RequireAccess('Recepcion Equipos', 3)
  create(@Body() createDto: CreateClienteInstitucionalDto) {
    return this.clientesService.create(createDto);
  }

  @Get()
  @RequireAccess('Recepcion Equipos', 1)
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  @RequireAccess('Recepcion Equipos', 1)
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Patch(':id')
  @RequireAccess('Recepcion Equipos', 4)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClientesInstitucionaleDto,
  ) {
    return this.clientesService.update(+id, updateDto);
  }

  @Delete(':id')
  @RequireAccess('Recepcion Equipos', 5)
  remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}
