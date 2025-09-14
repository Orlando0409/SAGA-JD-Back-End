import { Controller, Get, Post, Body, Param, Delete, Put,Patch, ParseIntPipe } from '@nestjs/common';
import { RequierePermisos } from 'src/Modules/auth/Decorator/Permiso.decorator';
import { RequiereRoles } from 'src/Modules/auth/Decorator/Rol.decorator';
import { UsuariosService } from "../Services/usuarios.service";
import { CreateUserDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUserDto } from "../UsuarioDTO's/UpdateUser.dto";

@Controller('usuarios')

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
  FindUsuario(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOneUser(id);
  }

   @Post()
  @RequiereRoles('Administrador')
  CreateUsuario(@Body() createUserDto: CreateUserDto) {
    return this.usuariosService.createUser(createUserDto);
  }

  @Put(':id')
  @RequiereRoles('Administrador')
  UpdateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usuariosService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @RequiereRoles('Administrador')
  DeleteUser(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.softDeleteUser(id);
  }

  @Patch('restaurar/:id')
  @RequiereRoles('Administrador')
  restoreUser(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.restoreUser(id);
  }
}
