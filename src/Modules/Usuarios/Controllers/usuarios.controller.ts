import { Controller, Get, Post, Body, Param, Delete, Put,Patch, ParseIntPipe } from '@nestjs/common';
import { RequierePermisos } from 'src/Modules/auth/Decorator/Permiso.decorator';
import { RequiereRoles } from 'src/Modules/auth/Decorator/Rol.decorator';
import { UsuariosService } from "../Services/usuarios.service";
import { CreateUsuarioDto } from "../UsuarioDTO's/CreateUser.dto";
import { UpdateUsuarioDto } from "../UsuarioDTO's/UpdateUser.dto";

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
  CreateUsuario(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.createUser(createUsuarioDto);
  }

  @Put(':id')
  @RequiereRoles('Administrador')
  UpdateUsuario(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.updateUser(id, updateUsuarioDto);
  }

  @Delete(':id')
  @RequiereRoles('Administrador')
  DeleteUsuario(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.softDeleteUser(id);
  }

  @Patch('restaurar/:id')
  @RequiereRoles('Administrador')
  restoreUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.restoreUser(id);
  }
}
