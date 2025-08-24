import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { SolicitudCambioMedidor } from "../SolicitudEntities/Solicitud.Entity";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidorController } from "../Controllers/solicitudCambioMedidor.controller";
import { SolicitudesMedidorService } from "../Services/solicitudCambioMedidor.service";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudCambioMedidor, SolicitudEstado])],
    controllers: [SolicitudCambioMedidorController],
    providers: [SolicitudesMedidorService],
})

export class SolicitudCambioMediadorModule {}