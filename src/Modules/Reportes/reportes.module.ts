import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';

import { Reporte } from './ReporteEntities/Reportes.Entity';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';
import { EstadoReporte } from './ReporteEntities/EstadoReporte.Entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte, EstadoReporte, Usuario]), 
    DropboxModule,
    EmailModule,
    AuditoriaModule,
    UsuariosModule
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
