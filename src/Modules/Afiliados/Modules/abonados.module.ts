import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbonadosService } from '../Services/abonados.service';
import { AbonadosController } from '../Controllers/abonados.controller';
import { Abonado } from '../AfiliadoEntities/Abonado.Entity';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';
import { SolicitudAfiliacion } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Abonado, EstadoAfiliado, SolicitudAfiliacion])],
  controllers: [AbonadosController],
  providers: [AbonadosService],
  exports: [AbonadosService],
})
export class AbonadosModule {}
