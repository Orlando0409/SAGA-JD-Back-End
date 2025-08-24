import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,ManyToOne, JoinColumn, UpdateDateColumn  } from 'typeorm';
import { ProyectoEstado } from './ProjectStatus.Entity';

@Entity('Proyecto')   //Se utiliza en la base de datos para crear la tabla

export class Proyecto
{
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
  Id_Usuario:number;

  @ManyToOne(() => ProyectoEstado, Estado => Estado.Proyectos)  //Relacion Muchos A uno
  @JoinColumn({ name: 'Id_Estado_Proyecto' })  //LLave Foranea para acceder al estado del proyecto 
  Estado: ProyectoEstado; //Este campo puede ser un ID o un enum dependiendo de la implementación

  @Column()
  ImagenUrl: string;
}