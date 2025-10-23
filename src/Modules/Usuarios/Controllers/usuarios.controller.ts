import { Controller, Get, Post, Body, Param, Delete, Put, Patch, ParseIntPipe } from '@nestjs/common';
import { RequierePermisos } from 'src/Modules/auth/Decorator/Permiso.decorator';
import { RequiereRoles } from 'src/Modules/auth/Decorator/Rol.decorator';
import { UsuariosService } from "../Services/usuarios.service";
import { CreateUsuarioDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUsuarioDto } from "../UsuarioDTO's/UpdateUser.dto";

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService
  ) { }

  @Get()
  @RequierePermisos('usuarios', 'ver')
  AllUsuario() {
    return this.usuariosService.AllUser();
  }

  @Get(':id')
  FindUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOneUser(id);
  }

  @Post(':idUsuario')
  @RequiereRoles('Administrador')
  CreateUsuario(@Body() createUsuarioDto: CreateUsuarioDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.usuariosService.createUser(createUsuarioDto, idUsuario);
  }

  @Put(':id/:idUsuario')
  @RequiereRoles('Administrador')
  UpdateUsuario(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.usuariosService.updateUser(id, updateUsuarioDto, idUsuario);
  }

  @Patch('restaurar/:id/:idUsuario')
  @RequiereRoles('Administrador')
  RestoreUsuario(@Param('id', ParseIntPipe) id: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.usuariosService.restoreUser(id, idUsuario);
  }

  @Delete(':id/:idUsuario')
  @RequiereRoles('Administrador')
  SoftDeleteUsuario(@Param('id', ParseIntPipe) id: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.usuariosService.softDeleteUser(id, idUsuario);
  }
}
