import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../Modules/Usuarios/Entity/User.Entity';
import { UserRol } from '../Modules/Usuarios/Entity/UserRol';
import { Permiso } from '../Modules/Usuarios/Entity/Permiso.Entity';
import { SeederService } from './Seender.service';



@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, UserRol, Permiso])
    ],
    providers: [SeederService],
    exports: [SeederService]
})
export class SeenderModule {}