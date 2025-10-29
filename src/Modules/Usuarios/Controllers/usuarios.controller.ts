import { Req, Request } from '@nestjs/common';
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
  FindUsuario(
    @Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOneUser(id);
  }

  @Post()
  @RequiereRoles('Administrador')
  CreateUsuario(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @Request() req: any
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.usuariosService.createUser(createUsuarioDto, idUsuario);
  }

  @Put(':id')
  @RequiereRoles('Administrador')
  UpdateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Request() req: any
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.usuariosService.updateUser(id, updateUsuarioDto, idUsuario);
  }

  @Patch('restaurar/:id')
  @RequiereRoles('Administrador')
  RestoreUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.usuariosService.restoreUser(id, idUsuario);
  }

  @Delete(':id')
  @RequiereRoles('Administrador')
  SoftDeleteUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.usuariosService.softDeleteUser(id, idUsuario);
  }
}
