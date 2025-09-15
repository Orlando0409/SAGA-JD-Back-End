import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { RolesController } from '../Controllers/roles.controller';
import { RolesService } from '../Services/roles.service';
import { Permiso } from '../UsuarioEntities/Permiso.Entity';
import { UserRol } from '../UsuarioEntities/UsuarioRol.Entity';
import { UserEntity } from '../UsuarioEntities/Usuario.Entity';


@Module({
  imports: [TypeOrmModule.forFeature([UserRol, UserEntity, Permiso])],
  controllers: [RolesController],
  providers: [RolesService],
})

export class RolesModule {}