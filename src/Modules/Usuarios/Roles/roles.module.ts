import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RolesService} from './roles.service';
import {RolesController} from './roles.controller';
import {UserRol} from '../Roles/UserRol';

@Module({
  imports: [TypeOrmModule.forFeature([UserRol])],
  controllers: [RolesController],
  providers: [RolesService],
})

export class RolesModule {}