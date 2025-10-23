import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Lectura } from "./LecturaEntities/Lectura.Entity";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { AuditoriaModule } from "../Auditoria/auditoria.module";
import { LecturaService } from "./lectura.service";
import { LecturaController } from "./lectura.controller";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { EstadoMedidor } from "../Inventario/InventarioEntities/EstadoMedidor.Entity";
import { UsuariosModule } from "../Usuarios/Modules/usuarios.module";
import { InventarioModule } from "../Inventario/inventario.module";
import { AfiliadosModule } from "../Afiliados/afiliados.module";
import { EstadoAfiliado } from "../Afiliados/AfiliadoEntities/EstadoAfiliado.Entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Lectura, Usuario, Medidor, EstadoMedidor, Afiliado, EstadoAfiliado]), 
        forwardRef(() => UsuariosModule),
        forwardRef(() => AuditoriaModule),
        forwardRef(() => InventarioModule),
        forwardRef(() => AfiliadosModule)
    ],
    controllers: [LecturaController],
    providers: [LecturaService],
    exports: [LecturaService],
})
export class LecturaModule { }