import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto_Base } from './Entidades_proyecto/entidadBase_proyecto';
import { EstadoProyecto } from './Entidades_proyecto/estado_proyecto';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto_Base, EstadoProyecto])], // Importamos las entidades que vamos a usar en este modulo
  controllers: [ProyectoController], //Su controlador
  providers: [ProyectoService],
})
export class ProyectoModule {}
