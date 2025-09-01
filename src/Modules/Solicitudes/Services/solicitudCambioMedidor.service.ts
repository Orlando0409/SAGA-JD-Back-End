import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidor } from "../SolicitudEntities/Solicitud.Entity";
import { CreateCambioMedidorDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudCambioMedidorDto } from "../SolicitudDTO's/UpdateSolicitud.dto";

@Injectable()
export class SolicitudesMedidorService
{
    constructor
    (
        @InjectRepository(SolicitudCambioMedidor)
        private readonly solicitudCambioMedidorRepository: Repository<SolicitudCambioMedidor>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>
    ) {}

    async findAllSolicitudesCambioMedidor()
    {
        return this.solicitudCambioMedidorRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudCambioMedidorById(id: number)
    {
        const solicitud = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return solicitud;
    }

    async createSolicitudCambioMedidor(dto: CreateCambioMedidorDto)
    {
        const estadoInicial = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new Error(`Estado inicial de solicitud no configurado`);}
    
        const now = new Date();
        now.setSeconds(0, 0);
    
        const nuevaSolicitud = this.solicitudCambioMedidorRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudCambioMedidorRepository.save(nuevaSolicitud);
    }

    async updateSolicitudCambioMedidor(id: number, dto: UpdateSolicitudCambioMedidorDto)
    {
        const solicitud = await this.solicitudCambioMedidorRepository.findOne({
            where: { Id_Solicitud: id }
        });
    
        if (!solicitud) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }
    
        Object.assign(solicitud, dto);
        return this.solicitudCambioMedidorRepository.save(solicitud);
    }
    
    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudCambioMedidorRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
    
        if (!solicitud) {throw new Error(`Solicitud con id ${id} no encontrada`);}
    
        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
    
        if (!nuevoEstado) {throw new Error(`Estado con id ${nuevoEstadoId} no encontrado`);}
    
        solicitud.Estado = nuevoEstado;
        return this.solicitudCambioMedidorRepository.save(solicitud);
    }

    async deleteSolicitudCambioMedidor(id: number)
    {
        const solicitud = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return this.solicitudCambioMedidorRepository.remove(solicitud);
    }
}