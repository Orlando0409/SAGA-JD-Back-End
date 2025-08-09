import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,ManyToOne, JoinColumn, UpdateDateColumn  } from 'typeorm';
import { ProjectStatus } from './EstadoProyecto.Entity';

@Entity('projectEntity')   //Se utiliza en la base de datos para crear la tabla

export class ProjectEntity 
{
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
  Id_Usuario:number;

  @ManyToOne(() => ProjectStatus, estado => estado.proyectos)  //Relacion Muchos A uno

  @JoinColumn({ name: 'id_Estado_Proyecto' })  //LLave Foranea para acceder al estado del proyecto 
  estado: ProjectStatus; //Este campo puede ser un ID o un enum dependiendo de la implementación
}