import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { SolicitudAsociadoFisicaService } from "../Services/solicitudAsociado.service";
import { CreateSolicitudAsociadoFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudAsociadoFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";

@Controller('solicitud-asociado-fisica')
export class SolicitudAsociadoFisicaController {
    constructor(
        private readonly solicitudAsociadoFisicaService: SolicitudAsociadoFisicaService
    ) { }

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de asociado' })
    getAllSolicitudesAsociado() {
        return this.solicitudAsociadoFisicaService.getAllSolicitudesAsociado();
    }

    @Public()
    @Post('/create')
    @ApiOperation({ summary: 'Crear una nueva solicitud de asociado' })
    createSolicitudAsociado(@Body() dto: CreateSolicitudAsociadoFisicaDto) {
        return this.solicitudAsociadoFisicaService.createSolicitudAsociado(dto);
    }

    @Put('/update/:idSolicitud/:idUsuario')
    @ApiOperation({ summary: 'Actualizar una solicitud de asociado por ID' })
    updateSolicitudAsociado(@Param('idSolicitud', ParseIntPipe) idSolicitud: number, @Body() dto: UpdateSolicitudAsociadoFisicaDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
        return this.solicitudAsociadoFisicaService.updateSolicitudAsociado(idSolicitud, dto, idUsuario);
    }

    @Patch('/update/estado/:idSolicitud/:idNuevoEstado/:idUsuario')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado por ID' })
    updateEstadoSolicitudAsociado(@Param('idSolicitud', ParseIntPipe) idSolicitud: number, @Param('idNuevoEstado', ParseIntPipe) idNuevoEstado: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
        return this.solicitudAsociadoFisicaService.UpdateEstadoSolicitudAsociado(idSolicitud, idNuevoEstado, idUsuario);
    }
}