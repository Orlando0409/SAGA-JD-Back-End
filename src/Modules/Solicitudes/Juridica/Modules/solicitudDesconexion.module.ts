import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDesconexionJuridicaController } from '../Controllers/solicitudDesconexion.controller';
import { SolicitudDesconexionJuridicaService } from '../Services/solicitudDesconexion.service';
import { SolicitudDesconexionJuridica } from '../../SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from '../../SolicitudEntities/EstadoSolicitud.Entity';
import { ValidationsModule } from 'src/Validations/Validations.module';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudDesconexionJuridica, EstadoSolicitud]),
    ValidationsModule,
    DropboxModule,
  ],
  controllers: [SolicitudDesconexionJuridicaController],
  providers: [SolicitudDesconexionJuridicaService],
  exports: [SolicitudDesconexionJuridicaService],
})

export class SolicitudDesconexionJuridicaModule {}