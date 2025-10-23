import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ValidationsModule } from "src/Validations/Validations.module";
import { SolicitudAfiliacionFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { SolicitudAfiliacionFisicaService } from "../Services/solicitudAfiliacion.service";
import { SolicitudAfiliacionFisicaController } from "../Controllers/solicitudAfiliacion.controller";
import { AfiliadosModule } from "src/Modules/Afiliados/afiliados.module";
import { EmailModule } from "src/Modules/Emails/email.module";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAfiliacionFisica, EstadoSolicitud, Usuario]), DropboxModule, ValidationsModule, AfiliadosModule, EmailModule],
    controllers: [SolicitudAfiliacionFisicaController],
    providers: [SolicitudAfiliacionFisicaService],
    exports: [SolicitudAfiliacionFisicaService],
})

export class SolicitudAfiliacionFisicaModule {}