import { Controller, Get, Post, Body, Param, Delete, Put,Patch, ParseIntPipe } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { UsuariosService } from "../Services/usuarios.service";
import { CreateUserDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUserDto } from "../UsuarioDTO's/UpdateUser.dto";

@Controller('usuarios')

export class UsuariosController 
{
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  AllUsuario()
   {
    return this.usuariosService.AllUser();
   }

  @Get(':id')
  FindUsuario(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOneUser(id);
  }

   @Post()
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
