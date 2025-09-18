import { Module } from "@nestjs/common";
import { SolicitudAfiliacionFisicaModule } from "./Fisica/Modules/solicitudAfiliacion.module";
import { SolicitudDesconexionFisicaModule } from "./Fisica/Modules/solicitudDesconexion.module";
import { SolicitudCambioMedidorFisicaModule } from "./Fisica/Modules/solicitudCambioMedidor.module";
import { SolicitudAsociadoFisicaModule } from "./Fisica/Modules/solicitudAsociado.module";
import { SolicitudAfiliacionJuridicaModule } from "./Juridica/Modules/solicitudAfiliacion.module";
import { SolicitudDesconexionJuridicaModule } from "./Juridica/Modules/solicitudDesconexion.module";
import { SolicitudCambioMedidorJuridicaModule } from "./Juridica/Modules/solicitudCambioMedidor.module";
import { SolicitudAsociadoJuridicaModule } from "./Juridica/Modules/solicitudAsociado.module";
import { SolicitudesController } from "./solicitudes.controller";
import { SolicitudesService } from "./solicitudes.service";

@Module({
    imports: [SolicitudAfiliacionFisicaModule, SolicitudDesconexionFisicaModule, SolicitudCambioMedidorFisicaModule,
        SolicitudAsociadoFisicaModule, SolicitudAfiliacionJuridicaModule, SolicitudDesconexionJuridicaModule,
        SolicitudCambioMedidorJuridicaModule, SolicitudAsociadoJuridicaModule],
    controllers: [SolicitudesController],
    providers: [SolicitudesService],
})

export class SolicitudesModule {}