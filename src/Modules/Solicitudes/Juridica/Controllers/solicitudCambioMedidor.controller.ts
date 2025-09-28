import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSolicitudCambioMedidorJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudCambioMedidorJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { SolicitudCambioMedidorJuridicaService } from "../Services/solicitudCambioMedidor.service";

@Controller('solicitud-cambio-medidor-juridica')
export class SolicitudCambioMedidorJuridicaController {
  constructor
  (
    private readonly solicitudCambioMedidorJuridicaService: SolicitudCambioMedidorJuridicaService,
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de cambio de medidor jurídicas' })
  getAllSolicitudesCambioMedidor() {
    return this.solicitudCambioMedidorJuridicaService.getAllSolicitudesCambioMedidor();
  }

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de cambio de medidor jurídica' })
  async createSolicitudCambioMedidor(@Body() solicitudCambioMedidor: CreateSolicitudCambioMedidorJuridicaDto) {
    return this.solicitudCambioMedidorJuridicaService.createSolicitudCambioMedidor(solicitudCambioMedidor);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de cambio de medidor jurídica por ID' })
  updateSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudCambioMedidorJuridicaDto) {
    return this.solicitudCambioMedidorJuridicaService.updateSolicitudCambioMedidor(id, dto);
  }

  @Patch(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de cambio de medidor jurídica por ID' })
  updateEstadoSolicitudCambioMedidor(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudCambioMedidorJuridicaService.UpdateEstadoSolicitudCambioMedidor(id, nuevoEstadoId);
  }
}