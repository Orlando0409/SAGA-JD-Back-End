import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Proyecto_Base } from './entidadBase_proyecto'; 


@Entity('estado_proyecto')

export class EstadoProyecto 
{
  @PrimaryGeneratedColumn()
  id_Estado_Proyecto: number;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Estado: string;

  @OneToMany(() => Proyecto_Base, proyecto => proyecto.estado)
  proyectos: Proyecto_Base[];
}