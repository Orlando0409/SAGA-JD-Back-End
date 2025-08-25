import { Controller, Get, Post, Body, Param, Delete, Put,Patch, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RequierePermisos } from 'src/Modules/auth/Decorator/Permiso.decorator';
import { RequiereRoles } from 'src/Modules/auth/Decorator/Rol.decorator';
import { UsuariosService } from "../Services/usuarios.service";
import { CreateUserDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUserDto } from "../UsuarioDTO's/UpdateUser.dto";
import {AuthGuard} from "../../Autenticacion/Guards/auth.guard";
import { Permisos } from 'src/Modules/Autenticacion/Guards/permisos.decorator';

@Controller('usuarios')
@UseGuards(AuthGuard)

export class UsuariosController 
{
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @RequierePermisos('usuarios', 'ver')
  AllUsuario()
   {
    return this.usuariosService.AllUser();
   }


  @Get(':id')
  @Permisos('Usuarios.ver')
  FindUsuario(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOneUser(id);
  }

   @Post()
  @RequiereRoles('Administrador')
  CreateUsuario(@Body() createUserDto: CreateUserDto) {
    return this.usuariosService.createUser(createUserDto);
  }

  @Put(':id')
  @Permisos('Usuarios.editar')
  UpdateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usuariosService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @Permisos('Usuarios.editar')
  DeleteUser(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.softDeleteUser(id);
  }

  @Patch('restaurar/:id')
   @Permisos('Usuarios.editar')
  restoreUser(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.restoreUser(id);
  }
}
