import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/projectStatus.ts
<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/estado_proyecto.ts
import { Proyecto_Base } from './entidadBase_proyecto';

@Entity('estado_proyecto')
export class EstadoProyecto {
=======
import { ProjectEntity } from './projectEntity';

=======
import { ProjectEntity } from './Proyecto.Entity';
>>>>>>> origin/Andres-features:src/Modules/Proyectos/ProyectoEntities/EstadoProyecto.Entity.ts

@Entity('ProjectStatus')

export class ProjectStatus
{
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectStatus.ts
  @PrimaryGeneratedColumn()
  Id_Estado_Proyecto: number;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Estado: string;

  @OneToMany(() => ProjectEntity, proyecto => proyecto.Estado)
  Proyectos: ProjectEntity[];
}
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectStatus.ts
