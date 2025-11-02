import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SugerenciaController } from './sugerencia.controller';
import { SugerenciaService } from './sugerencia.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { EmailModule } from '../Emails/email.module';
import { Sugerencia } from './SugerenciaEntities/Sugerencia.Entity';
import { EstadoSugerencia } from './SugerenciaEntities/EstadoSugerencia';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sugerencia, EstadoSugerencia, Usuario]), 
    DropboxModule,
    EmailModule,
    AuditoriaModule,
    UsuariosModule
  ],
  controllers: [SugerenciaController],
  providers: [SugerenciaService],
  exports: [SugerenciaService],
})
export class SugerenciaModule {}