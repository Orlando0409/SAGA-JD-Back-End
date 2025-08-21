import { Module } from '@nestjs/common';
import{ UsuariosService } from '../Service/usuarios.service';
import { UsuariosController } from '../Controller/usuarios.controller';
import { UserEntity } from '../Entity/User.Entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRol } from '../Entity/UserRol';
import { Permiso } from '../Entity/Permiso.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRol, Permiso])],
  controllers: [ UsuariosController ],
  providers: [UsuariosService],
})
export class UsuariosModule {}
