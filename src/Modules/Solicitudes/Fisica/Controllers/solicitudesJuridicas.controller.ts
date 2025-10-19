import { Controller } from "@nestjs/common";
import { SolicitudesJuridicasService } from "../Services/solicitudesJuridicas.service";

@Controller('solicitudes-juridicas')
export class SolicitudesJuridicasController {
    constructor(
        private readonly solicitudesJuridicasService: SolicitudesJuridicasService
    ) { }
}