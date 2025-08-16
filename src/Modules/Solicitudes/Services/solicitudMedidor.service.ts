import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";
import { SolicitudCambioMedidor } from "../SolicitudEntities/Solicitud.Entity";

@Injectable()
export class SolicitudesMedidorService
{
    constructor
    (
        @InjectRepository(SolicitudCambioMedidor)
        private readonly solicitudesMedidorRepository: Repository<SolicitudCambioMedidor>,

        @InjectRepository(SolicitudEstado)
        private readonly solicitudEstadoRepository: Repository<SolicitudEstado>
    ) {}
}