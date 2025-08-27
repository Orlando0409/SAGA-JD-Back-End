import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { CreateSolicitudCambioMedidorDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { SolicitudesMedidorService } from "../Services/solicitudCambioMedidor.service";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudCambioMediadorDto } from "../SolicitudDTO's/UpdateSolicitud.dto";

@Controller('solicitud-cambio-mediador')
export class SolicitudCambioMedidorController {
  
  constructor(private readonly solicitudCambioMedidorService: SolicitudesMedidorService) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de cambio de medidor' })
  getAllSolicitudesCambioMedidor() {
    return this.solicitudCambioMedidorService.findAllSolicitudesCambioMedidor();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud de cambio de medidor por ID' })
  getSolicitudCambioMedidorById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudCambioMedidorService.findSolicitudCambioMedidorById(id);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de cambio de medidor' })
  createSolicitudCambioMedidor(@Body() dto: CreateSolicitudCambioMedidorDto) {
    return this.solicitudCambioMedidorService.createSolicitudCambioMedidor(dto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de cambio de medidor por ID' })
  updateSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudCambioMediadorDto) {
    return this.solicitudCambioMedidorService.updateSolicitudCambioMedidor(id, dto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de cambio de medidor por ID' })
  updateEstadoSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudCambioMedidorService.UpdateEstadoSolicitudCambioMedidor(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de cambio de medidor por ID' })
  deleteSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudCambioMedidorService.deleteSolicitudCambioMedidor(id);
  }
}