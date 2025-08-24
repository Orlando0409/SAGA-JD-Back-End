import { Module } from '@nestjs/common';
import{ UsuariosService } from '../Services/usuarios.service';
import { UsuariosController } from '../Controllers/usuarios.controller';
import { UserEntity } from '../UsuarioEntities/Usuario.Entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { Permiso } from '../UsuarioEntities/Permiso.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRol, Permiso])],
  controllers: [ UsuariosController ],
  providers: [UsuariosService],
})
export class UsuariosModule {}
