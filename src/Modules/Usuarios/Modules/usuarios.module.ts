import { Module } from '@nestjs/common';
import{ UsuariosService } from '../Services/usuarios.service';
import { UsuariosController } from '../Controllers/usuarios.controller';
import { Usuario } from '../UsuarioEntities/Usuario.Entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { Permiso } from '../UsuarioEntities/Permiso.Entity';
import { AuditoriaModule } from '../../Auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioRol, Permiso]), AuditoriaModule],
  controllers: [ UsuariosController ],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
