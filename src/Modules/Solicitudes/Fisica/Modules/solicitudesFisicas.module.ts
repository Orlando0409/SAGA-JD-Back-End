import { SolicitudAfiliacionFisica, SolicitudAsociadoFisica, SolicitudCambioMedidorFisica, SolicitudDesconexionFisica } from "../../SolicitudEntities/Solicitud.Entity";import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudesFisicasService } from "../Services/solicitudesFisicas.service";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ValidationsModule } from "src/Validations/Validations.module";
import { AfiliadosModule } from "src/Modules/Afiliados/afiliados.module";
import { SolicitudesFisicasController } from "../Controllers/solicitudesFisicas.controller";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosModule } from "src/Modules/Usuarios/Modules/usuarios.module";
import { AuditoriaModule } from "src/Modules/Auditoria/auditoria.module";
import { EmailModule } from "src/Modules/Emails/email.module";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAfiliacionFisica, SolicitudAsociadoFisica, SolicitudCambioMedidorFisica, SolicitudDesconexionFisica, EstadoSolicitud, Usuario]), DropboxModule, EmailModule ,ValidationsModule, AfiliadosModule, UsuariosModule, AuditoriaModule],
    controllers: [SolicitudesFisicasController],
    providers: [SolicitudesFisicasService],
    exports: [SolicitudesFisicasService],
})
export class SolicitudesFisicasModule { }