import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessGuard } from '../auth/guards/access.guard';
import { RequireAccess } from '../auth/decorators/access.decorator';

/** Módulo controlador o servicio para gestionar la entidad Usuarios. */
@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Extrae la IP real del cliente. `req.ip` puede devolver la del socket
   * directo (proxy/Vite/::1); se prioriza `x-forwarded-for`.
   */
  private obtenerIpReal(req: any): string {
    const xff = req.headers?.['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) {
      return xff.split(',')[0].trim();
    }
    const xReal = req.headers?.['x-real-ip'];
    if (typeof xReal === 'string' && xReal.trim()) {
      return xReal.trim();
    }
    return req.ip || '';
  }

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param loginDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Post('login')
  @ApiOperation({ summary: 'Login con nombre de usuario y contraseña' })
  login(@Body() loginDto: LoginDto, @Req() req: any) {
    return this.usuariosService.login(
      loginDto.nombre_usuario,
      loginDto.clave,
      loginDto.ip_cliente || this.obtenerIpReal(req),
      req.headers?.['user-agent'] as string | undefined,
    );
  }

  /**
   * Crea un nuevo registro o procesa una acción en el sistema.
   * @param createUsuarioDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard) // Solo exige token válido; cierra la sesión propia
  @ApiOperation({ summary: 'Cerrar la sesión actual (logout)' })
  logout(@Req() req: any) {
    return this.usuariosService.cerrarPropiaSesion(req.user?.jti);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 5)
  @ApiOperation({ summary: 'Crear usuario con clave encriptada' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  /**
   * Obtiene información de múltiples registros.
   * @returns Objeto complejo / PrismaResponse
   */
  @Get()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 1)
  @ApiOperation({ summary: 'Listar usuarios activos' })
  findAll() {
    return this.usuariosService.findAll();
  }

  /**
   * Obtiene información de un registro específico.
   * @param req - Datos o identificador requerido (any)
   * @returns Objeto complejo / PrismaResponse
   */
  @Get('perfil/actual')
  @UseGuards(JwtAuthGuard) // Solo validamos que el token exista y sea válido
  @ApiOperation({
    summary: 'Obtener datos y permisos actualizados del usuario logueado',
  })
  getPerfilActual(@Req() req: any) {
    // req.user.id viene del token interceptado por JwtAuthGuard
    return this.usuariosService.getPerfilActual(req.user.id);
  }

  /**
   * Permite a cualquier usuario autenticado editar su propio idioma y/o
   * contraseña — nunca otro campo ni otro usuario (opera sobre req.user.id).
   */
  @Patch('perfil/actual')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar idioma y/o contraseña propios' })
  actualizarPerfilPropio(@Req() req: any, @Body() dto: UpdatePerfilDto) {
    return this.usuariosService.actualizarPerfilPropio(req.user.id, dto);
  }

  /**
   * Obtiene el listado de sesiones activas (control de acceso).
   * @returns Objeto complejo / PrismaResponse
   */
  @Get('sesiones')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 5)
  @ApiOperation({ summary: 'Listar sesiones activas' })
  listarSesiones() {
    return this.usuariosService.listarSesionesActivas();
  }

  /**
   * Cierra todas las sesiones activas de un usuario.
   * @param id - Datos o identificador requerido (number)
   * @param req - Petición HTTP (para saber quién ejecuta la acción)
   * @returns Objeto complejo / PrismaResponse
   */
  @Post(':id/cerrar-sesiones')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 5)
  @ApiOperation({ summary: 'Cerrar todas las sesiones activas de un usuario' })
  cerrarSesiones(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usuariosService.cerrarSesiones(id, req.user.id);
  }

  /**
   * Obtiene información de un registro específico.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 1)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  /**
   * Actualiza parcialmente la información de un registro existente.
   * @param id - Datos o identificador requerido (number)
   * @param updateUsuarioDto - Datos o identificador requerido (Entidad | PrismaResponse)
   * @returns Objeto complejo / PrismaResponse
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 5)
  @ApiOperation({ summary: 'Actualizar usuario o cambiar clave' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * Elimina lógicamente o inactiva un registro en el sistema.
   * @param id - Datos o identificador requerido (number)
   * @returns Objeto complejo / PrismaResponse
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AccessGuard)
  @RequireAccess('Gestion de Usuarios', 5)
  @ApiOperation({ summary: 'Desactivar usuario' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
