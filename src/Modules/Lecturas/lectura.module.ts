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
import { RangoAfiliados } from "./LecturaEntities/RangoAfiliados.Entity";
import { RangoConsumo } from "./LecturaEntities/RangoConsumo.Entity";
import { AplicarSelloCalidad } from './LecturaEntities/AplicarSelloCalidad.Entity';
import { CargoFijoTarifasConSello } from '../Tarifas/Con Sello Calidad/TarifaConSelloEntities/CargoFijoTarifasConSello.Entity';
import { TarifaLecturaConSello } from '../Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaLecturaConSello.Entity';
import { TipoTarifaServiciosFijosConSello } from '../Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaServiciosFijos.Entity';
import { TipoTarifaVentaAguaConSello } from '../Tarifas/Con Sello Calidad/TarifaConSelloEntities/TarifaVentaAgua.Entity';
import { TipoTarifaCargoFijoConSello } from '../Tarifas/Con Sello Calidad/TarifaConSelloEntities/TipoTarifaCargoFijoConSello.Entity';
import { FacturaModule } from '../Facturas/factura.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lectura, TarifaLecturaConSello, CargoFijoTarifasConSello, TipoTarifaServiciosFijosConSello, TipoTarifaVentaAguaConSello, TipoTarifaCargoFijoConSello, RangoAfiliados, RangoConsumo, Usuario, Medidor, EstadoMedidor, Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado, AplicarSelloCalidad]), 
        forwardRef(() => UsuariosModule),
        forwardRef(() => AuditoriaModule),
        forwardRef(() => InventarioModule),
        forwardRef(() => AfiliadosModule),
        forwardRef(() => FacturaModule)
    ],
    controllers: [LecturaController],
    providers: [LecturaService, totalLecturasService],
    exports: [LecturaService, totalLecturasService],
})
export class LecturaModule { }