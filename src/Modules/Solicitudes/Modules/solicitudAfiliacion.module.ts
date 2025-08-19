import { TypeOrmModule } from "@nestjs/typeorm";
import { SolicitudAfiliacion } from "../SolicitudEntities/Solicitud.Entity";
import { Module } from "@nestjs/common";
import { SolicitudAfiliacionController } from "../Controllers/solicitudAfiliacion.controller";
import { SolicitudesAfiliacionService } from "../Services/solicitudAfiliacion.service";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAfiliacion, SolicitudEstado])],
    controllers: [SolicitudAfiliacionController],
    providers: [SolicitudesAfiliacionService],
})

export class SolicitudAfiliacionModule {}