import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { SolicitudDesconexion } from "../../SolicitudEntities/Solicitud.Entity";
import { SolicitudDesconexionController } from "../Controllers/solicitudDesconexion.controller";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ValidationsModule } from "src/Validations/Validations.module";
import { SolicitudesDesconexionService } from "../Services/solicitudDesconexion.service";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudDesconexion, EstadoSolicitud]), DropboxModule, ValidationsModule],
    controllers: [SolicitudDesconexionController],
    providers: [SolicitudesDesconexionService],
})

export class SolicitudDesconexionModule {}