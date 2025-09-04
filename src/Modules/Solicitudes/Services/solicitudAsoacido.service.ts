import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SolicitudAsociado } from "../SolicitudEntities/Solicitud.Entity";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSolicitudAsociadoDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudAsociadoDto } from "../SolicitudDTO's/UpdateSolicitud.dto";

@Injectable()
export class SolicitudesAsociadoService
{
    constructor(
        @InjectRepository(SolicitudAsociado)
        private readonly solicitudAsociadoRepository: Repository<SolicitudAsociado>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>,
    ) {}

    async getAllSolicitudesAsociado()
    {
        return this.solicitudAsociadoRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudAsociadoById(id: number)
    {
        const solicitud = await this.solicitudAsociadoRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {throw new Error(`Solicitud de asociado con id ${id} no encontrada`);}
        return solicitud;
    }

    @Public()
    async createSolicitudAsociado(dto: CreateSolicitudAsociadoDto)
    {
        const estadoInicial = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new Error(`Estado inicial de solicitud no configurado`);}
    
        const now = new Date();
        now.setSeconds(0, 0);
    
        const solicitudAsociado = this.solicitudAsociadoRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudAsociadoRepository.save(solicitudAsociado);
    }

    async updateSolicitudAsociado(id: number, dto: UpdateSolicitudAsociadoDto)
    {
        const solicitudAsociado = await this.solicitudAsociadoRepository.findOne({
            where: { Id_Solicitud: id }
        });
    
        if (!solicitudAsociado) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }
    
        Object.assign(solicitudAsociado, dto);
        return this.solicitudAsociadoRepository.save(solicitudAsociado);
    }
    
    async UpdateEstadoSolicitudAsociado(id: number, nuevoEstadoId: number)
    {
        const solicitudAsociado = await this.solicitudAsociadoRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
    
        if (!solicitudAsociado) {throw new Error(`Solicitud con id ${id} no encontrada`);}
    
        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
    
        if (!nuevoEstado) {throw new Error(`Estado con id ${nuevoEstadoId} no encontrado`);}
    
        solicitudAsociado.Estado = nuevoEstado;
        return this.solicitudAsociadoRepository.save(solicitudAsociado);
    }

    async deleteSolicitudAsociado(id: number)
    {
        const solicitudAsociado = await this.solicitudAsociadoRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudAsociado) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return this.solicitudAsociadoRepository.remove(solicitudAsociado);
    }
}
