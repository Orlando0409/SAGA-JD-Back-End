import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/estado_proyecto.ts
import { Proyecto_Base } from './entidadBase_proyecto';

@Entity('estado_proyecto')
export class EstadoProyecto {
=======
import { ProjectEntity } from './projectEntity';


@Entity('projectStatus')

export class ProjectStatus
{
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectStatus.ts
  @PrimaryGeneratedColumn()
  id_Estado_Proyecto: number;

  @Column({ type: 'varchar', length: 50 })
  Nombre_Estado: string;

<<<<<<< HEAD:src/Modulos/Proyectos/Entidades_proyecto/estado_proyecto.ts
  @OneToMany(() => Proyecto_Base, (proyecto) => proyecto.estado)
  proyectos: Proyecto_Base[];
}
=======
  @OneToMany(() => ProjectEntity, proyecto => proyecto.estado)
  proyectos: ProjectEntity[];
}
>>>>>>> Feature/Alondra:src/Modulos/Proyectos/Entidades_proyecto/projectStatus.ts
