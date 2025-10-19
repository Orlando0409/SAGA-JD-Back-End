import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAfiliacionJuridicaController } from '../Controllers/solicitudAfiliacion.controller';
import { SolicitudAfiliacionJuridicaService } from '../Services/solicitudAfiliacion.service';
import { SolicitudAfiliacionJuridica } from '../../SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from '../../SolicitudEntities/EstadoSolicitud.Entity';
import { ValidationsModule } from 'src/Validations/Validations.module';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { AfiliadosModule } from 'src/Modules/Afiliados/afiliados.module';
import { EmailModule } from 'src/Modules/Emails/email.module';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudAfiliacionJuridica, EstadoSolicitud, Usuario]), ValidationsModule, DropboxModule, AfiliadosModule, EmailModule],
  controllers: [SolicitudAfiliacionJuridicaController],
  providers: [SolicitudAfiliacionJuridicaService],
  exports: [SolicitudAfiliacionJuridicaService],
})
export class SolicitudAfiliacionJuridicaModule {}
