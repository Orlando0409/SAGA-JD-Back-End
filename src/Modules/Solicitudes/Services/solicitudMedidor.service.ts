import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidor } from "../SolicitudEntities/Solicitud.Entity";
import { CreateSolicitudDesconexionDto } from "../SolicitudDTO's/CreateSolicitud.dto";

@Injectable()
export class SolicitudesMedidorService
{
    getAllSolicitudesCambioMedidor() {
      throw new Error("Method not implemented.");
    }
    constructor
    (
        @InjectRepository(SolicitudCambioMedidor)
        private readonly solicitudesMedidorRepository: Repository<SolicitudCambioMedidor>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>
    ) {}

    async findAllSolicitudesMedidor()
    {
        return this.solicitudesMedidorRepository.find({ relations: ['Estado'] });
    }

    async findSolicitudMedidorById(id: number)
    {
        const solicitud = await this.solicitudesMedidorRepository.findOne({ where: { Id_Solicitud: id }, relations: ['Estado'] });
        if (!solicitud) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return solicitud;
    }

    async createSolicitudMedidor(dto: CreateSolicitudDesconexionDto)
    {
        const estado = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: dto.Id_Estado_Solicitud } });
        if (!estado) {
            throw new Error(`Estado de solicitud con id ${dto.Id_Estado_Solicitud} no encontrado`);
        }

        const now = new Date();
        now.setSeconds(0, 0);
        const nuevaSolicitud = this.solicitudesMedidorRepository.create({ ...dto, Estado: estado });
        return this.solicitudesMedidorRepository.save(nuevaSolicitud);
    }

    async updateSolicitudMedidor(id: number, dto: CreateSolicitudDesconexionDto)
    {
        const solicitud = await this.solicitudesMedidorRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }

        const estado = await this.solicitudEstadoRepository.findOne({ where: { Id_Estado_Solicitud: dto.Id_Estado_Solicitud } });
        if (!estado) {
            throw new Error(`Estado de solicitud con id ${dto.Id_Estado_Solicitud} no encontrado`);
        }

        Object.assign(solicitud, dto, { Estado: estado });
        return this.solicitudesMedidorRepository.save(solicitud);
    }

    async deleteSolicitudMedidor(id: number)
    {
        const solicitud = await this.solicitudesMedidorRepository.findOne({ where: { Id_Solicitud: id } });
        if (!solicitud) {
            throw new Error(`Solicitud de cambio de medidor con id ${id} no encontrada`);
        }
        return this.solicitudesMedidorRepository.remove(solicitud);
    }
}