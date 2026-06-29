import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteInstitucionalDto } from './dto/create-clientes-institucionale.dto';
import { UpdateClientesInstitucionaleDto } from './dto/update-clientes-institucionale.dto';

@Injectable()
export class ClientesInstitucionalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateClienteInstitucionalDto) {
    const existe = await this.prisma.clienteInstitucional.findUnique({
      where: { nombre: createDto.nombre },
    });

    if (existe) {
      throw new ConflictException('Ya existe un cliente o institución con este nombre');
    }

    return this.prisma.clienteInstitucional.create({
      data: createDto,
    });
  }

  findAll() {
    return this.prisma.clienteInstitucional.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.clienteInstitucional.findUnique({
      where: { id },
    });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return cliente;
  }

  async update(id: number, updateDto: UpdateClientesInstitucionaleDto) {
    await this.findOne(id); // Verifica que exista
    return this.prisma.clienteInstitucional.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Borrado lógico para no romper el historial de recepciones
    return this.prisma.clienteInstitucional.update({
      where: { id },
      data: { activo: false },
    });
  }
}