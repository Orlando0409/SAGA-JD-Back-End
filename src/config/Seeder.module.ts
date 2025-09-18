import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './Seeder.service';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { UserEntity } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UserRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { EstadoProveedor } from 'src/Modules/Proveedores/ProveedorEntities/EstadoProveedor';    



@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, UserRol, Permiso, EstadoProveedor])
    ],
    providers: [SeederService],
    exports: [SeederService]
})
export class SeederModule {}