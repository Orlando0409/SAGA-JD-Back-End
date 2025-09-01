import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { SolicitudDesconexion } from "../SolicitudEntities/Solicitud.Entity";
import { SolicitudDesconexionController } from "../Controllers/solicitudDesconexion.controller";
import { SolicitudesDesconexionService } from "../Services/solicitudDesconexion.service";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudDesconexion, SolicitudEstado]), DropboxModule],
    controllers: [SolicitudDesconexionController],
    providers: [SolicitudesDesconexionService],
})

export class SolicitudDesconexionModule {}