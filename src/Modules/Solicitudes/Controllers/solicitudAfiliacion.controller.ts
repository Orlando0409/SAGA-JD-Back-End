import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFiles, UseInterceptors} from "@nestjs/common";
import { SolicitudesAfiliacionService } from "../Services/solicitudAfiliacion.service";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudAfiliacionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Controller('solicitud-afiliacion')
export class SolicitudAfiliacionController {
  constructor
  (
    private readonly solicitudAfiliacionService: SolicitudesAfiliacionService,
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de afiliación' })
  getAllSolicitudesAfiliacion() {
    return this.solicitudAfiliacionService.getAllSolicitudesAfiliacion();
  }
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  getsolicitudAfiliacionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudAfiliacionService.findSolicitudAfiliacionById(id);
  }

  @Public()
  @Post('/create')
  @UseInterceptors(FileFieldsInterceptor([ 
    { name: 'Planos_Terreno', maxCount: 1 }, 
    { name: 'Escritura_Terreno', maxCount: 1 }, 
  ]),)
  async createSolicitudAfiliacion(
  @Body() solicitudAfiliacion: CreateSolicitudAfiliacionDto,
  @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; } ) {
    return this.solicitudAfiliacionService.createSolicitudAfiliacion(solicitudAfiliacion, files);
  }
  @Public()
  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de afiliación por ID' })
  updateSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudAfiliacionDto) {
    return this.solicitudAfiliacionService.updateSolicitudAfiliacion(id, dto);
  }
   @Public()
  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de afiliación por ID' })
  updateEstadoSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudAfiliacionService.UpdateEstadoSolicitudAfiliacion(id, nuevoEstadoId);
  }
  @Public()
  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de afiliación por ID' })
  deleteSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudAfiliacionService.deleteSolicitudAfiliacion(id);
  }
}