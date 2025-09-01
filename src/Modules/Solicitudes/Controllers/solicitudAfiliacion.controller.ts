import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UploadedFiles, UseInterceptors} from "@nestjs/common";
import { SolicitudesAfiliacionService } from "../Services/solicitudAfiliacion.service";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudAfiliacionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";

@Controller('solicitud-afiliacion')
export class SolicitudAfiliacionController {
  constructor
  (
    private readonly solicitudAfiliacionService: SolicitudesAfiliacionService,
    private readonly dropboxFilesService: DropboxFilesService
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

  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'Planos_Terreno', maxCount: 1 },
      { name: 'Escritura_Terreno', maxCount: 1 },
    ]),
  )
  async create(
  @UploadedFiles()
    files: {
      Planos_Terreno?: Express.Multer.File[];
      Escritura_Terreno?: Express.Multer.File[];
    },
    @Body() body: CreateSolicitudAfiliacionDto,
  ) {
    const planoFile = files.Planos_Terreno?.[0];
    const escrituraFile = files.Escritura_Terreno?.[0];

    const planoRes = planoFile
      ? await this.dropboxFilesService.uploadFile(planoFile, { Tipo: 'plano' })
      : null;

    const escrituraRes = escrituraFile
      ? await this.dropboxFilesService.uploadFile(escrituraFile, { Tipo: 'escritura' })
      : null;

    // Guarda SOLO las URLs en tu BD
    const dataToSave = {
      ...body,
      Planos_Terreno: planoRes?.url ?? null,
      Escritura_Terreno: escrituraRes?.url ?? null,
    };

    return this.solicitudAfiliacionService.createSolicitudAfiliacion(dataToSave);
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