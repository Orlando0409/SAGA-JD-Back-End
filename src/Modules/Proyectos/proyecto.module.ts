import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto } from './ProyectoEntities/Project.Entity';
import { ProyectoEstado } from './ProyectoEntities/ProjectStatus.Entity';

@Module({
  imports: [ TypeOrmModule.forFeature([Proyecto, ProyectoEstado])], // Importamos las entidades que vamos a usar en este modulo
  controllers: [ProyectoController],  //Su controlador 
  providers: [ProyectoService],
})
export class ProyectoModule {}
