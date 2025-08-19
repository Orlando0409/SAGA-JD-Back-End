import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SolicitudDesconexion } from "../SolicitudEntities/Solicitud.Entity";
import { Repository } from "typeorm";
import { SolicitudEstado } from "../SolicitudEntities/EstadoSolicitud.Entity";

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
}