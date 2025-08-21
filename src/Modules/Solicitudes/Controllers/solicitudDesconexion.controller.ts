import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { SolicitudesDesconexionService } from "../Services/solicitudDesconexion.service";
import { CreateSolicitudDesconexionDto } from "../SolicitudDTO's/CreateSolicitud.dto";

@Controller('solicitud-desconexion')
export class SolicitudDesconexionController {

  constructor(private readonly solicitudDesconexionService: SolicitudesDesconexionService) {}
  
  @Get('/all')
  getAllSolicitudesDesconexion() {
    return this.getAllSolicitudesDesconexion();
  }

  @Get(':id')
  getSolicitudDesconexionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionService.findSolicitudDesconexionById(id);
  }

  @Post('/create')
  createSolicitudDesconexion(@Body() dto: CreateSolicitudDesconexionDto) {
    return this.solicitudDesconexionService.createSolicitudDesconexion(dto);
  }

  @Put(':id')
  updateSolicitudDesconexion(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSolicitudDesconexionDto) {
    return this.solicitudDesconexionService.updateSolicitudDesconexion(id, dto);
  }

  @Delete(':id')
  deleteSolicitudDesconexion(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionService.deleteSolicitudDesconexion(id);
  }
}