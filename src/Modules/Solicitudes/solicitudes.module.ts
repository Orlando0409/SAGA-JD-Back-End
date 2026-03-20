import { EmailModule } from 'src/Modules/Emails/email.module';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Solicitud, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, SolicitudAgregarMedidorFisica, SolicitudAgregarMedidorJuridica, SolicitudAsociadoFisica, SolicitudAsociadoJuridica, SolicitudCambioMedidorFisica, SolicitudCambioMedidorJuridica, SolicitudDesconexionFisica, SolicitudDesconexionJuridica, SolicitudFisica, SolicitudJuridica } from "./SolicitudEntities/Solicitud.Entity";
import { Medidor } from '../Inventario/InventarioEntities/Medidor.Entity';
import { EstadoMedidor } from '../Inventario/InventarioEntities/EstadoMedidor.Entity';
import { SolicitudesFisicasService } from "./Services/solicitudesFisicas.service";
import { SolicitudesJuridicasService } from "./Services/solicitudesJuridicas.service";
import { EstadoSolicitud } from "./SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudesJuridicasController } from "./Controllers/solicitudesJuridicas.controller";
import { SolicitudesFisicasController } from "./Controllers/solicitudesFisicas.controller";
import { AuditoriaModule } from "../Auditoria/auditoria.module";
import { UsuariosModule } from "../Usuarios/Modules/usuarios.module";
import { ValidationsModule } from 'src/Validations/Validations.module';
import { AfiliadosModule } from '../Afiliados/afiliados.module';
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from '../Afiliados/AfiliadoEntities/Afiliado.Entity';
import { EstadoAfiliado } from '../Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';

@Module({
    imports: [TypeOrmModule.forFeature([Usuario, Afiliado, EstadoAfiliado, 
        AfiliadoFisico, AfiliadoJuridico, Solicitud, EstadoSolicitud, 
        SolicitudFisica, SolicitudJuridica, SolicitudAfiliacionFisica, 
        SolicitudDesconexionFisica, SolicitudCambioMedidorFisica, 
        SolicitudAsociadoFisica, SolicitudAgregarMedidorFisica, 
        SolicitudAfiliacionJuridica, SolicitudDesconexionJuridica, 
        SolicitudCambioMedidorJuridica, SolicitudAsociadoJuridica, 
        SolicitudAgregarMedidorJuridica, Medidor, EstadoMedidor]),
         DropboxModule, AuditoriaModule, UsuariosModule, AfiliadosModule, 
         EmailModule, ValidationsModule],
    controllers: [SolicitudesFisicasController, SolicitudesJuridicasController],
    providers: [SolicitudesFisicasService, SolicitudesJuridicasService],
    exports: [SolicitudesFisicasService, SolicitudesJuridicasService],
})

export class SolicitudesModule { }