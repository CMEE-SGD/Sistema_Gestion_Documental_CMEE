import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';
import { CrearDepartamentoVinculadoDto } from './dto/crear-departamento-vinculado.dto';
import type { HydratedUser } from '../common/helpers/lab-scope';
import { isRestrictedToLab } from '../common/helpers/lab-scope';

/** Módulo controlador o servicio para gestionar la entidad Laboratorios. */
@Injectable()
export class LaboratoriosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Una persona solo puede ser responsable de un laboratorio activo a la vez.
   * Al editar (laboratorioId) se permite conservar al responsable actual.
   */
  private async validarResponsableUnico(
    responsableId: number | undefined,
    laboratorioId?: number,
  ) {
    if (!responsableId) return;
    const otroLaboratorio = await this.prisma.laboratorio.findFirst({
      where: {
        responsable_id: responsableId,
        activo: true,
        ...(laboratorioId ? { id: { not: laboratorioId } } : {}),
      },
      select: { id: true, nombre: true },
    });
    if (otroLaboratorio) {
      throw new BadRequestException(
        `La persona seleccionada ya es responsable del laboratorio "${otroLaboratorio.nombre}" y no puede asignarse a otro laboratorio.`,
      );
    }
  }

  async create(data: CreateLaboratorioDto) {
    await this.validarResponsableUnico(data.responsable_id);
    return this.prisma.laboratorio.create({
      data,
    });
  }

  // Candidatos válidos para "Responsable Técnico": personas activas con un
  // puesto activo de Observador Técnico (OBT). Si se pasa laboratorioId
  // (edición de un laboratorio existente), se restringe a los OBT cuyo
  // departamento pertenece a ese laboratorio; al crear un laboratorio nuevo
  // todavía no hay departamentos ligados a él, así que se listan todos los
  // OBT del sistema.
  // Se excluyen las personas que ya son responsables de otro laboratorio
  // activo, para que la misma persona no quede en dos laboratorios.
  async getCandidatosResponsable(laboratorioId?: number) {
    return this.prisma.persona.findMany({
      where: {
        estado: 'ACTIVO',
        puestos: {
          some: {
            activo: true,
            puesto: { nombre: { contains: 'Observador Técnico' } },
            ...(laboratorioId
              ? { departamento: { laboratorio_id: laboratorioId } }
              : {}),
          },
        },
        NOT: {
          laboratorios_responsable: {
            some: {
              activo: true,
              ...(laboratorioId ? { id: { not: laboratorioId } } : {}),
            },
          },
        },
      },
      select: { id: true, nombre: true, apellidos: true },
      orderBy: [{ nombre: 'asc' }, { apellidos: 'asc' }],
    });
  }

  // Un laboratorio solo "ve" personas (para Responsable Técnico, para el
  // scope de acceso de cada usuario, etc.) a través del Departamento al que
  // pertenecen — por eso un laboratorio sin ningún Departamento enlazado
  // queda con esos listados vacíos aunque sí existan Observadores Técnicos
  // en el sistema. Este listado permite mostrarlo en el propio formulario
  // del laboratorio, en vez de que quede oculto en RRHH > Grupos.
  async getDepartamentosVinculados(laboratorioId: number) {
    await this.findOneSimple(laboratorioId);
    return this.prisma.departamento.findMany({
      where: { laboratorio_id: laboratorioId, activo: true },
      select: { id: true, codigo: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  // Departamentos ya existentes en el organigrama (RRHH > Grupos) que
  // todavía no están enlazados a ningún laboratorio — son los candidatos
  // naturales para vincular, en vez de crear uno nuevo desde cero cuando ya
  // existe el que corresponde (ej. "Laboratorio de Termometría" ya está en
  // el organigrama, solo le falta el enlace).
  //
  // Se filtra a los que tienen "Laboratorio" en el nombre: el organigrama
  // mezcla departamentos administrativos (Calidad, RRHH, Servicio al
  // Cliente...) con los que representan laboratorios propiamente — no hay
  // un campo `tipo` que los distinga (todos son "Departamento"), así que el
  // nombre es la única señal disponible para no ensuciar el desplegable con
  // opciones que nunca aplican aquí.
  async getDepartamentosDisponibles() {
    return this.prisma.departamento.findMany({
      where: {
        activo: true,
        laboratorio_id: null,
        nombre: { contains: 'Laboratorio', mode: 'insensitive' },
      },
      select: { id: true, codigo: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  // Vincula un Departamento que YA existe en el organigrama a este
  // laboratorio (fija su laboratorio_id). Se rechaza si ese departamento ya
  // está enlazado a otro laboratorio distinto, para no "robárselo" por un
  // desplegable con datos desactualizados.
  async vincularDepartamentoExistente(
    laboratorioId: number,
    departamentoId: number,
  ) {
    await this.findOneSimple(laboratorioId);

    const departamento = await this.prisma.departamento.findUnique({
      where: { id: departamentoId },
      select: { id: true, laboratorio_id: true, nombre: true },
    });
    if (!departamento) {
      throw new NotFoundException(
        `Departamento con ID ${departamentoId} no encontrado`,
      );
    }
    if (
      departamento.laboratorio_id !== null &&
      departamento.laboratorio_id !== laboratorioId
    ) {
      throw new ConflictException(
        `El departamento "${departamento.nombre}" ya está vinculado a otro laboratorio.`,
      );
    }

    return this.prisma.departamento.update({
      where: { id: departamentoId },
      data: { laboratorio_id: laboratorioId },
      select: { id: true, codigo: true, nombre: true },
    });
  }

  // Atajo para crear un Departamento ya enlazado a este laboratorio, sin
  // salir del formulario de Laboratorio ni necesitar acceso a RRHH — el
  // laboratorio_id lo fija este método a partir del :id de la ruta, nunca
  // el cliente. Pensado como respaldo cuando no existe todavía ningún
  // departamento apropiado para vincular (ver getDepartamentosDisponibles).
  async crearDepartamentoVinculado(
    laboratorioId: number,
    dto: CrearDepartamentoVinculadoDto,
  ) {
    await this.findOneSimple(laboratorioId);

    const existeCodigo = await this.prisma.departamento.findUnique({
      where: { codigo: dto.codigo },
    });
    if (existeCodigo) {
      throw new ConflictException(
        `El código de departamento "${dto.codigo}" ya está en uso.`,
      );
    }

    return this.prisma.departamento.create({
      data: {
        codigo: dto.codigo,
        nombre: dto.nombre,
        laboratorio_id: laboratorioId,
      },
      select: { id: true, codigo: true, nombre: true },
    });
  }

  private async findOneSimple(id: number) {
    const laboratorio = await this.prisma.laboratorio.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!laboratorio) {
      throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    }
  }

  async findAll(user?: HydratedUser) {
    if (user?.isGod) {
      return this.prisma.laboratorio.findMany({
        include: {
          responsable: { select: { nombre: true, apellidos: true } },
          equipos: true,
          servicios: true,
        },
      });
    }

    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = isRestrictedToLab(puesto)
      ? { id: labId ?? -1 }
      : undefined;

    return this.prisma.laboratorio.findMany({
      where,
      include: {
        responsable: { select: { nombre: true, apellidos: true } },
        equipos: true,
        servicios: true,
      },
    });
  }

  async findOne(id: number, user?: HydratedUser) {
    if (user?.isGod) {
      const laboratorio = await this.prisma.laboratorio.findUnique({
        where: { id },
        include: { responsable: true, equipos: true, servicios: true },
      });
      if (!laboratorio)
        throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
      return laboratorio;
    }

    const puesto = user?.puesto ?? '';
    const labId: number | null = user?.laboratorio_id ?? null;

    const where = isRestrictedToLab(puesto)
      ? { id, AND: labId ? { id: labId } : { id: -1 } }
      : { id };

    const laboratorio = await this.prisma.laboratorio.findFirst({
      where,
      include: { responsable: true, equipos: true, servicios: true },
    });

    if (!laboratorio)
      throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    return laboratorio;
  }

  async update(
    id: number,
    data: UpdateLaboratorioDto,
    user?: HydratedUser,
  ) {
    await this.findOne(id);
    if (
      user &&
      isRestrictedToLab(user.puesto ?? '') &&
      user.laboratorio_id !== id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este laboratorio',
      );
    }
    // El campo `activo` solo se cambia a través de remove()/reactivar(),
    // que exigen nivel 5 — así edición (nivel 4) nunca puede usarse como
    // puerta trasera para desactivar o reactivar.
    const { activo: _activo, ...resto } = data;
    await this.validarResponsableUnico(data.responsable_id, id);
    return this.prisma.laboratorio.update({
      where: { id },
      data: resto,
    });
  }

  async remove(id: number, user?: HydratedUser) {
    await this.findOne(id);
    if (
      user &&
      isRestrictedToLab(user.puesto ?? '') &&
      user.laboratorio_id !== id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para desactivar este laboratorio',
      );
    }
    return this.prisma.laboratorio.update({
      where: { id },
      data: { activo: false },
    });
  }

  async reactivar(id: number, user?: HydratedUser) {
    await this.findOne(id);
    if (
      user &&
      isRestrictedToLab(user.puesto ?? '') &&
      user.laboratorio_id !== id
    ) {
      throw new ForbiddenException(
        'No tienes permiso para reactivar este laboratorio',
      );
    }
    return this.prisma.laboratorio.update({
      where: { id },
      data: { activo: true },
    });
  }
}
