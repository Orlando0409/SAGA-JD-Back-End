import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidor } from "../SolicitudEntities/Solicitud.Entity";
import { CreateCambioMedidorDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { UpdateSolicitudCambioMedidorDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Injectable()
export class SolicitudesCambioMedidorService
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
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitudCambioMedidor) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return solicitudCambioMedidor;
    }

    @Public()
    async createSolicitudCambioMedidor(dto: CreateCambioMedidorDto)
    {
        const estadoInicial = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: 1 } });
        if (!estadoInicial) {throw new Error(`Estado inicial de solicitud no configurado`);}
        
        const validacionCedula = await this.solicitudCambioMedidorRepository.findOne({ where: { Cedula: dto.Cedula }, });
        const validacionTipoSolicitud = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Tipo_Solicitud: 3 }, });
        if (validacionCedula && validacionTipoSolicitud) { throw new Error(`Ya existe una solicitud de cambio de medidor con la cédula ${dto.Cedula}`); }

        const now = new Date();
        now.setSeconds(0, 0);

        const solicitudCambioMedidor = this.solicitudCambioMedidorRepository.create({...dto, Estado: estadoInicial, Fecha_Creacion: now});
        return this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);
    }

    async updateSolicitudCambioMedidor(id: number, dto: UpdateSolicitudCambioMedidorDto)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({
            where: { Id_Solicitud: id }
        });
    
        if (!solicitudCambioMedidor) {
            throw new Error(`Solicitud de afiliación con id ${id} no encontrada`);
        }
    
        Object.assign(solicitudCambioMedidor, dto);
        return this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);
    }
    
    async UpdateEstadoSolicitudCambioMedidor(id: number, nuevoEstadoId: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({where: { Id_Solicitud: id }, relations: ['Estado'] });
    
        if (!solicitudCambioMedidor) {throw new Error(`Solicitud con id ${id} no encontrada`);}
    
        const nuevoEstado = await this.solicitudEstadoRepository.findOne({where: { Id_Estado_Solicitud: nuevoEstadoId }});
    
        if (!nuevoEstado) {throw new Error(`Estado con id ${nuevoEstadoId} no encontrado`);}
    
        solicitudCambioMedidor.Estado = nuevoEstado;
        return this.solicitudCambioMedidorRepository.save(solicitudCambioMedidor);
    }

    async deleteSolicitudCambioMedidor(id: number)
    {
        const solicitudCambioMedidor = await this.solicitudCambioMedidorRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitudCambioMedidor) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return this.solicitudCambioMedidorRepository.remove(solicitudCambioMedidor);
    }
}