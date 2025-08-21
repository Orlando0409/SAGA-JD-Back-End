import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectEntity } from "./ProyectoEntities/Proyecto.Entity";
import { ProyectoEstado } from "./ProyectoEntities/EstadoProyecto.Entity";
import { CreateProyectoDto } from "./ProyectoDTO's/CrearProyecto.dto";

@Injectable()
export class ProyectoService 
{
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly proyectoRepository: Repository<ProjectEntity>,

    @InjectRepository(ProyectoEstado)
    private readonly projectStatusRepository: Repository<ProyectoEstado>
  ) {}

  async getAllProyects()
  {
    return this.proyectoRepository.find({ relations: ['Estado'],});
  }

  async findProyectobyId(Id_Proyecto: number) {
    const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
    if (!proyecto)
      {
        throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`);
      }
    return proyecto;
  }

  async CreateProyecto(dto: CreateProyectoDto)
  {
    const estado = await this.projectStatusRepository.findOne({ 
        where:{ Id_Estado_Proyecto: dto.Id_Estado_Proyecto } 
    });
    
    if (!estado) {throw new NotFoundException(`Estado con id ${dto.Id_Estado_Proyecto} no encontrado`);}

    const nuevoProyecto = this.proyectoRepository.create({...dto, Estado: estado});
    return this.proyectoRepository.save(nuevoProyecto);
  }

  async UpdateProyecto(Id_Proyecto: number, dto: CreateProyectoDto) 
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