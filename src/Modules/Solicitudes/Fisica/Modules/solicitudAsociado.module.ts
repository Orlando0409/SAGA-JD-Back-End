import { Module } from "@nestjs/common";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ValidationsModule } from "src/Validations/Validations.module";
import { AsociadosModule } from "src/Modules/Afiliados/Modules/asociados.module";
import { SolicitudAsociadoFisicaController } from "../Controllers/solicitudAsociado.controller";
import { SolicitudAsociadoFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { SolicitudAsociadoFisicaService } from "../Services/solicitudAsociado.service";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAsociadoFisica, EstadoSolicitud]), ValidationsModule, AsociadosModule],
    controllers: [SolicitudAsociadoFisicaController],
    providers: [SolicitudAsociadoFisicaService],
})

export class SolicitudAsociadoFisicaModule {}