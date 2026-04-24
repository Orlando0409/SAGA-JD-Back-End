import { ConsultaPago } from './ConsultaPagoEntities/ConsultaPago.entity';
import { Module, forwardRef } from "@nestjs/common";
import { Medidor } from "../Inventario/InventarioEntities/Medidor.Entity";
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from "../Afiliados/AfiliadoEntities/Afiliado.Entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagosController } from "./consultaPagos.controller";
import { PagosService } from "./consultaPagos.service";
import { ValidationsModule } from 'src/Validations/Validations.module';
import { ConsultaPagosPdfService } from './consultaPagosPdf.service';
import { Factura } from '../Facturas/FacturaEntities/Factura.Entity';
import { AfiliadosModule } from '../Afiliados/afiliados.module';
import { LecturaModule } from '../Lecturas/lectura.module';
import { FacturaModule } from '../Facturas/factura.module';

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
        ValidationsModule,
        AfiliadosModule,
        forwardRef(() => LecturaModule),
        forwardRef(() => FacturaModule)
    ],
    controllers: [PagosController],
    providers: [PagosService, ConsultaPagosPdfService],
    exports: [PagosService]
})

export class PagosModule {}