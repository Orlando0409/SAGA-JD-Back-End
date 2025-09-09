import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { SolicitudesCambioMedidorFisicaService } from "../Services/solicitudCambioMedidor.service";
import { CreateSolicitudCambioMedidorFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudCambioMedidorFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";

@Controller('solicitud-cambio-medidor-fisica')
export class SolicitudCambioMedidorFisicaController {
  constructor
  (
    private readonly solicitudCambioMedidorFisicaService: SolicitudesCambioMedidorFisicaService
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de cambio de medidor' })
  getAllSolicitudesCambioMedidor() {
    return this.solicitudCambioMedidorFisicaService.findAllSolicitudesCambioMedidor();
  }
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud de cambio de medidor por ID' })
  getSolicitudCambioMedidorById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudCambioMedidorFisicaService.findSolicitudCambioMedidorById(id);
  }

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de cambio de medidor' })
  createSolicitudCambioMedidor(@Body() dto: CreateSolicitudCambioMedidorFisicaDto) {
    return this.solicitudCambioMedidorFisicaService.createSolicitudCambioMedidor(dto);
  }
  @Public()
  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de cambio de medidor por ID' })
  updateSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudCambioMedidorFisicaDto) {
    return this.solicitudCambioMedidorFisicaService.updateSolicitudCambioMedidor(id, dto);
  }
  @Public()
  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de cambio de medidor por ID' })
  updateEstadoSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudCambioMedidorFisicaService.UpdateEstadoSolicitudCambioMedidor(id, nuevoEstadoId);
  }
  @Public()
  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de cambio de medidor por ID' })
  deleteSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudCambioMedidorFisicaService.deleteSolicitudCambioMedidor(id);
  }
}