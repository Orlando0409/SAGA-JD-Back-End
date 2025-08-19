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
import { ProjectStatus } from './EstadoProyecto.Entity';

@Entity('ProjectEntity')   //Se utiliza en la base de datos para crear la tabla

export class ProjectEntity 
<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
{  
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
=======
{
>>>>>>> origin/Andres-features:src/Modules/Proyectos/ProyectoEntities/Proyecto.Entity.ts
  @PrimaryGeneratedColumn()
  Id_Proyecto: number;

  @Column()
  Titulo: string;

  @Column({ type: 'text' })
  Descripcion: string;

  @CreateDateColumn({ type: 'datetime' })
  Fecha_Creacion: Date;

  @UpdateDateColumn({ type: 'datetime' })
  Fecha_Actualizacion: Date;

  @Column()
  Id_Usuario: number;

  @ManyToOne(() => ProjectStatus, Estado => Estado.Proyectos)  //Relacion Muchos A uno
  @JoinColumn({ name: 'Id_Estado_Proyecto' })  //LLave Foranea para acceder al estado del proyecto 
  Estado: ProjectStatus; //Este campo puede ser un ID o un enum dependiendo de la implementación

  @Column()
  ImagenUrl: string;
}
>>>>>>> origin/Andres-features:src/Modules/Proyectos/ProyectoEntities/Proyecto.Entity.ts
