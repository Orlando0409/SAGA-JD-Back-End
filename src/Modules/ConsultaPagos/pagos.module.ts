import { Module } from "@nestjs/common";
import { Lectura } from "../Lecturas/LecturaEntities/Lectura.Entity";
import { TipoTarifaLectura } from "../Lecturas/LecturaEntities/TipoTarifaLectura.Entity";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagosController } from "./pagos.controller";
import { PagosService } from "./pagos.service";

@Module({
    imports: [TypeOrmModule.forFeature([Lectura, TipoTarifaLectura, Afiliado, AfiliadoFisico, AfiliadoJuridico, Medidor])],
    controllers: [PagosController],
    providers: [PagosService],
    exports: [PagosService]
})

export class PagosModule {}