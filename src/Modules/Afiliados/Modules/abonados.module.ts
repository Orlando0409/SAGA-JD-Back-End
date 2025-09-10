import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbonadosService } from '../Services/abonados.service';
import { AbonadosController } from '../Controllers/abonados.controller';
import { Abonado, AbonadoFisico, AbonadoJuridico } from '../AfiliadoEntities/Abonado.Entity';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from 'src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Abonado, AbonadoFisico, AbonadoJuridico, EstadoAfiliado, SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica])],
  controllers: [AbonadosController],
  providers: [AbonadosService],
  exports: [AbonadosService],
})
export class AbonadosModule {}
