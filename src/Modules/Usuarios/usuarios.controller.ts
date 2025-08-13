import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from "./usuarios.service";
import { CreateUserDto } from "./UsuarioDTO'S/create-user.dto";
import { UpdateUserDto } from "./UsuarioDTO'S/update-user.dto";


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
    return this.usuariosService.deleteUser(id);
  }
}
