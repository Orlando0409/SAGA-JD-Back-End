import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ValidationsModule } from "src/Validations/Validations.module";
import { AbonadosModule } from "src/Modules/Afiliados/Modules/abonados.module";
import { SolicitudAfiliacionFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { SolicitudAfiliacionFisicaService } from "../Services/solicitudAfiliacion.service";
import { SolicitudAfiliacionFisicaController } from "../Controllers/solicitudAfiliacion.controller";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAfiliacionFisica, EstadoSolicitud]), DropboxModule, ValidationsModule, AbonadosModule],
    controllers: [SolicitudAfiliacionFisicaController],
    providers: [SolicitudAfiliacionFisicaService],
})

export class SolicitudAfiliacionFisicaModule {}