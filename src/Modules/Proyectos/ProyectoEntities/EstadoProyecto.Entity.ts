import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProjectEntity } from './Proyecto.Entity';

@Entity('ProyectoEstado')

export class ProyectoEstado
{
  @PrimaryGeneratedColumn()
  Id_Estado_Proyecto: number;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Estado: string;

  @OneToMany(() => ProjectEntity, proyecto => proyecto.Estado)
  Proyectos: ProjectEntity[];
}