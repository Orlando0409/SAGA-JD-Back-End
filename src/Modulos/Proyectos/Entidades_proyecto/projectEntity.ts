<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/entidadBase_proyecto.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoProyecto } from './estado_proyecto';

@Entity('entidad_base_proyecto')
export class Proyecto_Base {
=======
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,ManyToOne, JoinColumn, UpdateDateColumn  } from 'typeorm';
import { ProjectStatus } from './projectStatus';


@Entity('projectEntity')   //Se utiliza en la base de datos para crear la tabla

export class ProjectEntity 
{  
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
  @PrimaryGeneratedColumn()
  id_Proyecto: number;

  @Column()
  Titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_Creacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_Actualizacion: Date;

  @Column()
  Id_Usuario: number;

<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/entidadBase_proyecto.ts
  @ManyToOne(() => EstadoProyecto, (estado) => estado.proyectos) //Relacion Muchos A uno
  @JoinColumn({ name: 'id_Estado_Proyecto' }) //LLave Foranea para acceder al estado del proyecto
  estado: EstadoProyecto;
=======
  @ManyToOne(() => ProjectStatus, estado => estado.proyectos)  //Relacion Muchos A uno

  @JoinColumn({ name: 'id_Estado_Proyecto' })  //LLave Foranea para acceder al estado del proyecto 
  estado: ProjectStatus;
  
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
}
