import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { SolicitudesDesconexionFisicaService } from "../Services/solicitudDesconexion.service";
import { CreateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/CreateSolicitudFisica.dto";
import { UpdateSolicitudDesconexionFisicaDto } from "../../SolicitudDTO's/UpdateSolicitudFisica.dto";

@Controller('solicitud-desconexion-fisica')
export class SolicitudDesconexionFisicaController {
  constructor(
    private readonly solicitudDesconexionFisicaService: SolicitudesDesconexionFisicaService,
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de desconexion' })
  getAllSolicitudesDesconexion() {
    return this.solicitudDesconexionFisicaService.getAllSolicitudesDesconexion();
  }

  @Public()
  @Post('/create')
  @UseInterceptors(FileFieldsInterceptor([ 
      { name: 'Planos_Terreno', maxCount: 1 }, 
      { name: 'Escritura_Terreno', maxCount: 1 }, 
    ]),)
    async createSolicitudDesconexion(
    @Body() solicitudDesconexion: CreateSolicitudDesconexionFisicaDto,
    @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; } ) {
      return this.solicitudDesconexionFisicaService.createSolicitudDesconexion(solicitudDesconexion, files);
    }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de desconexion por ID' })
  updateSolicitudDesconexion(@Param('ID Solicitud', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudDesconexionFisicaDto) {
    return this.solicitudDesconexionFisicaService.updateSolicitudDesconexion(id, dto);
  }

  @Patch(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de desconexion por ID' })
  updateEstadoSolicitudDesconexion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudDesconexionFisicaService.UpdateEstadoSolicitudDesconexion(id, nuevoEstadoId);
  }
}