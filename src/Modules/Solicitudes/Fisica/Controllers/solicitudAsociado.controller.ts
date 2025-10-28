import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { SolicitudAsociadoFisicaService } from "../Services/solicitudAsociado.service";
import { CreateSolicitudAsociadoFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudAsociadoFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";

@Controller('solicitud-asociado-fisica')
export class SolicitudAsociadoFisicaController {
    constructor
    (
        private readonly solicitudAsociadoFisicaService: SolicitudAsociadoFisicaService
    ) {}

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

    @Put('/update/:id')
    @ApiOperation({ summary: 'Actualizar una solicitud de asociado por ID' })
    updateSolicitudAsociado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudAsociadoFisicaDto) {
        return this.solicitudAsociadoFisicaService.updateSolicitudAsociado(id, dto);
    }

    @Patch(':id/update/estado/:nuevoEstadoId')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado por ID' })
    updateEstadoSolicitudAsociado(
        @Param('id', ParseIntPipe) id: number,
        @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number,
        @Param('idUsuario', ParseIntPipe) idUsuario: number) {
        return this.solicitudAsociadoFisicaService.UpdateEstadoSolicitudAsociado(id, nuevoEstadoId, idUsuario);
    }
}