import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagenesController } from './Imagenes.controller';
import { ImagenesService } from './Imagenes.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { ImagenEntity } from './ImagenesEntity/Imagen.Entity';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { AuditoriaModule } from '../Auditoria/auditoria.module';
import { UsuariosModule } from '../Usuarios/Modules/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([ImagenEntity, Usuario]), DropboxModule, AuditoriaModule, UsuariosModule],
  controllers: [ImagenesController],
  providers: [ImagenesService],
  exports: [ImagenesService],
})
export class ImagenesModule {}