import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudAfiliacion } from "../SolicitudEntities/Solicitud.Entity";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";

@Injectable()
export class SolicitudesAfiliacionService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacion)
        private readonly solicitudAfiliacionRepository: Repository<SolicitudAfiliacion>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAfiliacionById(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }
        return solicitud;
    }

    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionDto)
    {
        const estado = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: dto.Id_Estado_Solicitud } });
        if (!estado) {
            throw new Error(`Estado de solicitud con id ${dto.Id_Estado_Solicitud} no encontrado`);
        }

        const now = new Date();
        now.setSeconds(0, 0);
        const nuevaSolicitud = this.solicitudAfiliacionRepository.create({ ...dto, Estado: estado });
        return this.solicitudAfiliacionRepository.save(nuevaSolicitud);
    }

    async updateSolicitudAfiliacion(id: number, dto: CreateSolicitudAfiliacionDto)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }

        const estado = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: dto.Id_Estado_Solicitud } });
        if (!estado) {
            throw new Error(`Estado de solicitud con id ${dto.Id_Estado_Solicitud} no encontrado`);
        }

        Object.assign(solicitud, dto, { Estado: estado });
        return this.solicitudAfiliacionRepository.save(solicitud);
    }

    async deleteSolicitudAfiliacion(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }
        return this.solicitudAfiliacionRepository.remove(solicitud);
    }
}