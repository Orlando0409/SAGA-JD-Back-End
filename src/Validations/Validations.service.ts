import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, SolicitudAsociadoFisica, SolicitudAsociadoJuridica, SolicitudCambioMedidorFisica, SolicitudCambioMedidorJuridica, SolicitudDesconexionFisica, SolicitudDesconexionJuridica } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { AfiliadoFisico, AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { Repository } from "typeorm";

@Injectable()
export class ValidationsService
{
    constructor
    (
        @InjectRepository(SolicitudAfiliacionFisica)
        private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,

        @InjectRepository(SolicitudDesconexionFisica)
        private readonly solicitudDesconexionFisicaRepository: Repository<SolicitudDesconexionFisica>,

        @InjectRepository(SolicitudCambioMedidorFisica)
        private readonly solicitudCambioMedidorFisicaRepository: Repository<SolicitudCambioMedidorFisica>,

        @InjectRepository(SolicitudAsociadoFisica)
        private readonly solicitudAsociadoFisicaRepository: Repository<SolicitudAsociadoFisica>,

        @InjectRepository(SolicitudAfiliacionJuridica)
        private readonly solicitudAfiliacionJuridicaRepository: Repository<SolicitudAfiliacionJuridica>,

        @InjectRepository(SolicitudDesconexionJuridica)
        private readonly solicitudDesconexionJuridicaRepository: Repository<SolicitudDesconexionJuridica>,

        @InjectRepository(SolicitudCambioMedidorJuridica)
        private readonly solicitudCambioMedidorJuridicaRepository: Repository<SolicitudCambioMedidorJuridica>,

        @InjectRepository(SolicitudAsociadoJuridica)
        private readonly solicitudAsociadoJuridicaRepository: Repository<SolicitudAsociadoJuridica>,

        @InjectRepository(AfiliadoFisico)
        private readonly afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(AfiliadoJuridico)
        private readonly afiliadoJuridicoRepository: Repository<AfiliadoJuridico>
    ) {}

    async validarSolicitudesFisicasActivas(identificacion: string) {
        const [afiliacionPendiente, afiliacionRevisada, desconexionPendiente, desconexionRevisada, cambioMedidorPendiente, cambioMedidorRevisada, asociadoPendiente, asociadoRevisada] = await Promise.all([
            this.solicitudAfiliacionFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudAfiliacionFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
            this.solicitudDesconexionFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudDesconexionFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
            this.solicitudCambioMedidorFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudCambioMedidorFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
            this.solicitudAsociadoFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudAsociadoFisicaRepository.findOne({ where: { Identificacion: identificacion, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
        ]);

        if (afiliacionPendiente?.Estado.Id_Estado_Solicitud === 1 || afiliacionRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de afiliación para la cédula ${identificacion}`;
        }

        else if (desconexionPendiente?.Estado.Id_Estado_Solicitud === 1 || desconexionRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de desconexión para la cédula ${identificacion}`;
        }

        else if (cambioMedidorPendiente?.Estado.Id_Estado_Solicitud === 1 || cambioMedidorRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de cambio de medidor para la cédula ${identificacion}`;
        }

        else if (asociadoPendiente?.Estado.Id_Estado_Solicitud === 1 || asociadoRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de asociado para la cédula ${identificacion}`;
        }
    }

    async validarSolicitudesJuridicasActivas(cedulaJuridica: string) {
        const [afiliacionPendiente, afiliacionRevisada, desconexionPendiente, desconexionRevisada, cambioMedidorPendiente, cambioMedidorRevisada, asociadoPendiente, asociadoRevisada] = await Promise.all([
            this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }), 
            this.solicitudDesconexionJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudDesconexionJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
            this.solicitudCambioMedidorJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudCambioMedidorJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
            this.solicitudAsociadoJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 1 } }, relations: ['Estado'] }),
            this.solicitudAsociadoJuridicaRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica, Estado: { Id_Estado_Solicitud: 2 } }, relations: ['Estado'] }),
        ]);

        if (afiliacionPendiente?.Estado.Id_Estado_Solicitud === 1 || afiliacionRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de afiliación para la cédula jurídica ${cedulaJuridica}`;
        }

        else if (desconexionPendiente?.Estado.Id_Estado_Solicitud === 1 || desconexionRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de desconexión para la cédula jurídica ${cedulaJuridica}`;
        }

        else if (cambioMedidorPendiente?.Estado.Id_Estado_Solicitud === 1 || cambioMedidorRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de cambio de medidor para la cédula jurídica ${cedulaJuridica}`;
        }

        else if (asociadoPendiente?.Estado.Id_Estado_Solicitud === 1 || asociadoRevisada?.Estado.Id_Estado_Solicitud === 2) {
            return `Ya existe una solicitud activa de asociado para la cédula jurídica ${cedulaJuridica}`;
        }
    }

    async validarExistenciaAfiliadoFisico(identificacion: string) {
        const afiliado = await this.afiliadoFisicoRepository.findOne({ where: { Identificacion: identificacion } });
        if (afiliado) {
            return null; // No hay error
        }

        return `Ya existe un afiliado físico con la cédula ${identificacion}. No puede realizar una nueva solicitud de afiliación.`;
    }

    async validarExistenciaAfiliadoJuridico(cedulaJuridica: string) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica } });
        if (afiliado) {
            return null; // No hay error
        }

        return `Ya existe un afiliado jurídico con la cédula ${cedulaJuridica}. No puede realizar una nueva solicitud de afiliación.`;
    }
}