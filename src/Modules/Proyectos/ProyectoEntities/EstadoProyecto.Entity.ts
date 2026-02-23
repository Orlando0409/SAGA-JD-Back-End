import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Proyecto } from './Proyecto.Entity';

@Entity('estado_proyecto')
export class EstadoProyecto
{
  @PrimaryGeneratedColumn()
  Id_Estado_Proyecto: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  Nombre_Estado: string;

  @OneToMany(() => Proyecto, proyecto => proyecto.Estado)
  Proyectos: Proyecto[];
}