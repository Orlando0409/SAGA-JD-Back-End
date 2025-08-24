import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { SolicitudesDesconexionService } from "../Services/solicitudDesconexion.service";
import { CreateSolicitudDesconexionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudDesconexionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";

@Controller('solicitud-desconexion')
export class SolicitudDesconexionController {

  constructor(private readonly solicitudDesconexionService: SolicitudesDesconexionService) {}
  
  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de desconexion' })
  getAllSolicitudesDesconexion() {
    return this.getAllSolicitudesDesconexion();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una solicitud de desconexion por ID' })
  getSolicitudDesconexionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionService.findSolicitudDesconexionById(id);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de desconexion' })
  createSolicitudDesconexion(@Body() dto: CreateSolicitudDesconexionDto) {
    return this.solicitudDesconexionService.createSolicitudDesconexion(dto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de desconexion por ID' })
  updateSolicitudDesconexion(@Param('ID Solicitud', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudDesconexionDto) {
    return this.solicitudDesconexionService.updateSolicitudDesconexion(id, dto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de desconexion por ID' })
  updateEstadoSolicitudDesconexion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudDesconexionService.UpdateEstadoSolicitudDesconexion(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de desconexion por ID' })
  deleteSolicitudDesconexion(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionService.deleteSolicitudDesconexion(id);
  }
}