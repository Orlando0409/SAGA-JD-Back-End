import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudAfiliacion } from "../SolicitudEntities/Solicitud.Entity";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudAfiliacionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { DropboxFilesService } from "../../../Dropbox/Files/DropboxFiles.service";
import { OmitType } from "@nestjs/swagger";

@Injectable()
export class SolicitudesAfiliacionService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacion)
        private readonly solicitudAfiliacionRepository: Repository<SolicitudAfiliacion>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>,
    ) {}

    async getAllSolicitudesAfiliacion()
    {
        return this.solicitudAfiliacionRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAfiliacionById(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);}
        return solicitud;
    }

    async createSolicitudAfiliacion(dto: CreateSolicitudAfiliacionDto)
    { 
        const estadoInicial = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) { throw new Error(`Estado inicial de solicitud no configurado`); }

        const now = new Date();
        now.setSeconds(0, 0);

        const nuevaSolicitud = this.solicitudAfiliacionRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now });
        return this.solicitudAfiliacionRepository.save(nuevaSolicitud);
    }

    async updateSolicitudAfiliacion(id: number, dto: UpdateSolicitudAfiliacionDto)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({
            where: { Id_Solicitud: id }
        });

        if (!solicitud) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }

        Object.assign(solicitud, dto);
        return this.solicitudAfiliacionRepository.save(solicitud);
    }

    async UpdateEstadoSolicitudAfiliacion(id: number, nuevoEstadoId: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) { throw new Error(`Solicitud con id ${id} no encontrada`); }

        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
        if (!nuevoEstado) { throw new Error(`Estado con id ${nuevoEstadoId} no encontrado`); }

        solicitud.Estado = nuevoEstado;
        return this.solicitudAfiliacionRepository.save(solicitud);
    }

    async deleteSolicitudAfiliacion(id: number)
    {
        const solicitud = await this.solicitudAfiliacionRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) { throw new Error(`Solicitud de afiliación con id ${id} no encontrada`); }
        return this.solicitudAfiliacionRepository.remove(solicitud);
    }
}