import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './Entidades_proyecto/projectEntity';
import { ProjectStatus } from './Entidades_proyecto/projectStatus';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';

@Module({
  imports: [ TypeOrmModule.forFeature([ProjectEntity, ProjectStatus])], // Importamos las entidades que vamos a usar en este modulo
  controllers: [ProyectoController],  //Su controlador 
  providers: [ProyectoService],
})
export class ProyectoModule {}
