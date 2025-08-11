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
import { Transform } from 'class-transformer';

@Entity('projectEntity')   //Se utiliza en la base de datos para crear la tabla

export class ProjectEntity 
<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
{  
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
=======
{
>>>>>>> origin/Andres-features:src/Modules/Proyectos/ProyectoEntities/Proyecto.Entity.ts
  @PrimaryGeneratedColumn()
  id_Proyecto: number;

  @Column()
  Titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @CreateDateColumn({ type: 'datetime' })
  @Transform(({ value }) => value.toISOString().split('T')[0])
  fecha_Creacion: Date;

  @UpdateDateColumn({ type: 'datetime' })
  @Transform(({ value }) => value.toISOString().split('T')[0])
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
<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
  estado: ProjectStatus;
  
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectEntity.ts
}
=======
  estado: ProjectStatus; //Este campo puede ser un ID o un enum dependiendo de la implementación

  @Column()
  imagenUrl: string;
}
>>>>>>> origin/Andres-features:src/Modules/Proyectos/ProyectoEntities/Proyecto.Entity.ts
