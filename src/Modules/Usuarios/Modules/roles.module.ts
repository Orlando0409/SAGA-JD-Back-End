import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
<<<<<<< HEAD:src/Modules/Usuarios/Module/roles.module.ts
import {RolesService} from "../Service/roles.service";
import {RolesController} from "../Controller/roles.controller";
import {UserRol} from '../Entity/UserRol';
import { Permiso } from '../Entity/Permiso.Entity';
=======
import {RolesService} from "../Services/roles.service";
import {RolesController} from "../Controllers/roles.controller";
import {UserRol} from '../UsuarioEntities/UsuarioRol.Entity';
>>>>>>> Andres-features:src/Modules/Usuarios/Modules/roles.module.ts

@Module({
  imports: [TypeOrmModule.forFeature([UserRol, Permiso])],
  controllers: [RolesController],
  providers: [RolesService],
})

export class RolesModule {}