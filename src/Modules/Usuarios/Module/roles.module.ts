import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RolesService} from "../Service/roles.service";
import {RolesController} from "../Controller/roles.controller";
import {UserRol} from '../Entity/UserRol';
import { Permiso } from '../Entity/Permiso.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRol, Permiso])],
  controllers: [RolesController],
  providers: [RolesService],
})

export class RolesModule {}