import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { SolicitudesAfiliacionService } from "../Services/solicitudAfiliacion.service";
import { CreateSolicitudAfiliacionDto } from "../SolicitudDTO's/CreateSolicitud.dto";


@Controller('solicitud-afiliacion')
export class SolicitudAfiliacionController {
  constructor(private readonly solicitudAfiliacionService: SolicitudesAfiliacionService) {}

  @Get('/all')
  async getAllSolicitudesAfiliacion() {
    return this.getAllSolicitudesAfiliacion();
  }

  @Get(':id')
  async getSolicitudAfiliacionById(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudAfiliacionService.findSolicitudAfiliacionById(id);
  }

  @Post('/create')
    async createSolicitudAfiliacion(@Body() dto: CreateSolicitudAfiliacionDto) {
        return this.solicitudAfiliacionService.createSolicitudAfiliacion(dto);
    }

  @Put(':id')
    async updateSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSolicitudAfiliacionDto) {
        return this.solicitudAfiliacionService.updateSolicitudAfiliacion(id, dto);
    }

    @Delete(':id')
    async deleteSolicitudAfiliacion(@Param('id', ParseIntPipe) id: number) {
        return this.solicitudAfiliacionService.deleteSolicitudAfiliacion(id);
    }
}