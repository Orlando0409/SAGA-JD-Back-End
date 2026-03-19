import { Consulta_Pago } from './PagoEntities/ConsultaPago.entity';
import { Module } from "@nestjs/common";
import { Lectura } from "../Lecturas/LecturaEntities/Lectura.Entity";
import { TipoTarifaLectura } from "../Lecturas/LecturaEntities/TipoTarifaLectura.Entity";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagosController } from "./pagos.controller";
import { PagosService } from "./pagos.service";
import { LecturaModule } from "../Lecturas/lectura.module";
import { totalLecturasService } from "../Lecturas/totalLecturas.service";
import { TipoTarifaServiciosFijos } from '../Lecturas/LecturaEntities/TipoTarifaServiciosFijos.Entity';
import { TipoTarifaVentaAgua } from '../Lecturas/LecturaEntities/TipoTarifaVentaAgua.Entity';
import { CargoFijoTarifas } from '../Lecturas/LecturaEntities/CargoFijoTarifas.Entity';
import { TipoTarifaCargoFijo } from '../Lecturas/LecturaEntities/TipoTarifaCargoFijo.Entity';
import { RangoAfiliados } from '../Lecturas/LecturaEntities/RangoAfiliados.Entity';
import { RangoConsumo } from '../Lecturas/LecturaEntities/RangoConsumo.Entity';
import { EstadoAfiliado } from '../Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';

@Module({
    imports: [TypeOrmModule.forFeature([Consulta_Pago, Lectura, TipoTarifaLectura, TipoTarifaServiciosFijos, TipoTarifaVentaAgua, TipoTarifaCargoFijo, CargoFijoTarifas, RangoAfiliados, RangoConsumo, Afiliado, EstadoAfiliado, AfiliadoFisico, AfiliadoJuridico, Medidor]), LecturaModule],
    controllers: [PagosController],
    providers: [PagosService, totalLecturasService],
    exports: [PagosService]
})

export class PagosModule {}