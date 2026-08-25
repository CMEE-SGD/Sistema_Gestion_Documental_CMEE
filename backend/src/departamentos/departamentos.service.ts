import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(private readonly prisma: PrismaService) {}

  // PATCH: Helper para validar que un laboratorio existe
  private async validateLaboratorio(id?: number | null): Promise<void> {
    if (id == null) return;
    const lab = await this.prisma.laboratorio.findUnique({ where: { id } });
    if (!lab) throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
  }

  private async validateDependencia(id?: number | null): Promise<void> {
    if (id == null) return;
    const padre = await this.prisma.departamento.findUnique({ where: { id } });
    if (!padre)
      throw new NotFoundException(`Grupo enlazado con ID ${id} no encontrado`);
  }

  private async validateResponsable(id?: number | null): Promise<void> {
    if (id == null) return;
    const persona = await this.prisma.persona.findUnique({ where: { id } });
    if (!persona)
      throw new NotFoundException(`Responsable con ID ${id} no encontrado`);
  }

  async create(createDepartamentoDto: CreateDepartamentoDto) {
    const existe = await this.prisma.departamento.findUnique({
      where: { codigo: createDepartamentoDto.codigo },
    });
    if (existe)
      throw new ConflictException('El código del departamento ya existe');

    // Validar que las referencias enviadas existan antes de intentar el insert
    await this.validateLaboratorio(createDepartamentoDto.laboratorio_id);
    await this.validateDependencia(createDepartamentoDto.dependencia_id);
    await this.validateResponsable(createDepartamentoDto.responsable_id);

    return this.prisma.departamento.create({ data: createDepartamentoDto });
  }

  findAll() {
    return this.prisma.departamento.findMany({
      orderBy: { orden: 'asc' },
      include: {
        puestos_asignados: {
          where: { activo: true },
          include: {
            persona: { select: { id: true, nombre: true, apellidos: true } },
            puesto: { select: { nombre: true } },
          },
        },
        // PATCH: Incluir datos básicos del laboratorio vinculado
        laboratorio: { select: { id: true, nombre: true } },
      },
    });
  }

  async findOne(id: number) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id },
      include: {
        padre: { select: { nombre: true } },
        responsable: { select: { nombre: true, apellidos: true } },
        puestos_asignados: {
          where: { activo: true },
          include: {
            persona: { select: { id: true, nombre: true, apellidos: true } },
            puesto: { select: { nombre: true } },
          },
        },
        // PATCH: Incluir datos básicos del laboratorio vinculado
        laboratorio: { select: { id: true, nombre: true } },
      },
    });
    if (!departamento)
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    return departamento;
  }

  async update(id: number, updateDepartamentoDto: UpdateDepartamentoDto) {
    await this.findOne(id);
    if (updateDepartamentoDto.dependencia_id === id) {
      throw new ConflictException(
        'Un departamento no puede depender de sí mismo',
      );
    }

    // Validar que las referencias enviadas existan antes de intentar el update
    await this.validateLaboratorio(updateDepartamentoDto.laboratorio_id);
    await this.validateDependencia(updateDepartamentoDto.dependencia_id);
    await this.validateResponsable(updateDepartamentoDto.responsable_id);

    return this.prisma.departamento.update({
      where: { id },
      data: updateDepartamentoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.departamento.update({
      where: { id },
      data: { activo: false },
    });
  }
}