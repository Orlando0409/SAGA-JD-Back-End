import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RolesService} from "../Service/roles.service";
import {RolesController} from "../Controller/roles.controller";
import {UserRol} from '../Entity/UserRol';

@Module({
  imports: [TypeOrmModule.forFeature([UserRol])],
  controllers: [RolesController],
  providers: [RolesService],
})

export class RolesModule {}