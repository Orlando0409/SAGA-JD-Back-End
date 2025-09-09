import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAsociadoJuridicaController } from '../Controllers/solicitudAsociado.controller';
import { SolicitudAsociadoJuridicaService } from '../Services/solicitudAsociado.service';
import { SolicitudAsociadoJuridica } from '../../SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from '../../SolicitudEntities/EstadoSolicitud.Entity';
import { ValidationsModule } from 'src/Validations/Validations.module';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { AsociadosModule } from 'src/Modules/Afiliados/Modules/asociados.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudAsociadoJuridica, EstadoSolicitud]),
    ValidationsModule,
    DropboxModule,
    AsociadosModule
  ],
  controllers: [SolicitudAsociadoJuridicaController],
  providers: [SolicitudAsociadoJuridicaService],
  exports: [SolicitudAsociadoJuridicaService],
})

export class SolicitudAsociadoJuridicaModule {}