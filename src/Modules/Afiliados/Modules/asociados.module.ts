import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsociadosService } from '../Services/asociados.service';
import { AsociadosController } from '../Controllers/asociados.controller';
import { Asociado, AsociadoFisico, AsociadoJuridico } from '../AfiliadoEntities/Asociado.Entity';
import { SolicitudAsociadoFisica, SolicitudAsociadoJuridica } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asociado, AsociadoFisico, AsociadoJuridico, EstadoAfiliado, SolicitudAsociadoFisica, SolicitudAsociadoJuridica])],
  controllers: [AsociadosController],
  providers: [AsociadosService],
  exports: [AsociadosService],
})
export class AsociadosModule {}
