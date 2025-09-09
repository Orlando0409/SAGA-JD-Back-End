import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFiles, UseInterceptors} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSolicitudDesconexionJuridicaDto } from "../../SolicitudDTO's/CreateSolicitudJuridica.dto";
import { UpdateSolicitudDesconexionJuridicaDto } from "../../SolicitudDTO's/UpdateSolicitudJuridica.dto";
import { SolicitudDesconexionJuridicaService } from "../Services/solicitudDesconexion.service";

@Controller('solicitud-desconexion-juridica')
export class SolicitudDesconexionJuridicaController {
  constructor
  (
    private readonly solicitudDesconexionJuridicaService: SolicitudDesconexionJuridicaService,
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Obtener todas las solicitudes de desconexión jurídicas' })
  getAllSolicitudesDesconexion() {
    return this.solicitudDesconexionJuridicaService.getAllSolicitudesDesconexion();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  getSolicitudDesconexionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionJuridicaService.findSolicitudDesconexionById(id);
  }

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Crear una nueva solicitud de desconexión jurídica' })
  @UseInterceptors(FileFieldsInterceptor([ 
    { name: 'Planos_Terreno', maxCount: 1 }, 
    { name: 'Escritura_Terreno', maxCount: 1 }, 
  ]),)
  async createSolicitudDesconexion(
  @Body() solicitudDesconexion: CreateSolicitudDesconexionJuridicaDto,
  @UploadedFiles() files: { Planos_Terreno?: Express.Multer.File[]; Escritura_Terreno?: Express.Multer.File[]; } ) {
    return this.solicitudDesconexionJuridicaService.createSolicitudDesconexion(solicitudDesconexion, files);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Actualizar una solicitud de desconexión jurídica por ID' })
  updateSolicitudDesconexion(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudDesconexionJuridicaDto) {
    return this.solicitudDesconexionJuridicaService.updateSolicitudDesconexion(id, dto);
  }

  @Put(':id/update/estado/:nuevoEstadoId')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud de desconexión jurídica por ID' })
  updateEstadoSolicitudDesconexion(@Param('id', ParseIntPipe) id: number, @Param('nuevoEstadoId', ParseIntPipe) nuevoEstadoId: number) {
    return this.solicitudDesconexionJuridicaService.UpdateEstadoSolicitudDesconexion(id, nuevoEstadoId);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Eliminar una solicitud de desconexión jurídica por ID' })
  deleteSolicitudDesconexion(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDesconexionJuridicaService.deleteSolicitudDesconexion(id);
  }
}
