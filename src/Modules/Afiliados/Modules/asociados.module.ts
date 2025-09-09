import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsociadosService } from '../Services/asociados.service';
import { AsociadosController } from '../Controllers/asociados.controller';
import { Asociado } from '../AfiliadoEntities/Asociado.Entity';
import { SolicitudAsociado } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asociado, SolicitudAsociado, EstadoAfiliado])],
  controllers: [AsociadosController],
  providers: [AsociadosService],
  exports: [AsociadosService],
})
export class AsociadosModule {}
