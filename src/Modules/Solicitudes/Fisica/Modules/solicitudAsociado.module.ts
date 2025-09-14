import { Module } from "@nestjs/common";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ValidationsModule } from "src/Validations/Validations.module";
import { SolicitudAsociadoFisicaController } from "../Controllers/solicitudAsociado.controller";
import { SolicitudAsociadoFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { SolicitudAsociadoFisicaService } from "../Services/solicitudAsociado.service";
import { AfiliadosModule } from "src/Modules/Afiliados/afiliados.module";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAsociadoFisica, EstadoSolicitud]), ValidationsModule, AfiliadosModule],
    controllers: [SolicitudAsociadoFisicaController],
    providers: [SolicitudAsociadoFisicaService],
    exports: [SolicitudAsociadoFisicaService],
})

export class SolicitudAsociadoFisicaModule {}