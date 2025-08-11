import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectEntity } from "./Entidades_proyecto/projectEntity";

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(ProjectEntity)
    private proyectoRepository: Repository<ProjectEntity>,
  ) {}

   AllProyects(): Promise<ProjectEntity[]> 
  {
    return this.proyectoRepository.find({ relations: ['estado'],});
  }

  CreateProyecto(proyecto: ProjectEntity): Promise<ProjectEntity> 
  {
    return this.proyectoRepository.save(proyecto);
  }

  DeleteProyecto(id_Proyecto: number): Promise<void> 
  {
    return this.proyectoRepository.delete(id_Proyecto).then(() => {});
  }
}