import { SolicitudAfiliacionJuridica, SolicitudAsociadoJuridica, SolicitudCambioMedidorJuridica, SolicitudDesconexionJuridica } from "../../SolicitudEntities/Solicitud.Entity";
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
        @InjectRepository(SolicitudAfiliacionJuridica)
        private readonly solicitudAfiliacionRepo: Repository<SolicitudAfiliacionJuridica>,

        @InjectRepository(SolicitudCambioMedidorJuridica)
        private readonly solicitudCambioMedidorRepo: Repository<SolicitudCambioMedidorJuridica>,

        @InjectRepository(SolicitudDesconexionJuridica)
        private readonly solicitudDesconexionRepo: Repository<SolicitudDesconexionJuridica>,

        @InjectRepository(SolicitudAsociadoJuridica)
        private readonly solicitudAsociadoRepo: Repository<SolicitudAsociadoJuridica>,

        @InjectRepository(EstadoSolicitud)
        private readonly estadoSolicitudRepo: Repository<EstadoSolicitud>,

        private readonly dropboxFilesService: DropboxFilesService,

        private readonly validationsService: ValidationsService,

        private readonly afiliadosService: AfiliadosService,

        private readonly emailService: EmailService,
    ) { }
}