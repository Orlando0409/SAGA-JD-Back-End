import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { UserEntity } from './UsuarioEntities/User.Entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [ UsuariosController ],
  providers: [UsuariosService]
})
export class UsuariosModule {}
