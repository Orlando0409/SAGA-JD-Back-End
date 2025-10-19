import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSolicitudAfiliacionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudAfiliacionFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";
import { SolicitudAfiliacionFisicaService } from "../Services/solicitudAfiliacion.service";

@Controller('solicitud-afiliacion-fisica')
export class SolicitudAfiliacionFisicaController {
  constructor(
    private readonly solicitudAfiliacionFisicaService: SolicitudAfiliacionFisicaService,
  ) { }

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de afiliación físicas' })
  getAllSolicitudesAfiliacion() {
    return this.solicitudAfiliacionFisicaService.getAllSolicitudesAfiliacion();
  }

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de afiliacion fisica' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Planos_Terreno', maxCount: 1 },
    { name: 'Escritura_Terreno', maxCount: 1 },
  ]),)
  async createSolicitudAfiliacion(
    @Body() solicitudAfiliacion: CreateSolicitudAfiliacionFisicaDto,
    @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; }) {
    return this.solicitudAfiliacionFisicaService.createSolicitudAfiliacion(solicitudAfiliacion, files);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de afiliación fisica por ID' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Planos_Terreno', maxCount: 1 },
    { name: 'Escritura_Terreno', maxCount: 1 },
  ]))
  updateSolicitudAfiliacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitudAfiliacionFisicaDto,
    @UploadedFiles() files?: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; }
  ) {
    return this.solicitudAfiliacionFisicaService.updateSolicitudAfiliacion(id, dto, files);
  }

  @Patch(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de afiliación fisica por ID' })
  updateEstadoSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudAfiliacionFisicaService.UpdateEstadoSolicitudAfiliacion(id, nuevoEstadoId);
  }
}