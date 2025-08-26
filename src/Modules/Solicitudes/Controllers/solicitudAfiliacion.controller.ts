import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from "@nestjs/common";
import { SolicitudesAfiliacionService } from "../Services/solicitudAfiliacion.service";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudAfiliacionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Controller('solicitud-afiliacion')
export class SolicitudAfiliacionController {
  constructor(private readonly solicitudAfiliacionService: SolicitudesAfiliacionService) {}


  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de afiliación' })
  getAllSolicitudesAfiliacion() {
    return this.solicitudAfiliacionService.getAllSolicitudesAfiliacion();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  getsolicitudAfiliacionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudAfiliacionService.findSolicitudAfiliacionById(id);
  }

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de afiliación' })
  createSolicitudAfiliacion(@Body() dto: CreateSolicitudAfiliacionDto) {
    return this.solicitudAfiliacionService.createSolicitudAfiliacion(dto);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de afiliación por ID' })
  updateSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudAfiliacionDto) {
    return this.solicitudAfiliacionService.updateSolicitudAfiliacion(id, dto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de afiliación por ID' })
  updateEstadoSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudAfiliacionService.UpdateEstadoSolicitudAfiliacion(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de afiliación por ID' })
  deleteSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudAfiliacionService.deleteSolicitudAfiliacion(id);
  }
}