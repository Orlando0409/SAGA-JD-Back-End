import { Solicitud, SolicitudAfiliacionJuridica, SolicitudAsociadoJuridica, SolicitudCambioMedidorJuridica, SolicitudDesconexionJuridica, SolicitudJuridica } from "../../SolicitudEntities/Solicitud.Entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EstadoSolicitud } from "../../SolicitudEntities/EstadoSolicitud.Entity";
import { EmailService } from "src/Modules/Emails/email.service";
import { AfiliadosService } from "src/Modules/Afiliados/afiliados.service";
import { ValidationsService } from "src/Validations/Validations.service";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";

@Injectable()
export class SolicitudesJuridicasService {
    constructor(
        @InjectRepository(Solicitud)
        private readonly solicitudRepository: Repository<Solicitud>,

        @InjectRepository(SolicitudJuridica)
        private readonly solicitudJuridicaRepository: Repository<SolicitudJuridica>,

        @InjectRepository(SolicitudAfiliacionJuridica)
        private readonly solicitudAfiliacionRepository: Repository<SolicitudAfiliacionJuridica>,

        @InjectRepository(SolicitudDesconexionJuridica)
        private readonly solicitudDesconexionRepository: Repository<SolicitudDesconexionJuridica>,

        @InjectRepository(SolicitudCambioMedidorJuridica)
        private readonly solicitudCambioMedidorRepository: Repository<SolicitudCambioMedidorJuridica>,

        @InjectRepository(SolicitudAsociadoJuridica)
        private readonly solicitudAsociadoRepository: Repository<SolicitudAsociadoJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepo: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,
    ) { }

    async getAllSolicitudesJuridicas() {
        return {
            "Afiliacion": await this.getAllSolicitudesAfiliacion(),
            "Desconexion": await this.getAllSolicitudesDesconexion(),
            "Cambio De Medidor": await this.getAllSolicitudesCambioMedidor(),
            "Asociado": await this.getAllSolicitudesAsociado(),
        };
    }

    async getAllSolicitudesAfiliacion() {
        return this.solicitudAfiliacionRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesDesconexion() {
        return this.solicitudDesconexionRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesCambioMedidor() {
        return this.solicitudCambioMedidorRepository.find({ relations: ['Estado'] });
    }

    async getAllSolicitudesAsociado() {
        return this.solicitudAsociadoRepository.find({ relations: ['Estado'] });
    }
}