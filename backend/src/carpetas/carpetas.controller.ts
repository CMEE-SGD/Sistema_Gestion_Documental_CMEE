import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarpetasService } from './carpetas.service';

@Controller('carpetas')
export class CarpetasController {
  constructor(private readonly carpetasService: CarpetasService) {}

  @Post()
  async create(@Body() data: any) {
    return this.carpetasService.create(data);
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
  async update(@Param('id') id: string, @Body() data: any) {
    return this.carpetasService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.carpetasService.remove(+id);
  }
}