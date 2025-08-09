import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectEntity } from "./ProyectoEntities/Proyecto.Entity";
import { ProjectStatus } from "./ProyectoEntities/EstadoProyecto.Entity";
import { CrearProyectoDto } from "./ProyectoDTO's/CrearProyecto.dto";

@Injectable()
export class ProyectoService 
{
  AllProyectos() {
    throw new Error("Method not implemented.");
  }
  constructor(
    @InjectRepository(ProjectEntity)
    private proyectoRepository: Repository<ProjectEntity>,

    @InjectRepository(ProjectStatus)
    private projectStatusRepository: Repository<ProjectStatus>
  ) {}

  async AllProyects()
  {
    return this.proyectoRepository.find();
  }

  async findProyecto(id_Proyecto: number) {
    const proyecto = await this.proyectoRepository.findOne({ where: { id_Proyecto } });
    if (!proyecto)
      {
        throw new NotFoundException(`Proyecto con id ${id_Proyecto} no encontrado`);
      }
    return proyecto;
  }

  async CreateProyecto(dto: CrearProyectoDto)
  {
    const estado = await this.projectStatusRepository.findOne({ 
        where:
        { 
            id_Estado_Proyecto: dto.estado.id_Estado_Proyecto
        } 
    });
    
    if (!estado)
      {
        throw new NotFoundException(`Estado con id ${dto.estado} no encontrado`);
      }

    const nuevoProyecto = this.proyectoRepository.create({
        ...dto,
        estado
    });

    return this.proyectoRepository.save(nuevoProyecto);
  }

  async DeleteProyecto(id_Proyecto: number) 
  {
    const proyecto = await this.proyectoRepository.findOne({ where: { id_Proyecto } });
    if (!proyecto)
      {
        throw new NotFoundException(`Proyecto con id ${id_Proyecto} no encontrado`);
      }

    await this.proyectoRepository.delete(id_Proyecto);
    return { message: `Proyecto con id ${id_Proyecto} eliminado exitosamente` };
  }
}