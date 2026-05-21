import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaPuestoDto } from './dto/create-persona-puesto.dto';
import { UpdatePersonaPuestoDto } from './dto/update-persona-puesto.dto';

@Injectable()
export class PersonaPuestoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonaPuestoDto) {
    // 1. Validar límite máximo de 3 puestos activos (Complemento al Trigger de PostgreSQL)
    const puestosActivos = await this.prisma.personaPuesto.count({
      where: { persona_id: dto.persona_id, activo: true },
    });
    if (puestosActivos >= 3) {
      throw new ConflictException('La persona ya tiene el límite máximo de 3 puestos asignados');
    }

    // 2. Validar que la persona no tenga el mismo puesto duplicado
    const existePuesto = await this.prisma.personaPuesto.findUnique({
      where: { uq_persona_puesto: { persona_id: dto.persona_id, puesto_id: dto.puesto_id } },
    });
    if (existePuesto) throw new ConflictException('La persona ya tiene este puesto asignado');

    // 3. Validar que no se repita el orden (ej. no puede tener dos puestos #1)
    const existeOrden = await this.prisma.personaPuesto.findUnique({
      where: { uq_persona_orden_puesto: { persona_id: dto.persona_id, orden_puesto: dto.orden_puesto } },
    });
    if (existeOrden) throw new ConflictException(`La persona ya tiene un puesto asignado en el orden ${dto.orden_puesto}`);

    return this.prisma.personaPuesto.create({
      data: {
        ...dto,
        fecha_asignacion: dto.fecha_asignacion ? new Date(dto.fecha_asignacion) : new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.personaPuesto.findMany({
      where: { activo: true },
      include: { persona: true, puesto: true, departamento: true },
      orderBy: [{ persona_id: 'asc' }, { orden_puesto: 'asc' }],
    });
  }

  async findOne(id: number) {
    const asignacion = await this.prisma.personaPuesto.findUnique({
      where: { id },
      include: { persona: true, puesto: true, departamento: true },
    });
    if (!asignacion) throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    return asignacion;
  }

  async update(id: number, dto: UpdatePersonaPuestoDto) {
    await this.findOne(id);
    return this.prisma.personaPuesto.update({
      where: { id },
      data: {
        ...dto,
        fecha_asignacion: dto.fecha_asignacion ? new Date(dto.fecha_asignacion) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.personaPuesto.update({
      where: { id },
      data: { activo: false },
    });
  }
}