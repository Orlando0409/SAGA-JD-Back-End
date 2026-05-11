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
import { TarifaLecturaSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaLecturaSinSello.Entity';
import { FacturaModule } from '../Facturas/factura.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lectura, TarifaLecturaSinSello, Usuario, Medidor, EstadoMedidor, Afiliado, AfiliadoFisico, AfiliadoJuridico, EstadoAfiliado]),
        forwardRef(() => UsuariosModule),
        forwardRef(() => AuditoriaModule),
        forwardRef(() => InventarioModule),
        forwardRef(() => AfiliadosModule),
        forwardRef(() => FacturaModule)
    ],
    controllers: [LecturaController],
    providers: [LecturaService],
    exports: [LecturaService],
})
export class LecturaModule { }