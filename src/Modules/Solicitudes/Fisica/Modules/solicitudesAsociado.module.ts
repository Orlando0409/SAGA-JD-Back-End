import { Module } from "@nestjs/common";
import { SolicitudAsociado } from "../../SolicitudEntities/Solicitud.Entity";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SolicitudAsociadoController } from "../Controllers/solicitudAsociado.controller";
import { ValidationsModule } from "src/Validations/Validations.module";
import { AsociadosModule } from "src/Modules/Afiliados/Modules/asociados.module";
import { SolicitudesAsociadoService } from "../Services/solicitudAsociado.service";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAsociado, EstadoSolicitud]), ValidationsModule, AsociadosModule],
    controllers: [SolicitudAsociadoController],
    providers: [SolicitudesAsociadoService],
})

export class SolicitudAsociadoModule {}