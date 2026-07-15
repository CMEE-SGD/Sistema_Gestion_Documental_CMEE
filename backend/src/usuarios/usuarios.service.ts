import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

/** Módulo controlador o servicio para gestionar la entidad Usuarios. */
@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Ejecuta la operación de negocio create.
   * @param createUsuarioDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  async create(createUsuarioDto: CreateUsuarioDto) {
    const {
      persona_id,
      nombre_usuario,
      clave,
      fecha_caducidad,
      grupoIds,
      ...configData
    } = createUsuarioDto;

    // 1. Validar existencia de la persona y que no tenga una cuenta activa vinculada
    const persona = await this.prisma.persona.findUnique({
      where: { id: persona_id },
      include: { usuario: true },
    });
    if (!persona) throw new NotFoundException('Persona no encontrada');
    if (persona.usuario)
      throw new ConflictException('Esta persona ya tiene un usuario asignado');

    // 2. Validar unicidad del username
    const existeUsername = await this.prisma.usuario.findUnique({
      where: { nombre_usuario },
    });
    if (existeUsername)
      throw new ConflictException('El nombre de usuario ya está en uso');

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
        grupos:
          grupoIds?.length > 0
            ? {
                connect: grupoIds.map((id) => ({ id })),
              }
            : undefined,
      },
      select: {
        id: true,
        nombre_usuario: true,
        estado_cuenta: true,
        bloqueado: true,
        persona: { select: { nombre: true, apellidos: true } },
        grupos: { select: { id: true, nombre: true } },
      },
    });
  }

  // Lista todos los usuarios activos
  /**
   * Ejecuta la operación de negocio findAll.
   * @returns Objeto complejo / PrismaResponse
   */
  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre_usuario: true,
        estado_cuenta: true,
        bloqueado: true,
        fecha_caducidad: true,
        persona: { select: { id: true, nombre: true, apellidos: true } },
        grupos: { select: { id: true, nombre: true } },
      },
    });
  }

  // Trae un usuario específico con todas sus relaciones
  /**
   * Ejecuta la operación de negocio findOne.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        // 1. Incluimos la Persona
        persona: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            foto_ruta: true,
            puestos: {
              take: 1,
              orderBy: { orden_puesto: 'asc' },
              include: { puesto: { select: { nombre: true } } },
            },
          },
        }, // <--- Fíjate que aquí se cierra persona

        // 2. Incluimos los Grupos (al mismo nivel)
        grupos: {
          select: { id: true, nombre: true },
        },
      },
    });

    if (!usuario)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    // Evitamos enviar el hash de la contraseña al frontend
    const { password_hash, ...result } = usuario;
    return result;
  }

  // Actualiza datos, relaciones y clave (si se provee)
  /**
   * Ejecuta la operación de negocio update.
   * @param id - Datos o identificador requerido (number)
   * @param updateUsuarioDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id); // Validamos que exista

    // updateUsuarioDto debe estar configurado con PartialType en NestJS
    const { clave, fecha_caducidad, grupoIds, ...configData } =
      updateUsuarioDto as any;

    const dataToUpdate: any = { ...configData };

    // Si se envía una nueva clave, la encriptamos antes de guardar
    if (clave) {
      dataToUpdate.password_hash = await bcrypt.hash(clave, 10);
    }

    if (fecha_caducidad !== undefined) {
      dataToUpdate.fecha_caducidad = fecha_caducidad
        ? new Date(fecha_caducidad)
        : null;
    }

    // Si se envían grupos, usamos 'set' para reemplazar la lista anterior
    if (grupoIds) {
      dataToUpdate.grupos = {
        set: grupoIds.map((gId: number) => ({ id: gId })),
      };
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
        grupos: { select: { id: true, nombre: true } },
      },
    });
  }

  // Validar credenciales y retornar token (simple)
  // En el método login()
  /**
   * Registra un intento de inicio de sesión (éxito o fallo) en la bitácora.
   * No bloquea el flujo de login si falla el guardado.
   */
  private registrarIntentoLogin(params: {
    nombre_usuario: string;
    exito: boolean;
    motivo_fallo?: string;
    usuario_id?: number | null;
    ip?: string;
  }) {
    this.prisma.intentoLogin
      .create({
        data: {
          nombre_usuario: params.nombre_usuario,
          exito: params.exito,
          motivo_fallo: params.motivo_fallo ?? null,
          usuario_id: params.usuario_id ?? null,
          ip: params.ip ?? null,
        },
      })
      .catch((err) => console.error('Error guardando intento de login:', err));
  }

  /**
   * Ejecuta la operación de negocio login.
   * @param nombre_usuario - Datos o identificador requerido (string)
   * @param clave - Datos o identificador requerido (string)
   * @param ip - Dirección IP del cliente que realiza el intento (string)
   * @returns Objeto complejo / PrismaResponse
   */
  async login(nombre_usuario: string, clave: string, ip?: string) {
    // 1. Intercepción del Usuario "Dios" (En Memoria)
    const godUsername = process.env.GOD_USERNAME;
    const godPassword = process.env.GOD_PASSWORD;

    if (
      godUsername &&
      godPassword &&
      nombre_usuario === godUsername &&
      clave === godPassword
    ) {
      // Construimos un payload virtual con permisos máximos (Nivel 5)
      const godPayload = {
        id: -1, // ID ficticio negativo para evitar choques con la BD
        nombre_usuario: godUsername,
        estado_cuenta: true,
        bloqueado: false,
        persona: {
          nombre: 'Super',
          apellidos: 'Administrador (Memoria)',
          foto_ruta: '',
          puestos: [{ puesto: { nombre: 'SYSTEM ROOT' } }],
        },
        grupos: [
          {
            id: -1,
            nombre: 'GOD_MODE',
            aplicaciones: [
              { aplicacion: { nombre: 'Gestion de Usuarios' }, nivel: 5 },
              { aplicacion: { nombre: 'Recursos Humanos' }, nivel: 5 },
              { aplicacion: { nombre: 'Gestor Documental' }, nivel: 5 },
              { aplicacion: { nombre: 'Laboratorios' }, nivel: 5 },
              { aplicacion: { nombre: 'Auditoria Global' }, nivel: 5 },
            ],
          },
        ],
      };

      this.registrarIntentoLogin({ nombre_usuario, exito: true, ip });

      return {
        ...godPayload,
        token: this.jwtService.sign({ sub: -1, isGod: true }), // Firmamos el token con el ID ficticio
      };
    }

    // 2. Flujo normal para el resto de usuarios (Consulta a BD)
    const usuario = await this.prisma.usuario.findUnique({
      where: { nombre_usuario },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            foto_ruta: true,
            puestos: {
              where: { activo: true },
              orderBy: { orden_puesto: 'asc' },
              take: 1,
              include: {
                puesto: { select: { nombre: true } },
                departamento: {
                  // PATCH: Include ya existente — extrae laboratorio_id correctamente
                  include: {
                    laboratorio: { select: { id: true, nombre: true } },
                  },
                },
              },
            },
          },
        },
        grupos: {
          include: { aplicaciones: { include: { aplicacion: true } } },
        },
      },
    });

    if (!usuario) {
      this.registrarIntentoLogin({
        nombre_usuario,
        exito: false,
        motivo_fallo: 'usuario_no_encontrado',
        ip,
      });
      throw new NotFoundException('Usuario no encontrado');
    }
    if (usuario.bloqueado) {
      this.registrarIntentoLogin({
        nombre_usuario,
        exito: false,
        motivo_fallo: 'usuario_bloqueado',
        usuario_id: usuario.id,
        ip,
      });
      throw new NotFoundException('El usuario está bloqueado');
    }
    if (!usuario.estado_cuenta) {
      this.registrarIntentoLogin({
        nombre_usuario,
        exito: false,
        motivo_fallo: 'cuenta_inactiva',
        usuario_id: usuario.id,
        ip,
      });
      throw new NotFoundException('La cuenta está inactiva');
    }

    const passwordValida = await bcrypt.compare(clave, usuario.password_hash);
    if (!passwordValida) {
      this.registrarIntentoLogin({
        nombre_usuario,
        exito: false,
        motivo_fallo: 'clave_incorrecta',
        usuario_id: usuario.id,
        ip,
      });
      throw new NotFoundException('Usuario o contraseña incorrectos');
    }

    this.registrarIntentoLogin({
      nombre_usuario,
      exito: true,
      usuario_id: usuario.id,
      ip,
    });

    const { password_hash, ...result } = usuario;
    const payload = { sub: usuario.id };

    const laboratorioId =
      usuario.persona?.puestos?.[0]?.departamento?.laboratorio?.id ?? null;

    return {
      ...result,
      laboratorio_id: laboratorioId,
      token: this.jwtService.sign(payload),
    };
  }

  // Borrado lógico desactivando la cuenta
  /**
   * Ejecuta la operación de negocio remove.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { estado_cuenta: false },
    });
  }

  // Añadir dentro de UsuariosService
  /**
   * Ejecuta la operación de negocio getPerfilActual.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  async getPerfilActual(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            foto_ruta: true,
            puestos: {
              where: { activo: true },
              orderBy: { orden_puesto: 'asc' },
              take: 1,
              include: {
                puesto: { select: { nombre: true } },
                departamento: {
                  // PATCH: Include ya existente — extrae laboratorio_id correctamente
                  include: {
                    laboratorio: { select: { id: true, nombre: true } },
                  },
                },
              },
            },
          },
        },
        grupos: {
          include: {
            aplicaciones: { include: { aplicacion: true } },
          },
        },
      },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const { password_hash, ...result } = usuario;

    const laboratorioId =
      usuario.persona?.puestos?.[0]?.departamento?.laboratorio?.id ?? null;

    return { ...result, laboratorio_id: laboratorioId };
  }
}
