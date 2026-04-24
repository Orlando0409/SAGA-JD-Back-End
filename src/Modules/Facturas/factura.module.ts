import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { EstadoFactura } from './FacturaEntities/EstadoFactura.Entity';
import { Factura } from './FacturaEntities/Factura.Entity';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { Lectura } from '../Lecturas/LecturaEntities/Lectura.Entity';
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from '../Afiliados/AfiliadoEntities/Afiliado.Entity';
import { TarifaLecturaSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaLecturaSinSello.Entity';
import { RangoAfiliadosSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoAfiliadosSinSello.Entity';
import { RangoConsumoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoConsumoSinSello.Entity';
import { CargoFijoTarifasSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/CargoFijoTarifasSinSello.Entity';
import { PrecioBloqueConsumoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioBloqueConsumoSinSello.Entity';
import { RecursoHidricoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RecursoHidricoSinSello.Entity';
import { BloqueRecursoHidricoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/BloqueRecursoHidricoSinSello.Entity';
import { PrecioRecursoHidricoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioRecursoHidricoSinSello.Entity';
import { TarifaHidranteSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaHidranteSinSello.Entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Factura,
      EstadoFactura,
      Usuario,
      Lectura,
      Afiliado,
      AfiliadoFisico,
      AfiliadoJuridico,
      TarifaLecturaSinSello,
      RangoAfiliadosSinSello,
      RangoConsumoSinSello,
      CargoFijoTarifasSinSello,
      PrecioBloqueConsumoSinSello,
      RecursoHidricoSinSello,
      BloqueRecursoHidricoSinSello,
      PrecioRecursoHidricoSinSello,
      TarifaHidranteSinSello,
    ]),
    AuditoriaModule,
    UsuariosModule
  ],
  providers: [FacturaService],
  controllers: [FacturaController],
  exports: [FacturaService],
})
export class FacturaModule {}
