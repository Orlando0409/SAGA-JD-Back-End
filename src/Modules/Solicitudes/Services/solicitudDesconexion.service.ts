import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SolicitudDesconexion } from "../SolicitudEntities/Solicitud.Entity";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudDesconexionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudDesconexionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";

@Injectable()
export class SolicitudesDesconexionService
{
    constructor
    (
        @InjectRepository(SolicitudDesconexion)
        private readonly solicitudDesconexionRepository: Repository<SolicitudDesconexion>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>
    ) {}

    async findAllSolicitudesDesconexion()
    {
        return this.solicitudDesconexionRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudDesconexionById(id: number)
    {
        const solicitud = await this.solicitudDesconexionRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {
            throw new Error(`Solicitud de desconexión con id ${id} no encontrada`);
        }
        return solicitud;
    }

    async createSolicitudDesconexion(dto: CreateSolicitudDesconexionDto)
    {
        const estadoInicial = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new Error(`Estado inicial de solicitud no configurado`);}
        
        const now = new Date();
        now.setSeconds(0, 0);
        
        const nuevaSolicitud = this.solicitudDesconexionRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudDesconexionRepository.save(nuevaSolicitud);
    }
    
    async updateSolicitudDesconexion(id: number, dto: UpdateSolicitudDesconexionDto)
    {
        const solicitud = await this.solicitudDesconexionRepository.findOne({
            where: { Id_Solicitud: id }
        });
        
        if (!solicitud) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }
        
        Object.assign(solicitud, dto);
        return this.solicitudDesconexionRepository.save(solicitud);
    }
        
    async UpdateEstadoSolicitudDesconexion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudDesconexionRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        
        if (!solicitud) {throw new Error(`Solicitud con id ${id} no encontrada`);}
        
        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        
        if (!nuevoEstado) {throw new Error(`Estado con id ${nuevoEstadoId} no encontrado`);}
        
        solicitud.Estado = nuevoEstado;
        return this.solicitudDesconexionRepository.save(solicitud);
    }

    async deleteSolicitudDesconexion(id: number)
    {
        const solicitud = await this.solicitudDesconexionRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) {
            throw new Error(`Solicitud de desconexión con id ${id} no encontrada`);
        }
        return this.solicitudDesconexionRepository.remove(solicitud);
    }
}