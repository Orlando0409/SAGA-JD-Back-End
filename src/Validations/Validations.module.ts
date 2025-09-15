import { Module } from '@nestjs/common';
import { ValidationsService } from './Validations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, SolicitudAsociadoFisica, SolicitudAsociadoJuridica, SolicitudCambioMedidorFisica, SolicitudCambioMedidorJuridica, SolicitudDesconexionFisica, SolicitudDesconexionJuridica } from 'src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from 'src/Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';
import { AfiliadoFisico, AfiliadoJuridico } from 'src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity';

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAfiliacionFisica, SolicitudDesconexionFisica, SolicitudCambioMedidorFisica, SolicitudAsociadoFisica, SolicitudAfiliacionJuridica, SolicitudDesconexionJuridica, SolicitudCambioMedidorJuridica, SolicitudAsociadoJuridica, EstadoSolicitud, AfiliadoFisico, AfiliadoJuridico])],
    providers: [ValidationsService],
    exports: [ValidationsService],
})

export class ValidationsModule {}