import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const { password, grupoIds, ...userData } = dto;

    const existeUsername = await this.prisma.usuario.findUnique({ where: { nombre_usuario: userData.nombre_usuario } });
    if (existeUsername) throw new ConflictException('El usuario ya existe');

    const existePersona = await this.prisma.usuario.findUnique({ where: { persona_id: userData.persona_id } });
    if (existePersona) throw new ConflictException('La persona ya tiene un usuario');

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    return this.prisma.usuario.create({
      data: {
        ...userData,
        password_hash,
        fecha_caducidad: userData.fecha_caducidad ? new Date(userData.fecha_caducidad) : null,
        grupos: grupoIds ? { connect: grupoIds.map(id => ({ id })) } : undefined,
      },
      select: { id: true, nombre_usuario: true, estado_cuenta: true, grupos: true } 
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true, nombre_usuario: true, estado_cuenta: true, bloqueado: true,
        persona: { select: { nombre: true, apellidos: true } },
        grupos: { select: { id: true, nombre: true } }
      }
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { persona: true, grupos: true }
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...result } = usuario; 
    return result;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    const { password, grupoIds, ...userData } = dto;

    let dataToUpdate: any = {
      ...userData,
      fecha_caducidad: userData.fecha_caducidad ? new Date(userData.fecha_caducidad) : undefined,
      grupos: grupoIds ? { set: grupoIds.map(id => ({ id })) } : undefined,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password_hash = await bcrypt.hash(password, salt);
    }

    const actualizado = await this.prisma.usuario.update({ where: { id }, data: dataToUpdate });
    const { password_hash, ...result } = actualizado;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.update({ where: { id }, data: { estado_cuenta: false } });
  }
}