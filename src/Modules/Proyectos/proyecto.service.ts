import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectEntity } from "./ProyectoEntities/Project.Entity";
import { ProjectStatus } from "./ProyectoEntities/ProjectStatus.Entity";
import { CrearProyectoDto } from "./ProyectoDTO's/CrearProyecto.dto";

@Injectable()
export class ProyectoService 
{
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly proyectoRepository: Repository<ProjectEntity>,

    @InjectRepository(ProjectStatus)
    private readonly projectStatusRepository: Repository<ProjectStatus>
  ) {}

  async AllProyects()
  {
    return this.proyectoRepository.find({ relations: ['Estado'],});
  }

  async findProyecto(Id_Proyecto: number) {
    const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
    if (!proyecto)
      {
        throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`);
      }
    return proyecto;
  }

  async CreateProyecto(dto: CrearProyectoDto)
  {
    const estado = await this.projectStatusRepository.findOne({ 
        where:{ Id_Estado_Proyecto: dto.Id_Estado_Proyecto } 
    });
    
    if (!estado) {throw new NotFoundException(`Estado con id ${dto.Id_Estado_Proyecto} no encontrado`);}

    const nuevoProyecto = this.proyectoRepository.create({...dto, Estado: estado});
    return this.proyectoRepository.save(nuevoProyecto);
  }

  async UpdateProyecto(Id_Proyecto: number, dto: CrearProyectoDto) 
  {
    const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
    if (!proyecto)
      {
        throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`);
      }

    const estado = await this.projectStatusRepository.findOne({ where:{ Id_Estado_Proyecto: dto.Id_Estado_Proyecto } });
    
    if (!estado) {throw new NotFoundException(`Estado con id ${dto.Id_Estado_Proyecto} no encontrado`);}

    Object.assign(proyecto, dto, { Estado: estado});
    return this.proyectoRepository.save(proyecto);
  }

  async DeleteProyecto(Id_Proyecto: number) 
  {
    const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
    if (!proyecto)
      {
        throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`);
      }
    await this.proyectoRepository.remove(proyecto);
    return { message: `Proyecto con id ${Id_Proyecto} eliminado correctamente` };
  }
}