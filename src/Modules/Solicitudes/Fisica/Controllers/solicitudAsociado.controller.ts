import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { SolicitudesAsociadoService } from "../Services/solicitudAsociado.service";
import { CreateAsociadoDto, CreateSolicitudAsociadoDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudAsociadoDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Controller('solicitud-asociado')
export class SolicitudAsociadoController {
    constructor
    (
        private readonly solicitudAsociadoService: SolicitudesAsociadoService
    ) {}

    @Get('/all')
    @ApiOperation({ summary: 'Obtener todas las solicitudes de asociado' })
    getAllSolicitudesAsociado() {
        return this.solicitudAsociadoService.getAllSolicitudesAsociado();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener solicitud por ID' })
    getSolicitudAsociadoById(@Param('id', ParseIntPipe) id: number) {
        return this.solicitudAsociadoService.findSolicitudAsociadoById(id);
    }

    @Public()
    @Post('/create')
    @ApiOperation({ summary: 'Crear una nueva solicitud de asociado' })
    createSolicitudAsociado(@Body() dto: CreateSolicitudAsociadoDto) {
        return this.solicitudAsociadoService.createSolicitudAsociado(dto);
    }

    @Put('/update/:id')
    @ApiOperation({ summary: 'Actualizar una solicitud de asociado por ID' })
    updateSolicitudAsociado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudAsociadoDto) {
        return this.solicitudAsociadoService.updateSolicitudAsociado(id, dto);
    }

    @Put(':id/update/estado/:nuevoEstadoId')
    @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado por ID' })
    updateEstadoSolicitudAsociado(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
        return this.solicitudAsociadoService.UpdateEstadoSolicitudAsociado(id, nuevoEstadoId);
    }

    @Delete('/delete/:id')
    @ApiOperation({ summary: 'Eliminar una solicitud de asociado por ID' })
    deleteSolicitudAsociado(@Param('id', ParseIntPipe) id: number) {
        return this.solicitudAsociadoService.deleteSolicitudAsociado(id);
    }
}