import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudCambioMedidorJuridicaController } from '../Controllers/solicitudCambioMedidor.controller';
import { SolicitudCambioMedidorJuridicaService } from '../Services/solicitudCambioMedidor.service';
import { SolicitudCambioMedidorJuridica } from '../../SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from '../../SolicitudEntities/EstadoSolicitud.Entity';
import { ValidationsModule } from 'src/Validations/Validations.module';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudCambioMedidorJuridica, EstadoSolicitud]),
    ValidationsModule,
    DropboxModule,
  ],
  controllers: [SolicitudCambioMedidorJuridicaController],
  providers: [SolicitudCambioMedidorJuridicaService],
  exports: [SolicitudCambioMedidorJuridicaService],
})
export class SolicitudCambioMedidorJuridicaModule {}
