import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProjectEntity } from './Project.Entity';

@Entity('ProjectStatus')

export class ProjectStatus
{
  @PrimaryGeneratedColumn()
  Id_Estado_Proyecto: number;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Estado: string;

  @OneToMany(() => ProjectEntity, proyecto => proyecto.Estado)
  Proyectos: ProjectEntity[];
}