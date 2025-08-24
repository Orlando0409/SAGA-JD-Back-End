import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './Seender.service';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { UserEntity } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UserRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';



@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, UserRol, Permiso])
    ],
    providers: [SeederService],
    exports: [SeederService]
})
export class SeenderModule {}