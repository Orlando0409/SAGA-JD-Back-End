import { TypeOrmModule } from "@nestjs/typeorm";
import { SolicitudAfiliacion } from "../../SolicitudEntities/Solicitud.Entity";
import { Module } from "@nestjs/common";
import { SolicitudAfiliacionController } from "../Controllers/solicitudAfiliacion.controller";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ValidationsModule } from "src/Validations/Validations.module";
import { AbonadosModule } from "src/Modules/Afiliados/Modules/abonados.module";
import { SolicitudesAfiliacionService } from "../Services/solicitudAfiliacion.service";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAfiliacion, EstadoSolicitud]), DropboxModule, ValidationsModule, AbonadosModule],
    controllers: [SolicitudAfiliacionController],
    providers: [SolicitudesAfiliacionService],
})

export class SolicitudAfiliacionModule {}