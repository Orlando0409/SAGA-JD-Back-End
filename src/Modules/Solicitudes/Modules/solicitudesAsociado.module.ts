import { Module } from "@nestjs/common";
import { SolicitudAsociado } from "../SolicitudEntities/Solicitud.Entity";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SolicitudAsociadoController } from "../Controllers/solicitudAsociado.controller";
import { SolicitudesAsociadoService } from "../Services/solicitudAsoacido.service";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAsociado, SolicitudEstado])],
    controllers: [SolicitudAsociadoController],
    providers: [SolicitudesAsociadoService],
})

export class SolicitudAsociadoModule {}