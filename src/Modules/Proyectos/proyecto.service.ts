import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateProyectoDto } from "./ProyectoDTO's/UpdateProyecto.dto";
import { CreateProyectoDto } from "./ProyectoDTO's/CreateProyecto.dto";
import { Proyecto } from "./ProyectoEntities/Proyecto.Entity";
import { ProyectoEstado } from "./ProyectoEntities/EstadoProyecto.Entity";

@Injectable()
export class ProyectoService 
{
    constructor
    (
        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @InjectRepository(ProyectoEstado)
        private readonly proyectoEstadoRepository: Repository<ProyectoEstado>
    ) {}

    async getProyectos()
    {
        return this.proyectoRepository.find({ relations: ['Estado'],});
    }

    async findProyectobyId(Id_Proyecto: number) {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto) { throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`); }
        return proyecto;
    }

    async CreateProyecto(dto: CreateProyectoDto)
    {
        const estadoinicial = await this.proyectoEstadoRepository.findOne({ where:{ Id_Estado_Proyecto: 1 } });
        if (!estadoinicial) {throw new NotFoundException(`Estado inicial de proyecto no configurado`);}

        const now = new Date();
        now.setSeconds(0, 0);

        const nuevoProyecto = this.proyectoRepository.create({...dto, Estado: estadoinicial});
        return this.proyectoRepository.save(nuevoProyecto);
    }

    async UpdateProyecto(Id_Proyecto: number, dto: UpdateProyectoDto) 
    {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto)
          {
            throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`);
          }

        const estado = await this.proyectoEstadoRepository.findOne({ where:{ Id_Estado_Proyecto: 1 } });
        
        if (!estado) {throw new NotFoundException(`Estado inicial de proyecto no configurado`);}

        Object.assign(proyecto, dto, { Estado: estado });
        return this.proyectoRepository.save(proyecto);
    }

    async updateEstadoProyecto(Id_Proyecto: number, Id_Estado_Proyecto: number)
    {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto) { throw new Error(`Proyecto con id ${Id_Proyecto} no encontrado`); }

        const nuevoEstado = await this.proyectoEstadoRepository.findOne({ where: { Id_Estado_Proyecto } });
        if (!nuevoEstado) { throw new Error(`Estado con id ${Id_Estado_Proyecto} no encontrado`); }

        proyecto.Estado = nuevoEstado;
        return this.proyectoRepository.save(proyecto);
    }

    async DeleteProyecto(Id_Proyecto: number) 
    {
        const proyecto = await this.proyectoRepository.findOne({ where: { Id_Proyecto } });
        if (!proyecto) {
            throw new NotFoundException(`Proyecto con id ${Id_Proyecto} no encontrado`);
          }
        await this.proyectoRepository.remove(proyecto);
        return { message: `Proyecto con id ${Id_Proyecto} eliminado correctamente` };
    }
}