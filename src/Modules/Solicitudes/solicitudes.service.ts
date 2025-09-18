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
        const afiliacion = await this.solicitudAfiliacionFisicaService.getAllSolicitudesAfiliacion();
        const desconexion = await this.solicitudDesconexionFisicaService.getAllSolicitudesDesconexion();
        const cambioMedidor = await this.solicitudCambioMedidorFisicaService.getAllSolicitudesCambioMedidor();
        const asociado = await this.solicitudAsociadoFisicaService.getAllSolicitudesAsociado();

        return { afiliacion, desconexion, cambioMedidor, asociado };
    }

    async getAllSolicitudesJuridicas() {
        const afiliacion = await this.solicitudAfiliacionJuridicaService.getAllSolicitudesAfiliacion();
        const desconexion = await this.solicitudDesconexionJuridicaService.getAllSolicitudesDesconexion();
        const cambioMedidor = await this.solicitudCambioMedidorJuridicaService.getAllSolicitudesCambioMedidor();
        const asociado = await this.solicitudAsociadoJuridicaService.getAllSolicitudesAsociado();

        return { afiliacion, desconexion, cambioMedidor, asociado };
    }
}