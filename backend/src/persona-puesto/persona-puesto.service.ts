import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaPuestoDto } from './dto/create-persona-puesto.dto';
import { UpdatePersonaPuestoDto } from './dto/update-persona-puesto.dto';

/** Módulo controlador o servicio para gestionar la entidad PersonaPuesto. */
@Injectable()
export class PersonaPuestoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
     * Ejecuta la operación de negocio create.
     * @param dto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
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

  /**
     * Ejecuta la operación de negocio findAll.
     * @returns Array<Entidad>
     */
    findAll() {
    return this.prisma.personaPuesto.findMany({
      where: { activo: true },
      include: { persona: true, puesto: true, departamento: true },
      orderBy: [{ persona_id: 'asc' }, { orden_puesto: 'asc' }],
    });
  }

  /**
     * Ejecuta la operación de negocio findOne.
     * @param id - Datos o identificador requerido (number)
     * @returns Entidad | PrismaResponse
     */
    async findOne(id: number) {
    const asignacion = await this.prisma.personaPuesto.findUnique({
      where: { id },
      include: { persona: true, puesto: true, departamento: true },
    });
    if (!asignacion) throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    return asignacion;
  }

  /**
     * Ejecuta la operación de negocio update.
     * @param id - Datos o identificador requerido (number)
     * @param dto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
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

  /**
     * Ejecuta la operación de negocio remove.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    async remove(id: number) {
    await this.findOne(id);
    return this.prisma.personaPuesto.update({
      where: { id },
      data: { activo: false },
    });
  }
}