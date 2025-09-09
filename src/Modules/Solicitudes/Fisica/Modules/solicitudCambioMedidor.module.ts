import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { SolicitudCambioMedidor } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidorController } from "../Controllers/solicitudCambioMedidor.controller";
import { ValidationsModule } from "src/Validations/Validations.module";
import { SolicitudesCambioMedidorService } from "../Services/solicitudCambioMedidor.service";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudCambioMedidor, EstadoSolicitud]), ValidationsModule],
    controllers: [SolicitudCambioMedidorController],
    providers: [SolicitudesCambioMedidorService],
})

export class SolicitudCambioMedidorModule {}