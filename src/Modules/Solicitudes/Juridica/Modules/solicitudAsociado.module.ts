import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAsociadoJuridicaController } from '../Controllers/solicitudAsociado.controller';
import { SolicitudAsociadoJuridicaService } from '../Services/solicitudAsociado.service';
import { SolicitudAsociadoJuridica } from '../../SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from '../../SolicitudEntities/EstadoSolicitud.Entity';
import { ValidationsModule } from 'src/Validations/Validations.module';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { AfiliadosModule } from 'src/Modules/Afiliados/afiliados.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudAsociadoJuridica, EstadoSolicitud]),
    ValidationsModule,
    DropboxModule,
    AfiliadosModule
  ],
  controllers: [SolicitudAsociadoJuridicaController],
  providers: [SolicitudAsociadoJuridicaService],
  exports: [SolicitudAsociadoJuridicaService],
})

export class SolicitudAsociadoJuridicaModule {}