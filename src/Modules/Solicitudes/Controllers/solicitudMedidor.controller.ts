import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { CreateSolicitudCambioMedidorDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { SolicitudesMedidorService } from "../Services/solicitudMedidor.service";


@Controller('solicitud-cambio-mediador')
export class SolicitudCambioMedidorController {
  
  constructor(private readonly solicitudCambioMedidorService: SolicitudesMedidorService) {}

  @Get('/all')
  getAllSolicitudesCambioMedidor() {
    return this.solicitudCambioMedidorService.getAllSolicitudesCambioMedidor();
  }

  @Get(':id')
  getSolicitudCambioMedidorById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudCambioMedidorService.findSolicitudMedidorById(id);
  }

  @Post('/create')
  createSolicitudCambioMedidor(@Body() dto: CreateSolicitudCambioMedidorDto) {
    return this.solicitudCambioMedidorService.createSolicitudMedidor(dto);
  }

  @Put(':id')
  updateSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSolicitudCambioMedidorDto) {
    return this.solicitudCambioMedidorService.updateSolicitudMedidor(id, dto);
  }

  @Delete(':id')
  deleteSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudCambioMedidorService.deleteSolicitudMedidor(id);
  }
}