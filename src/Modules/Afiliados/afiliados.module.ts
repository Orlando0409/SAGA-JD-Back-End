import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AfiliadosService } from "./afiliados.service";
import { AfiliadosController } from "./afiliados.controller";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "./AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "./AfiliadoEntities/EstadoAfiliado.Entity";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from "../Solicitudes/SolicitudEntities/Solicitud.Entity";
import { TipoAfiliado } from "./AfiliadoEntities/TipoAfiliado.Entity";
import { ValidationsModule } from "src/Validations/Validations.module";
import { DropboxModule } from "src/Dropbox/Files/DropboxFiles.module";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { UsuariosModule } from "../Usuarios/Modules/usuarios.module";
import { AuditoriaModule } from "../Auditoria/auditoria.module";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { EstadoMedidor } from "../Inventario/InventarioEntities/EstadoMedidor.Entity";

@Module({
  imports: [TypeOrmModule.forFeature([Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado, TipoAfiliado, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, Usuario, Medidor, EstadoMedidor]), ValidationsModule, DropboxModule, UsuariosModule, AuditoriaModule],
  controllers: [AfiliadosController],
  providers: [AfiliadosService],
  exports: [AfiliadosService],
})

export class AfiliadosModule { }