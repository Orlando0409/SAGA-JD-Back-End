import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Acta } from "./ActaEntities/Acta.Entity";
import { ArchivoActa } from "./ActaEntities/ArchivoActa.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ActaController } from "./actas.controller";
import { ActasService } from "./actas.service";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosModule } from "../Usuarios/Modules/usuarios.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Acta, ArchivoActa, Usuario]), 
        DropboxModule,
        UsuariosModule
    ],
    controllers: [ActaController],
    providers: [ActasService],
    exports: [ActasService],
})

export class ActasModule {}