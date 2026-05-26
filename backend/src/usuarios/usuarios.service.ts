import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { persona_id, nombre_usuario, clave, fecha_caducidad, grupoIds, ...configData } = createUsuarioDto;

    // 1. Validar existencia de la persona y que no tenga una cuenta activa vinculada
    const persona = await this.prisma.persona.findUnique({ where: { id: persona_id }, include: { usuario: true } });
    if (!persona) throw new NotFoundException('Persona no encontrada');
    if (persona.usuario) throw new ConflictException('Esta persona ya tiene un usuario asignado');

    // 2. Validar unicidad del username
    const existeUsername = await this.prisma.usuario.findUnique({ where: { nombre_usuario } });
    if (existeUsername) throw new ConflictException('El nombre de usuario ya está en uso');

    // 3. Hashear la contraseña recibida
    const saltRounds = 10;
    const hash = await bcrypt.hash(clave, saltRounds);

    // 4. Inserción con el mapeo correcto hacia el modelo
    return this.prisma.usuario.create({
      data: {
        persona_id,
        nombre_usuario,
        password_hash: hash,
        fecha_caducidad: fecha_caducidad ? new Date(fecha_caducidad) : null,
        ...configData,
        grupos: grupoIds?.length > 0 ? {
          connect: grupoIds.map(id => ({ id }))
        } : undefined
      },
      select: {
        id: true,
        nombre_usuario: true,
        estado_cuenta: true,
        bloqueado: true,
        persona: { select: { nombre: true, apellidos: true } },
        grupos: { select: { id: true, nombre: true } }
      }
    });
  }

  // Lista todos los usuarios activos
  async findAll() {
    return this.prisma.usuario.findMany({
      where: { estado_cuenta: true },
      select: {
        id: true,
        nombre_usuario: true,
        estado_cuenta: true,
        bloqueado: true,
        fecha_caducidad: true,
        persona: { select: { id: true, nombre: true, apellidos: true } },
        grupos: { select: { id: true, nombre: true } }
      }
    });
  }

  // Trae un usuario específico con todas sus relaciones
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        persona: true,
        grupos: true
      }
    });
    
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    
    // Evitamos enviar el hash de la contraseña al frontend por seguridad
    const { password_hash, ...result } = usuario;
    return result;
  }

  // Actualiza datos, relaciones y clave (si se provee)
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id); // Validamos que exista
    
    // updateUsuarioDto debe estar configurado con PartialType en NestJS
    const { clave, fecha_caducidad, grupoIds, ...configData } = updateUsuarioDto as any;

    let dataToUpdate: any = { ...configData };

    // Si se envía una nueva clave, la encriptamos antes de guardar
    if (clave) {
      dataToUpdate.password_hash = await bcrypt.hash(clave, 10);
    }

    if (fecha_caducidad !== undefined) {
      dataToUpdate.fecha_caducidad = fecha_caducidad ? new Date(fecha_caducidad) : null;
    }

    // Si se envían grupos, usamos 'set' para reemplazar la lista anterior
    if (grupoIds) {
      dataToUpdate.grupos = { set: grupoIds.map((gId: number) => ({ id: gId })) };
    }

    return this.prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nombre_usuario: true,
        estado_cuenta: true,
        bloqueado: true,
        persona: { select: { nombre: true, apellidos: true } },
        grupos: { select: { id: true, nombre: true } }
      }
    });
  }

  // Validar credenciales y retornar token (simple)
  async login(nombre_usuario: string, clave: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { nombre_usuario },
      include: {
        persona: true,
        grupos: { select: { id: true, nombre: true } }
      }
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    
    if (usuario.bloqueado) throw new NotFoundException('El usuario está bloqueado');
    
    if (!usuario.estado_cuenta) throw new NotFoundException('La cuenta está inactiva');

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(clave, usuario.password_hash);
    if (!passwordValida) throw new NotFoundException('Usuario o contraseña incorrectos');

    // Retornar usuario sin password_hash
    const { password_hash, ...result } = usuario;
    return {
      ...result,
      token: `${usuario.id}-${usuario.nombre_usuario}` // Token simple para desarrollo
    };
  }

  // Borrado lógico desactivando la cuenta
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { estado_cuenta: false } 
    });
  }
}