import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesGateway } from '../notificaciones/notificaciones.gateway';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import {
  ipEnRangosPermitidos,
  esLoopback,
} from '../common/ip-ranges';

/** Módulo controlador o servicio para gestionar la entidad Usuarios. */
@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificacionesGateway: NotificacionesGateway,
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
    return this.prisma.intentoLogin
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
   * Evalúa si un usuario acumuló suficientes intentos fallidos CONSECUTIVOS
   * (desde su último login exitoso) como para bloquear la cuenta
   * automáticamente, según `ConfiguracionGeneral.max_intentos_fallidos_login`.
   * @returns true si la cuenta quedó bloqueada por esta evaluación.
   */
  private async evaluarBloqueoAutomatico(usuarioId: number): Promise<boolean> {
    const config = await this.prisma.configuracionGeneral.findUnique({
      where: { id: 1 },
    });
    const maxIntentos = config?.max_intentos_fallidos_login ?? 5;

    const ultimosIntentos = await this.prisma.intentoLogin.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { fecha_hora: 'desc' },
      take: maxIntentos,
    });

    let fallosConsecutivos = 0;
    for (const intento of ultimosIntentos) {
      if (intento.exito) break;
      fallosConsecutivos++;
    }

    if (fallosConsecutivos >= maxIntentos) {
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { bloqueado: true },
      });
      return true;
    }
    return false;
  }

  /**
   * Ejecuta la operación de negocio login.
   * @param nombre_usuario - Datos o identificador requerido (string)
   * @param clave - Datos o identificador requerido (string)
   * @param ip - Dirección IP del cliente que realiza el intento (string)
   * @returns Objeto complejo / PrismaResponse
   */
  async login(nombre_usuario: string, clave: string, ip?: string, userAgent?: string) {
    // 1. Intercepción del Usuario "Dios" (En Memoria)
    const godUsername = process.env.GOD_USERNAME;
    const godPassword = process.env.GOD_PASSWORD;

    if (
      godUsername &&
      godPassword &&
      nombre_usuario === godUsername &&
      clave === godPassword
    ) {
      const jti = randomUUID();

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
        token: this.jwtService.sign(
          { sub: -1, isGod: true },
          { expiresIn: '8h', jwtid: jti },
        ),
        // El dios no tiene sesión en BD (no existe como registro de usuario);
        // el guard acepta su token con isGod:true como hoy.
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
      // Se espera a que quede registrado antes de evaluar el bloqueo, para
      // que este mismo intento cuente en el conteo de fallos consecutivos.
      await this.registrarIntentoLogin({
        nombre_usuario,
        exito: false,
        motivo_fallo: 'clave_incorrecta',
        usuario_id: usuario.id,
        ip,
      });
      const bloqueadoAhora = await this.evaluarBloqueoAutomatico(usuario.id);
      if (bloqueadoAhora) {
        throw new NotFoundException(
          'Demasiados intentos fallidos. La cuenta ha sido bloqueada, contacte al administrador.',
        );
      }
      throw new NotFoundException('Usuario o contraseña incorrectos');
    }

    this.registrarIntentoLogin({
      nombre_usuario,
      exito: true,
      usuario_id: usuario.id,
      ip,
    });

    const { password_hash, ...result } = usuario;

    // Nuevo: sesión activa con JTI revocable (control de acceso)
    const jti = randomUUID();
    const fechaExpiracion = new Date(Date.now() + 8 * 60 * 60 * 1000);

    // Control de acceso por rango de IP: si la IP viene de fuera de los
    // rangos permitidos, la sesión queda en espera de aprobación.
    let enEspera = false;
    if (ip) {
      const config = await this.prisma.configuracionGeneral.findUnique({
        where: { id: 1 },
        select: { ip_rangos_permitidos: true },
      });
      const rangos = config?.ip_rangos_permitidos ?? null;
      // Sin rangos configurados → acceso directo. Loopback (dev local) → directo.
      if (rangos && rangos.trim() && !esLoopback(ip)) {
        enEspera = !ipEnRangosPermitidos(ip, rangos);
      }
    }

    await this.prisma.sesionActiva.create({
      data: {
        usuario_id: usuario.id,
        token_jti: jti,
        ip: ip ?? null,
        user_agent: userAgent ?? null,
        fecha_inicio: new Date(),
        fecha_expiracion: fechaExpiracion,
        en_espera: enEspera,
        updatedAt: new Date(),
      },
    });

    // Registra el acceso en la bitácora general (Auditoria)
    const personaNombre = usuario.persona
      ? `${usuario.persona.nombre ?? ''} ${usuario.persona.apellidos ?? ''}`.trim()
      : null;
    await this.prisma.auditoria
      .create({
        data: {
          usuario_id: usuario.id,
          modulo: 'ACCESOS',
          accion: 'Acceso a la plataforma',
          descripcion: `Inicio de sesión exitoso de ${personaNombre || nombre_usuario}${ip ? ` — IP: ${ip}` : ''}.`,
          entidad_id: usuario.id,
        },
      })
      .catch((err) =>
        console.error('Error guardando acceso en auditoría:', err),
      );

    const payload = { sub: usuario.id, isGod: false };

    const laboratorioId =
      usuario.persona?.puestos?.[0]?.departamento?.laboratorio?.id ?? null;

    return {
      ...result,
      laboratorio_id: laboratorioId,
      acceso_pendiente: enEspera,
      token: this.jwtService.sign(payload, {
        expiresIn: '8h',
        jwtid: jti,
      }),
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

  /**
   * Permite a un usuario autenticado actualizar su propio idioma y/o
   * contraseña — nunca opera sobre otro usuario ni sobre campos
   * administrativos (grupos, bloqueado, estado_cuenta).
   */
  async actualizarPerfilPropio(usuarioId: number, dto: UpdatePerfilDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const dataToUpdate: Prisma.UsuarioUpdateInput = {};

    if (dto.idioma !== undefined) {
      dataToUpdate.idioma = dto.idioma;
    }

    if (dto.clave_nueva) {
      if (!dto.clave_actual) {
        throw new BadRequestException(
          'Debe indicar su contraseña actual para establecer una nueva',
        );
      }
      const claveActualValida = await bcrypt.compare(
        dto.clave_actual,
        usuario.password_hash,
      );
      if (!claveActualValida) {
        throw new BadRequestException('La contraseña actual no es correcta');
      }
      dataToUpdate.password_hash = await bcrypt.hash(dto.clave_nueva, 10);
      dataToUpdate.cambiar_clave_proxima_sesion = false;
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: dataToUpdate,
    });

    const { password_hash, ...result } = actualizado;
    return result;
  }

  /**
   * Lista las sesiones activas de usuarios (no expiradas, no cerradas),
   * con datos del usuario para mostrarlas en control de acceso.
   * @param soloEspera - Si true, devuelve únicamente las sesiones en espera de aprobación.
   */
  async listarSesionesActivas(soloEspera?: boolean) {
    return this.prisma.sesionActiva.findMany({
      where: {
        fecha_cierre: null,
        fecha_expiracion: { gt: new Date() },
        ...(soloEspera ? { en_espera: true } : {}),
      },
      orderBy: { fecha_inicio: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombre_usuario: true,
            persona: {
              select: {
                nombre: true,
                apellidos: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Aprueba una sesión que estaba en espera de aprobación (acceso desde IP
   * fuera de rango). Solo afecta a ESA sesión — el siguiente login desde la
   * misma IP volverá a requerir aprobación.
   * @param sesionId - ID de la sesión a aprobar
   * @param aprobadaPorId - ID del administrador que aprueba
   */
  async aprobarSesion(sesionId: number, aprobadaPorId: number) {
    const sesion = await this.prisma.sesionActiva.findUnique({
      where: { id: sesionId },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    if (sesion.fecha_cierre) {
      throw new BadRequestException('La sesión ya fue cerrada');
    }
    if (!sesion.en_espera) {
      throw new BadRequestException('La sesión no está en espera de aprobación');
    }

    return this.prisma.sesionActiva.update({
      where: { id: sesionId },
      data: {
        en_espera: false,
        aprobada_por_id: aprobadaPorId,
        fecha_aprobacion: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Cierra todas las sesiones activas de un usuario, revocando su token
   * al instante (el JWT queda huérfano y JwtStrategy lo rechaza).
   * @param usuarioId - Usuario al que se le cierran las sesiones
   * @param cerradaPorId - ID del administrador que ejecuta la acción
   */
  async cerrarSesiones(usuarioId: number, cerradaPorId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const resultado = await this.prisma.sesionActiva.updateMany({
      where: {
        usuario_id: usuarioId,
        fecha_cierre: null,
      },
      data: {
        fecha_cierre: new Date(),
        cerrada_por_id: cerradaPorId,
        updatedAt: new Date(),
      },
    });

    if (resultado.count > 0) {
      this.notificacionesGateway.emitirSesionCerrada(usuarioId);
    }

    return { cerradas: resultado.count };
  }

  /**
   * Cierra la sesión del usuario que hace logout (la suya propia),
   * marcando `fecha_cierre`. El jti viene dentro del token (JwtStrategy
   * lo expone en req.user.jti); si no existe (god/before), no-op.
   * @param jti - Identificador de la sesión vigente
   */
  async cerrarPropiaSesion(jti?: string) {
    if (!jti) return { cerradas: 0 };
    const resultado = await this.prisma.sesionActiva.updateMany({
      where: {
        token_jti: jti,
        fecha_cierre: null,
      },
      data: {
        fecha_cierre: new Date(),
        updatedAt: new Date(),
      },
    });
    return { cerradas: resultado.count };
  }
}
