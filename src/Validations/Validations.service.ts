import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SolicitudAfiliacion, SolicitudAsociado, SolicitudCambioMedidor, SolicitudDesconexion } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { Repository } from "typeorm";

@Injectable()
export class ValidationsService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacion)
        private readonly solicitudAfiliacionRepository: Repository<SolicitudAfiliacion>,

        @InjectRepository(SolicitudDesconexion)
        private readonly solicitudDesconexionRepository: Repository<SolicitudDesconexion>,

        @InjectRepository(SolicitudCambioMedidor)
        private readonly solicitudCambioMedidorRepository: Repository<SolicitudCambioMedidor>,

        @InjectRepository(SolicitudAsociado)
        private readonly solicitudAsociadoRepository: Repository<SolicitudAsociado>,
    ) {}

    async validarSolicitudesActivas(cedula: string) {
        const [afiliacionPendiente, afiliacionRevisada, desconexionPendiente, desconexionRevisada, cambioMedidorPendiente, cambioMedidorRevisada, asociadoPendiente, asociadoRevisada] = await Promise.all([
            this.solicitudAfiliacionRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudAfiliacionRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }), 
            this.solicitudDesconexionRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudDesconexionRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
            this.solicitudCambioMedidorRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudCambioMedidorRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
            this.solicitudAsociadoRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudAsociadoRepository.findOne({ where: { Cedula: cedula, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
        ]);

        if (afiliacionPendiente?.Estado.Id_Estado_Solicitud === 1 || afiliacionRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de afiliación para la cédula ${cedula}`;
        }

        else if (desconexionPendiente?.Estado.Id_Estado_Solicitud === 1 || desconexionRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de desconexión para la cédula ${cedula}`;
        }

        else if (cambioMedidorPendiente?.Estado.Id_Estado_Solicitud === 1 || cambioMedidorRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de cambio de medidor para la cédula ${cedula}`;
        }

        else if (asociadoPendiente?.Estado.Id_Estado_Solicitud === 1 || asociadoRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de asociado para la cédula ${cedula}`;
        }
    }
}