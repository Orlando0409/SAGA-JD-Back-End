import { AfiliadoJuridico } from 'src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity';
import { AfiliadoFisico } from './../Afiliados/AfiliadoEntities/Afiliado.Entity';
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
import { totalLecturasService } from "./totalLecturas.service";
import { TipoTarifaLectura } from "./LecturaEntities/TipoTarifaLectura.Entity";
import { TipoTarifaVentaAgua } from "./LecturaEntities/TipoTarifaVentaAgua.Entity";
import { TipoTarifaServiciosFijos } from "./LecturaEntities/TipoTarifaServiciosFijos.Entity";
import { RangoAfiliados } from "./LecturaEntities/RangoAfiliados.Entity";
import { RangoConsumo } from "./LecturaEntities/RangoConsumo.Entity";
import { CargoFijoTarifas } from "./LecturaEntities/CargoFijoTarifas.Entity";
import { TipoTarifaCargoFijo } from "./LecturaEntities/TipoTarifaCargoFijo.Entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Lectura, TipoTarifaLectura, TipoTarifaCargoFijo, TipoTarifaServiciosFijos, TipoTarifaVentaAgua, CargoFijoTarifas, RangoAfiliados, RangoConsumo, Usuario, Medidor, EstadoMedidor, Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado]), 
        forwardRef(() => UsuariosModule),
        forwardRef(() => AuditoriaModule),
        forwardRef(() => InventarioModule),
        forwardRef(() => AfiliadosModule)
    ],
    controllers: [LecturaController],
    providers: [LecturaService, totalLecturasService],
    exports: [LecturaService, totalLecturasService],
})
export class LecturaModule { }