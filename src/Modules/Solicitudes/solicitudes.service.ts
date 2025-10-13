import { Injectable } from "@nestjs/common";
import { SolicitudAfiliacionFisicaService } from "./Fisica/Services/solicitudAfiliacion.service";
import { SolicitudAsociadoJuridicaService } from "./Juridica/Services/solicitudAsociado.service";
import { SolicitudCambioMedidorJuridicaService } from "./Juridica/Services/solicitudCambioMedidor.service";
import { SolicitudDesconexionJuridicaService } from "./Juridica/Services/solicitudDesconexion.service";
import { SolicitudAfiliacionJuridicaService } from "./Juridica/Services/solicitudAfiliacion.service";
import { SolicitudAsociadoFisicaService } from "./Fisica/Services/solicitudAsociado.service";
import { SolicitudesDesconexionFisicaService } from "./Fisica/Services/solicitudDesconexion.service";
import { SolicitudesCambioMedidorFisicaService } from "./Fisica/Services/solicitudCambioMedidor.service";

@Injectable()
export class SolicitudesService {
    constructor(
        private readonly solicitudAfiliacionFisicaService: SolicitudAfiliacionFisicaService,

        private readonly solicitudDesconexionFisicaService: SolicitudesDesconexionFisicaService,

        private readonly solicitudCambioMedidorFisicaService: SolicitudesCambioMedidorFisicaService,

        private readonly solicitudAsociadoFisicaService: SolicitudAsociadoFisicaService,

        private readonly solicitudAfiliacionJuridicaService: SolicitudAfiliacionJuridicaService,

        private readonly solicitudDesconexionJuridicaService: SolicitudDesconexionJuridicaService,

        private readonly solicitudCambioMedidorJuridicaService: SolicitudCambioMedidorJuridicaService,

        private readonly solicitudAsociadoJuridicaService: SolicitudAsociadoJuridicaService,    
    ) {}

    async getAllSolicitudesFisicas() {
        const Afiliacion = await this.solicitudAfiliacionFisicaService.getAllSolicitudesAfiliacion();
        const Desconexion = await this.solicitudDesconexionFisicaService.getAllSolicitudesDesconexion();
        const CambioMedidor = await this.solicitudCambioMedidorFisicaService.getAllSolicitudesCambioMedidor();
        const Asociado = await this.solicitudAsociadoFisicaService.getAllSolicitudesAsociado();

        return { Afiliacion, Desconexion, CambioMedidor, Asociado };
    }

    async getAllSolicitudesJuridicas() {
        const Afiliacion = await this.solicitudAfiliacionJuridicaService.getAllSolicitudesAfiliacion();
        const Desconexion = await this.solicitudDesconexionJuridicaService.getAllSolicitudesDesconexion();
        const CambioMedidor = await this.solicitudCambioMedidorJuridicaService.getAllSolicitudesCambioMedidor();
        const Asociado = await this.solicitudAsociadoJuridicaService.getAllSolicitudesAsociado();

        return { Afiliacion, Desconexion, CambioMedidor, Asociado };
    }
}