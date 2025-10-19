import { SolicitudAfiliacionFisica, SolicitudAsociadoFisica, SolicitudCambioMedidorFisica, SolicitudDesconexionFisica } from "../../SolicitudEntities/Solicitud.Entity"; import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";
import { ValidationsService } from "src/Validations/Validations.service";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { EmailService } from "src/Modules/Emails/email.service";

@Injectable()
export class SolicitudesFisicasService {
    constructor(
        @InjectRepository(SolicitudAfiliacionFisica)
        private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,

        @InjectRepository(SolicitudCambioMedidorFisica)
        private readonly solicitudCambioMedidorFisicaRepository: Repository<SolicitudCambioMedidorFisica>,

        @InjectRepository(SolicitudDesconexionFisica)
        private readonly solicitudDesconexionFisicaRepository: Repository<SolicitudDesconexionFisica>,

        @InjectRepository(SolicitudAsociadoFisica)
        private readonly solicitudAsociadoFisicaRepository: Repository<SolicitudAsociadoFisica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,
    ) { }

    async getAllSolicitudesFisicas() {
        return {
            "Afiliacion": await this.getAllSolicitudesAfiliacion(),
            "Asociado": await this.getAllSolicitudesAsociado(),
            "Cambio De Medidor": await this.getAllSolicitudesCambioMedidor(),
            "Desconexion": await this.getAllSolicitudesDesconexion(),
        };
    }

    async getAllSolicitudesAfiliacion() {
        return this.solicitudAfiliacionFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesAsociado() {
        return this.solicitudAsociadoFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesCambioMedidor() {
        return this.solicitudCambioMedidorFisicaRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesDesconexion() {
        return this.solicitudDesconexionFisicaRepository.find({ relations: ['Estado'] });
    }
}