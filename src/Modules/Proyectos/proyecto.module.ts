import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './ProyectoEntities/Proyecto.Entity';
import { ProyectoEstado } from './ProyectoEntities/EstadoProyecto.Entity';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';

@Module({
  imports: [ TypeOrmModule.forFeature([ProjectEntity, ProyectoEstado])], // Importamos las entidades que vamos a usar en este modulo
  controllers: [ProyectoController],  //Su controlador 
  providers: [ProyectoService],
})

export class ProyectoModule {}