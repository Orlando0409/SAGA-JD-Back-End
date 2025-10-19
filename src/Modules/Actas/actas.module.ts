import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Acta } from "./ActaEntities/Actas.Entity";
import { ArchivoActa } from "./ActaEntities/ArchivoActa.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ActaController } from "./actas.controller";
import { ActasService } from "./actas.service";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Module({
    imports: [TypeOrmModule.forFeature([Acta, ArchivoActa, Usuario]), DropboxModule],
    controllers: [ActaController],
    providers: [ActasService],
    exports: [ActasService],
})

export class ActasModule {}