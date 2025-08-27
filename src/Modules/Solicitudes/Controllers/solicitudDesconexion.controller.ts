import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { SolicitudesDesconexionService } from "../Services/solicitudDesconexion.service";
import { CreateSolicitudDesconexionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudDesconexionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Controller('solicitud-desconexion')
export class SolicitudDesconexionController {

  constructor(private readonly solicitudDesconexionService: SolicitudesDesconexionService) {}

  @Public()
  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de desconexion' })
  getAllSolicitudesDesconexion() {
    return this.getAllSolicitudesDesconexion();
  }
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una solicitud de desconexion por ID' })
  getSolicitudDesconexionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionService.findSolicitudDesconexionById(id);
  }
  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de desconexion' })
  createSolicitudDesconexion(@Body() dto: CreateSolicitudDesconexionDto) {
    return this.solicitudDesconexionService.createSolicitudDesconexion(dto);
  }
  @Public()
  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de desconexion por ID' })
  updateSolicitudDesconexion(@Param('ID Solicitud', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudDesconexionDto) {
    return this.solicitudDesconexionService.updateSolicitudDesconexion(id, dto);
  }
  @Public()
  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de desconexion por ID' })
  updateEstadoSolicitudDesconexion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudDesconexionService.UpdateEstadoSolicitudDesconexion(id, nuevoEstadoId);
  }
  @Public()
  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de desconexion por ID' })
  deleteSolicitudDesconexion(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionService.deleteSolicitudDesconexion(id);
  }
}