import { Controller, Get, Post, Body, Param, Delete, Put,Patch, ParseIntPipe } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { UsuariosService } from "../Service/usuarios.service";
import { CreateUserDto } from "../DTO's/CreateUser.dto";
import { UpdateUserDto } from "../DTO's/UpdateUser.dto";
import { RequierePermisos } from 'src/Modules/auth/Decorator/Permiso.decorator';
import { RequiereRoles } from 'src/Modules/auth/Decorator/Rol.decorator';



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
  UpdateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usuariosService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  DeleteUser(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.softDeleteUser(id);
  }

  @Patch('restaurar/:id')
  restoreUser(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.restoreUser(id);
  }
}
