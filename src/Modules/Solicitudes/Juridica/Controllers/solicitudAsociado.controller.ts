import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAsociadoJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { SolicitudAsociadoJuridicaService } from "../Services/solicitudAsociado.service";

@Controller('solicitud-asociado-juridica')
export class SolicitudAsociadoJuridicaController {
  constructor(
    private readonly solicitudAsociadoJuridicaService: SolicitudAsociadoJuridicaService,
  ) { }

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

  @Put('/update/:idSolicitud/:idUsuario')
  @ApiOperation({ summary: 'Actualizar una solicitud de asociado jurídica por ID' })
  updateSolicitudAsociado(@Param('idSolicitud', ParseIntPipe) idSolicitud: number, @Body() dto: UpdateSolicitudAsociadoJuridicaDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.solicitudAsociadoJuridicaService.updateSolicitudAsociado(idSolicitud, dto, idUsuario);
  }

  @Patch(':idSolicitud/update/estado/:idNuevoEstado/:idUsuario')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de asociado jurídica por ID' })
  updateEstadoSolicitudAsociado(@Param('idSolicitud', ParseIntPipe) idSolicitud: number, @Param('idNuevoEstado', ParseIntPipe) idNuevoEstado: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.solicitudAsociadoJuridicaService.UpdateEstadoSolicitudAsociado(idSolicitud, idNuevoEstado, idUsuario);
  }
}