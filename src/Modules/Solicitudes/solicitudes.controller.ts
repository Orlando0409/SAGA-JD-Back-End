import { Controller, Get } from "@nestjs/common";
import { SolicitudesService } from "./solicitudes.service";
import { ApiOperation } from "@nestjs/swagger";

@Controller('solicitudes')
export class SolicitudesController {
    constructor(
    private readonly solicitudesService: SolicitudesService,
    ) {}

    @Get('/fisicas')
    @ApiOperation({ summary: 'Obtener todas las solicitudes físicas' })
    async getAllSolicitudesFisicas() {
        return this.solicitudesService.getAllSolicitudesFisicas();
    }

    @Get('/juridicas')
    @ApiOperation({ summary: 'Obtener todas las solicitudes jurídicas' })
    async getAllSolicitudesJuridicas() {
        return this.solicitudesService.getAllSolicitudesJuridicas();
    }
}