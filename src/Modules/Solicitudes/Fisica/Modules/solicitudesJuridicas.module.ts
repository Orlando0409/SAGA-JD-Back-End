import { Solicitud, SolicitudAfiliacionJuridica, SolicitudAsociadoJuridica, SolicitudCambioMedidorJuridica, SolicitudDesconexionJuridica, SolicitudJuridica } from "../../SolicitudEntities/Solicitud.Entity";import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";
import { AuditoriaModule } from "src/Modules/Auditoria/auditoria.module";
import { UsuariosModule } from "src/Modules/Usuarios/Modules/usuarios.module";
import { AfiliadosModule } from "src/Modules/Afiliados/afiliados.module";
import { ValidationsModule } from "src/Validations/Validations.module";
import { EmailModule } from "src/Modules/Emails/email.module";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { SolicitudesJuridicasService } from "../Services/solicitudesJuridicas.service";
import { SolicitudesJuridicasController } from "../Controllers/solicitudesJuridicas.controller";
import { AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";

@Module({
    imports: [TypeOrmModule.forFeature([Solicitud, SolicitudJuridica, SolicitudAfiliacionJuridica, SolicitudDesconexionJuridica, SolicitudCambioMedidorJuridica, SolicitudAsociadoJuridica, EstadoSolicitud, AfiliadoJuridico, EstadoAfiliado, Usuario]), DropboxModule, EmailModule, ValidationsModule, AfiliadosModule, UsuariosModule, AuditoriaModule],
    controllers: [SolicitudesJuridicasController],
    providers: [SolicitudesJuridicasService],
    exports: [SolicitudesJuridicasService],
})
export class SolicitudesJuridicasModule { }