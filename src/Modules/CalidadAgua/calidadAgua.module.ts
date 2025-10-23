import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalidadAgua } from "./CalidadAguaEntities/CalidadAgua.Entity";
import { CalidadAguaController } from "./calidadAgua.controller";
import { CalidadAguaService } from "./calidadAgua.service";
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';

@Module({
    imports: [ TypeOrmModule.forFeature([CalidadAgua, Usuario]), DropboxModule, AuditoriaModule, UsuariosModule ],
    controllers: [CalidadAguaController],
    providers: [CalidadAguaService],
    exports: [CalidadAguaService]
})

export class CalidadAguaModule {}