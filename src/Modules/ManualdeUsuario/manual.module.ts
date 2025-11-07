import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualController } from './manual.controller';
import { ManualService } from './manual.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { ManualEntity } from './ManualEntities/Manual.Entity';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([ManualEntity, Usuario]), DropboxModule, AuditoriaModule, UsuariosModule],
  controllers: [ManualController],
  providers: [ManualService],
  exports: [ManualService],
})
export class ManualModule {}