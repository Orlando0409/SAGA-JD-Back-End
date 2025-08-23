import { Controller, Get, Post, Body, Param, Delete, Put,Patch, ParseIntPipe,UseGuards,} from '@nestjs/common';
import { UsuariosService } from "../Service/usuarios.service";
import { CreateUserDto } from "../DTO's/CreateUser.dto";
import { UpdateUserDto } from "../DTO's/UpdateUser.dto";
import {AuthGuard} from "../../Autenticacion/Guards/auth.guard";
import { Permisos } from "../../Autenticacion/Guards/permisos.decorator";

@Controller('usuarios')
@UseGuards(AuthGuard)

export class UsuariosController 
{
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Permisos('Usuarios.ver')
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
   @Permisos('Usuarios.editar')
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
