import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login con nombre de usuario y contraseña' })
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto.nombre_usuario, loginDto.clave);
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario con clave encriptada' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios activos' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario o cambiar clave' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar usuario' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}