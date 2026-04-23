import { ConsultaPago } from './ConsultaPagoEntities/ConsultaPago.entity';
import { Module } from "@nestjs/common";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagosController } from "./consultaPagos.controller";
import { PagosService } from "./consultaPagos.service";
import { ValidationsModule } from 'src/Validations/Validations.module';
import { ConsultaPagosPdfService } from './consultaPagosPdf.service';
import { Factura } from '../Facturas/FacturaEntities/Factura.Entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ConsultaPago, 
            Factura,
            Afiliado, 
            AfiliadoFisico, 
            AfiliadoJuridico, 
            Medidor
        ]), 
        ValidationsModule
    ],
    controllers: [PagosController],
    providers: [PagosService, ConsultaPagosPdfService],
    exports: [PagosService]
})

export class PagosModule {}