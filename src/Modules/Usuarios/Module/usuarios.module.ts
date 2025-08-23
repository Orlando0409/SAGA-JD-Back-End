import { Module } from '@nestjs/common';
import{ UsuariosService } from '../Service/usuarios.service';
import { UsuariosController } from '../Controller/usuarios.controller';
import { UserEntity } from '../Entity/User.Entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRol } from '../Entity/UserRol';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRol])],
  controllers: [ UsuariosController ],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
