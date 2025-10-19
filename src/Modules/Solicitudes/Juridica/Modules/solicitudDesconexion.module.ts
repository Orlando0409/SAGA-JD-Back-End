import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudDesconexionJuridicaController } from '../Controllers/solicitudDesconexion.controller';
import { SolicitudDesconexionJuridicaService } from '../Services/solicitudDesconexion.service';
import { SolicitudDesconexionJuridica } from '../../SolicitudEntities/Solicitud.Entity';
import { EstadoSolicitud } from '../../SolicitudEntities/EstadoSolicitud.Entity';
import { ValidationsModule } from 'src/Validations/Validations.module';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EstadoAfiliado } from 'src/Modules/Afiliados/AfiliadoEntities/EstadoAfiliado.Entity';
import { AfiliadoJuridico } from 'src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity';
import { EmailModule } from 'src/Modules/Emails/email.module';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudDesconexionJuridica, EstadoSolicitud, AfiliadoJuridico, EstadoAfiliado, Usuario]), ValidationsModule, DropboxModule, EmailModule],
  controllers: [SolicitudDesconexionJuridicaController],
  providers: [SolicitudDesconexionJuridicaService],
  exports: [SolicitudDesconexionJuridicaService],
})

export class SolicitudDesconexionJuridicaModule {}