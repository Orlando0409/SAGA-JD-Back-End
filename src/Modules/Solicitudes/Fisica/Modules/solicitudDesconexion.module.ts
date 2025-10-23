import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { SolicitudDesconexionFisicaController } from "../Controllers/solicitudDesconexion.controller";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { ValidationsModule } from "src/Validations/Validations.module";
import { SolicitudesDesconexionFisicaService } from "../Services/solicitudDesconexion.service";
import { SolicitudDesconexionFisica } from "../../SolicitudEntities/Solicitud.Entity";
import { AfiliadoFisico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";
import { EmailModule } from "src/Modules/Emails/email.module";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudDesconexionFisica, EstadoSolicitud, AfiliadoFisico, EstadoAfiliado, Usuario]), DropboxModule, ValidationsModule, EmailModule],
    controllers: [SolicitudDesconexionFisicaController],
    providers: [SolicitudesDesconexionFisicaService],
    exports: [SolicitudesDesconexionFisicaService],
})

export class SolicitudDesconexionFisicaModule {}