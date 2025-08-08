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

  @ManyToOne(() => EstadoProyecto, (estado) => estado.proyectos) //Relacion Muchos A uno
  @JoinColumn({ name: 'id_Estado_Proyecto' }) //LLave Foranea para acceder al estado del proyecto
  estado: EstadoProyecto;
}
