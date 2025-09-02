import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { SolicitudesDesconexionService } from "../Services/solicitudDesconexion.service";
import { CreateSolicitudDesconexionDto } from "../SolicitudDTO's/CreateSolicitud.dto";
import { ApiOperation } from "@nestjs/swagger";
import { UpdateSolicitudDesconexionDto } from "../SolicitudDTO's/UpdateSolicitud.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { DropboxFilesService } from "src/Dropbox/Files/DropboxFiles.service";

@Controller('solicitud-desconexion')
export class SolicitudDesconexionController {
  constructor(
    private readonly solicitudDesconexionService: SolicitudesDesconexionService,
    private readonly dropboxFilesService: DropboxFilesService
  ) {}

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
  @UseInterceptors(FileFieldsInterceptor([ 
      { name: 'Planos_Terreno', maxCount: 1 }, 
      { name: 'Escritura_Terreno', maxCount: 1 }, 
    ]),)
    async createSolicitudDesconexion(
    @Body() solicitudDesconexion: CreateSolicitudDesconexionDto,
    @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; } ) {
      return this.solicitudDesconexionService.createSolicitudDesconexion(solicitudDesconexion, files);
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