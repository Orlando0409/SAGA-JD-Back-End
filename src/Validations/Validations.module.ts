import { Module } from '@nestjs/common';
import { ValidationsService } from './Validations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAfiliacion, SolicitudAsociado, SolicitudCambioMedidor, SolicitudDesconexion } from 'src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from 'src/Modules/Solicitudes/SolicitudEntities/EstadoSolicitud.Entity';

@Module({
    imports: [TypeOrmModule.forFeature([SolicitudAfiliacion, SolicitudDesconexion, SolicitudCambioMedidor, SolicitudAsociado, EstadoSolicitud])],
    providers: [ValidationsService],
    exports: [ValidationsService],
})
export class ValidationsModule {}