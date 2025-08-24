import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RolesService} from "../Services/roles.service";
import {RolesController} from "../Controllers/roles.controller";
import {UserRol} from '../UsuarioEntities/UsuarioRol.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRol])],
  controllers: [RolesController],
  providers: [RolesService],
})

export class RolesModule {}