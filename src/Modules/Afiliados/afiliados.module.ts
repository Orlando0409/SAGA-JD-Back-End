import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AfiliadosService } from "./afiliados.service";
import { AfiliadosController } from "./afiliados.controller";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "./AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "./AfiliadoEntities/EstadoAfiliado.Entity";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from "../Solicitudes/SolicitudEntities/Solicitud.Entity";
import { TipoAfiliado } from "./AfiliadoEntities/TipoAfiliado.Entity";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { ValidationsModule } from "src/Validations/Validations.module";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { AuditoriaModule } from "../Auditoria/auditoria.module";
import { UsuariosModule } from "../Usuarios/Modules/usuarios.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado, TipoAfiliado, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, Usuario]), 
    ValidationsModule, 
    DropboxModule, 
    forwardRef(() => AuditoriaModule), 
    forwardRef(() => UsuariosModule)
  ],
  controllers: [AfiliadosController],
  providers: [AfiliadosService],
  exports: [AfiliadosService],
})

export class AfiliadosModule {}