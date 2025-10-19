import { Module } from "@nestjs/common";
import { AuditoriaService } from "./auditoria.service";
import { AuditoriaController } from "./auditoria.controller";
import { Auditoria } from "./AuditoriaEntities/Auditoria.Entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";

@Module({
    imports: [TypeOrmModule.forFeature([Auditoria, Usuario])],
    controllers: [AuditoriaController],
    providers: [AuditoriaService],
    exports: [AuditoriaService],
})
export class AuditoriaModule {}