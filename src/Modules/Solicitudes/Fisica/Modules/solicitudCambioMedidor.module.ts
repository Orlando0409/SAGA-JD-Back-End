import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidorFisicaController } from "../Controllers/solicitudCambioMedidor.controller";
import { ValidationsModule } from "src/Validations/Validations.module";
import { SolicitudesCambioMedidorFisicaService } from "../Services/solicitudCambioMedidor.service";
import { SolicitudCambioMedidorFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { EmailModule } from "src/Modules/Emails/email.module";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudCambioMedidorFisica, EstadoSolicitud, Usuario]), ValidationsModule, EmailModule],
    controllers: [SolicitudCambioMedidorFisicaController],
    providers: [SolicitudesCambioMedidorFisicaService],
    exports: [SolicitudesCambioMedidorFisicaService],
})

export class SolicitudCambioMedidorFisicaModule {}