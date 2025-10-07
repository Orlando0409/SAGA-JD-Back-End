import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { RolesController } from '../Controllers/roles.controller';
import { RolesService } from '../Services/roles.service';
import { Permiso } from '../UsuarioEntities/Permiso.Entity';
import { UsuarioRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { Usuario } from '../UsuarioEntities/Usuario.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioRol, Usuario, Permiso])],
  controllers: [RolesController],
  providers: [RolesService],
})

export class RolesModule {}