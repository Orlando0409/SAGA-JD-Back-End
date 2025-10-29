import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualEntity } from './ManualEntity/manual.entity';
import { ManualController } from './manual.controller';
import { ManualService } from './manual.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManualEntity, Usuario]), DropboxModule, AuditoriaModule],
  controllers: [ManualController],
  providers: [ManualService],
  exports: [ManualService],
})
export class ManualModule {}