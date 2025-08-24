import { Module } from '@nestjs/common';
import{ UsuariosService } from '../Services/usuarios.service';
import { UsuariosController } from '../Controllers/usuarios.controller';
import { UserEntity } from '../UsuarioEntities/Usuario.Entity';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD:src/Modules/Usuarios/Module/usuarios.module.ts
import { UserRol } from '../Entity/UserRol';
import { Permiso } from '../Entity/Permiso.Entity';
=======
import { UserRol } from '../UsuarioEntities/UsuarioRol.Entity';
>>>>>>> Andres-features:src/Modules/Usuarios/Modules/usuarios.module.ts

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserRol, Permiso])],
  controllers: [ UsuariosController ],
  providers: [UsuariosService],
})
export class UsuariosModule {}
