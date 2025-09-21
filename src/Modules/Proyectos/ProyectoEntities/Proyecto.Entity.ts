import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,ManyToOne, JoinColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate  } from 'typeorm';
import { ProyectoEstado } from './EstadoProyecto.Entity';

@Entity('Proyecto')   //Se utiliza en la base de datos para crear la tabla
export class Proyecto
{
  @PrimaryGeneratedColumn()
  Id_Proyecto: number;

  @Column({ nullable: false })
  Titulo: string;

  @Column({ type: 'text' })
  Descripcion: string;

  @CreateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Creacion: Date;

  @UpdateDateColumn({type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', precision: 0 })
  Fecha_Actualizacion: Date;

  @BeforeUpdate()
  updateTimestamp() { this.Fecha_Actualizacion = new Date(); }

  @Column({ nullable: false })
  Id_Usuario: number;   // CAMBIAR A USUARIO RELACION

  @ManyToOne(() => ProyectoEstado, Estado => Estado.Proyectos)  //Relacion Muchos A uno
  @JoinColumn({ name: 'Id_Estado_Proyecto' })  //LLave Foranea para acceder al estado del proyecto 
  Estado: ProyectoEstado; //Este campo puede ser un ID o un enum dependiendo de la implementación

  @BeforeInsert()
  setDefaultEstado() { this.Estado = { Id_Estado_Proyecto: 1, Nombre_Estado: 'En planeamiento' } as ProyectoEstado; }

  @Column()
  Imagen_Url: string;
}