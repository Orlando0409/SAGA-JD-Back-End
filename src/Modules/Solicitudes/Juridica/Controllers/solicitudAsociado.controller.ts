import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { SolicitudAsociadoJuridicaService } from "../Services/solicitudAsociado.service";

@Controller('solicitud-asociado-juridica')
export class SolicitudAsociadoJuridicaController {
  constructor
  (
    private readonly solicitudAsociadoJuridicaService: SolicitudAsociadoJuridicaService,
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de asociado jurídicas' })
  getAllSolicitudesAsociado() {
    return this.solicitudAsociadoJuridicaService.getAllSolicitudesAsociado();
  }

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de asociado jurídica' })
  async createSolicitudAsociado(@Body() solicitudAsociado: CreateSolicitudAsociadoJuridicaDto) {
    return this.solicitudAsociadoJuridicaService.createSolicitudAsociado(solicitudAsociado);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de asociado jurídica por ID' })
  updateSolicitudAsociado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudAsociadoJuridicaDto) {
    return this.solicitudAsociadoJuridicaService.updateSolicitudAsociado(id, dto);
  }

  @Patch(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado jurídica por ID' })
  updateEstadoSolicitudAsociado(
    @Param('id', ParseIntPipe) id: number,
    @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number,
    @Param('idUsuario', ParseIntPipe) idUsuario: number
  ) {
    return this.solicitudAsociadoJuridicaService.UpdateEstadoSolicitudAsociado(id, nuevoEstadoId, idUsuario);
  }
}