import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AfiliadosService } from "./afiliados.service";
import { AfiliadosController } from "./afiliados.controller";
import { AfiliadoFisico, AfiliadoJuridico } from "./AfiliadoEntities/Afiliado.Entity";
import { EstadoAfiliado } from "./AfiliadoEntities/EstadoAfiliado.Entity";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { TipoAfiliado } from "./AfiliadoEntities/TipoAfiliado.Entity";

@Module({
  imports: [TypeOrmModule.forFeature([AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado, TipoAfiliado, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica])],
  controllers: [AfiliadosController],
  providers: [AfiliadosService],
  exports: [AfiliadosService],
})

export class AfiliadosModule {}