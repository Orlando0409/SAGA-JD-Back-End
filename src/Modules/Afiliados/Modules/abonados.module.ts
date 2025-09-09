import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbonadosService } from '../Services/abonados.service';
import { AbonadosController } from '../Controllers/abonados.controller';
import { Abonado } from '../AfiliadoEntities/Abonado.Entity';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';
import { SolicitudAfiliacionFisica } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Abonado, EstadoAfiliado, SolicitudAfiliacionFisica])],
  controllers: [AbonadosController],
  providers: [AbonadosService],
  exports: [AbonadosService],
})
export class AbonadosModule {}
