import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto } from './ProyectoEntities/Proyecto.Entity';
import { ProyectoEstado } from './ProyectoEntities/EstadoProyecto.Entity';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';

@Module({
  imports: [ TypeOrmModule.forFeature([Proyecto, ProyectoEstado]), DropboxModule], // Importamos las entidades que vamos a usar en este modulo
  controllers: [ProyectoController],  //Su controlador 
  providers: [ProyectoService],
  exports: [ProyectoService],
})

export class ProyectoModule {}