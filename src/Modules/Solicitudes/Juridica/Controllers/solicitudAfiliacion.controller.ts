import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFiles, UseInterceptors} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudAfiliacionJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { SolicitudAfiliacionJuridicaService } from "../Services/solicitudAfiliacion.service";

@Controller('solicitud-afiliacion-juridica')
export class SolicitudAfiliacionJuridicaController {
  constructor
  (
    private readonly solicitudAfiliacionJuridicaService: SolicitudAfiliacionJuridicaService,
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de afiliación jurídicas' })
  getAllSolicitudesAfiliacion() {
    return this.solicitudAfiliacionJuridicaService.getAllSolicitudesAfiliacion();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  getsolicitudAfiliacionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudAfiliacionJuridicaService.findSolicitudAfiliacionById(id);
  }

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de afiliación jurídica' })
  @UseInterceptors(FileFieldsInterceptor([ 
    { name: 'Planos_Terreno', maxCount: 1 }, 
    { name: 'Escritura_Terreno', maxCount: 1 }, 
  ]),)
  async createSolicitudAfiliacion(
  @Body() solicitudAfiliacion: CreateSolicitudAfiliacionJuridicaDto,
  @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; } ) {
    return this.solicitudAfiliacionJuridicaService.createSolicitudAfiliacion(solicitudAfiliacion, files);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de afiliación jurídica por ID' })
  updateSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudAfiliacionJuridicaDto) {
    return this.solicitudAfiliacionJuridicaService.updateSolicitudAfiliacion(id, dto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de afiliación jurídica por ID' })
  updateEstadoSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudAfiliacionJuridicaService.UpdateEstadoSolicitudAfiliacion(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de afiliación jurídica por ID' })
  deleteSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudAfiliacionJuridicaService.deleteSolicitudAfiliacion(id);
  }
}
