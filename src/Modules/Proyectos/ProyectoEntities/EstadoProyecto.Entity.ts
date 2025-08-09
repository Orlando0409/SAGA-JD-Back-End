import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProjectEntity } from './Proyecto.Entity';

@Entity('projectStatus')

export class ProjectStatus
{
  @PrimaryGeneratedColumn()
  id_Estado_Proyecto: number;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Estado: string;

  @OneToMany(() => ProjectEntity, proyecto => proyecto.estado)
  proyectos: ProjectEntity[];
}