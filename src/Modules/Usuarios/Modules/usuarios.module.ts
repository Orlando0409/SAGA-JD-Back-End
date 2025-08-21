import { Module } from '@nestjs/common';
import{ UsuariosService } from '../Services/usuarios.service';
import { UsuariosController } from '../Controllers/usuarios.controller';
import { UserEntity } from '../UsuarioEntities/User.Entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRol } from '../UsuarioEntities/UserRol.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRol])],
  controllers: [ UsuariosController ],
  providers: [UsuariosService]
})
export class UsuariosModule {}
