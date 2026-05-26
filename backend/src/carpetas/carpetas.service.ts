import { Injectable } from '@nestjs/common';
import { CreateCarpetaDto } from './dto/create-carpeta.dto';
import { UpdateCarpetaDto } from './dto/update-carpeta.dto';

@Injectable()
export class CarpetasService {
  create(createCarpetaDto: CreateCarpetaDto) {
    return 'This action adds a new carpeta';
  }

  findAll() {
    return `This action returns all carpetas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carpeta`;
  }

  update(id: number, updateCarpetaDto: UpdateCarpetaDto) {
    return `This action updates a #${id} carpeta`;
  }

  remove(id: number) {
    return `This action removes a #${id} carpeta`;
  }
}
