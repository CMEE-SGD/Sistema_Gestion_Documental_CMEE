import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarpetasService } from './carpetas.service';
import { CreateCarpetaDto } from './dto/create-carpeta.dto';
import { UpdateCarpetaDto } from './dto/update-carpeta.dto';

@Controller('carpetas')
export class CarpetasController {
  constructor(private readonly carpetasService: CarpetasService) {}

  @Post()
  create(@Body() createCarpetaDto: CreateCarpetaDto) {
    return this.carpetasService.create(createCarpetaDto);
  }

  @Get()
  findAll() {
    return this.carpetasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carpetasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarpetaDto: UpdateCarpetaDto) {
    return this.carpetasService.update(+id, updateCarpetaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carpetasService.remove(+id);
  }
}
