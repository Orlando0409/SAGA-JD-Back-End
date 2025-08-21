import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SolicitudDesconexion } from "../SolicitudEntities/Solicitud.Entity";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudDesconexionDto } from "../SolicitudDTO's/CreateSolicitud.dto";

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
        const estado = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: dto.Id_Estado_Solicitud } });
        if (!estado) {
            throw new Error(`Estado de solicitud con id ${dto.Id_Estado_Solicitud} no encontrado`);
        }

        const now = new Date();
        now.setSeconds(0, 0);
        const nuevaSolicitud = this.solicitudDesconexionRepository.create({ ...dto, Estado: estado });
        return this.solicitudDesconexionRepository.save(nuevaSolicitud);
    }

    async updateSolicitudDesconexion(id: number, dto: CreateSolicitudDesconexionDto)
    {
        const solicitud = await this.solicitudDesconexionRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) {
            throw new Error(`Solicitud de desconexión con id ${id} no encontrada`);
        }

        const estado = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: dto.Id_Estado_Solicitud } });
        if (!estado) {
            throw new Error(`Estado de solicitud con id ${dto.Id_Estado_Solicitud} no encontrado`);
        }

        Object.assign(solicitud, dto, { Estado: estado });
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