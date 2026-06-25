import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginDto } from './dto/login.dto';
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
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param loginDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
    @Post('login')
  @ApiOperation({ summary: 'Login con nombre de usuario y contraseña' })
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto.nombre_usuario, loginDto.clave);
  }

  /**
     * Crea un nuevo registro o procesa una acción en el sistema.
     * @param createUsuarioDto - Datos o identificador requerido (Entidad | PrismaResponse)
     * @returns Objeto complejo / PrismaResponse
     */
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
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    @Get(':id')
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
  @ApiOperation({ summary: 'Actualizar usuario o cambiar clave' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
     * Elimina lógicamente o inactiva un registro en el sistema.
     * @param id - Datos o identificador requerido (number)
     * @returns Objeto complejo / PrismaResponse
     */
    @Delete(':id')
  @ApiOperation({ summary: 'Desactivar usuario' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }

  /**
     * Obtiene información de un registro específico.
     * @param req - Datos o identificador requerido (any)
     * @returns Objeto complejo / PrismaResponse
     */
    @Get('perfil/actual')
  @UseGuards(JwtAuthGuard) // Solo validamos que el token exista y sea válido
  @ApiOperation({ summary: 'Obtener datos y permisos actualizados del usuario logueado' })
  getPerfilActual(@Req() req: any) {
    // req.user.id viene del token interceptado por JwtAuthGuard
    return this.usuariosService.getPerfilActual(req.user.id);
  }
}