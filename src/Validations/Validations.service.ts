import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica, SolicitudAsociadoFisica, SolicitudAsociadoJuridica, SolicitudCambioMedidorFisica, SolicitudCambioMedidorJuridica, SolicitudDesconexionFisica, SolicitudDesconexionJuridica } from "src/Modules/Solicitudes/SolicitudEntities/Solicitud.Entity";
import { AfiliadoFisico, AfiliadoJuridico } from "src/Modules/Afiliados/AfiliadoEntities/Afiliado.Entity";
import { Repository } from "typeorm";

@Injectable()
export class ValidationsService {
    constructor(
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
        if (afiliado) return `Ya existe un afiliado físico con la cédula ${identificacion}. No puede realizar una nueva solicitud de afiliación.`;

        return null; // No hay error
    }

    async validarExistenciaAfiliadoJuridico(cedulaJuridica: string) {
        const afiliado = await this.afiliadoJuridicoRepository.findOne({ where: { Cedula_Juridica: cedulaJuridica } });
        if (afiliado) return `Ya existe un afiliado jurídico con la cédula ${cedulaJuridica}. No puede realizar una nueva solicitud de afiliación.`;

        return null; // No hay error
    }

    /**
     * Valida el formato de una identificación según su tipo
     * @param tipo - Tipo de identificación (CEDULA, DIMEX, PASAPORTE, CEDULA_JURIDICA)
     * @param identificacion - Número de identificación a validar
     * @throws Error si el formato no es válido
     */
    validarFormatoIdentificacion(tipo: string, identificacion: string): void {
        if (!identificacion || !tipo) {
            throw new Error('Debe proporcionar tanto el tipo como la identificación');
        }

        // Eliminar espacios, guiones y otros caracteres no alfanuméricos
        const limpio = identificacion.replace(/[\s\-]+/g, '');

        let esValido = false;
        let mensajeError = '';

        switch (tipo) {
            case 'Cedula Nacional':
                esValido = /^[1-7]\d{8}$/.test(limpio);
                mensajeError = 'La cédula nacional debe tener 9 dígitos numéricos y comenzar con un número del 1 al 7';
                break;

            case 'Dimex':
                esValido = /^(12|13|18)\d{9,10}$/.test(limpio);
                mensajeError = 'El DIMEX debe tener entre 11 y 12 dígitos numéricos y debe comenzar con 12, 13 o 18';
                break;

            case 'Pasaporte':
                esValido = /^(?=.*[A-Z])(?=([A-Z]*[0-9]*){6,12}$)(?!.*[A-Z].*[A-Z].*[A-Z].*[A-Z])[A-Z0-9]{6,12}$/.test(limpio.toUpperCase());
                mensajeError = 'El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos en mayúsculas, con al menos 1 letra y máximo 3 letras';
                break;

            case 'Cedula Juridica':
                esValido = /^[34]\d{9}$/.test(limpio);
                mensajeError = 'La cédula jurídica debe tener 10 dígitos y comenzar con 3 (nacional) o 4 (extranjera)';
                break;

            default:
                throw new Error(`Tipo de identificación no válido: ${tipo}`);
        }

        if (!esValido) {
            throw new Error(`${mensajeError}. Formato recibido: ${identificacion}`);
        }
    }
}