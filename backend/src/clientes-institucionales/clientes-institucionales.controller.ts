import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientesInstitucionalesService } from './clientes-institucionales.service';
import { CreateClienteInstitucionalDto } from './dto/create-clientes-institucionale.dto';
import { UpdateClientesInstitucionaleDto } from './dto/update-clientes-institucionale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clientes-institucionales')
export class ClientesInstitucionalesController {
  constructor(private readonly clientesService: ClientesInstitucionalesService) {}

  @Post()
  create(@Body() createDto: CreateClienteInstitucionalDto) {
    return this.clientesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateClientesInstitucionaleDto) {
    return this.clientesService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}