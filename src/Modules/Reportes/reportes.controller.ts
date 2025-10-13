import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseInterceptors, Patch, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { CreateReporteDto } from './ReporteDTO\'s/CreateReporte.dto';
import { UpdateReporteEstadoDto } from './ReporteDTO\'s/UpdateReporteEstado.dto';
import { ResponderReporteDto } from './ReporteDTO\'s/ResponderReporte.dto';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) { }

  @Get()
  async findAll() {
    return this.reportesService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id', NumericParamPipe) id: number) {
    return this.reportesService.getOne(id);
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Imagen', maxCount: 10 },
    { name: 'Adjunto', maxCount: 10 },
  ]))
  async create(@Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreateReporteDto, @UploadedFiles() files: any) {
    return this.reportesService.create(dto, files);
  }

  // PUT eliminado: la actualización de estado se realiza mediante PATCH
  @Put(':id')
  putNotAllowed(@Param('id', NumericParamPipe) id: number, @Res() res: Response) {
    const message = `PUT no permitido. Use PATCH /reportes/${id}/estado para actualizar el estado.`;
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ statusCode: 405, error: 'Method Not Allowed', message });
  }

  @Patch(':id/estado')
  async updateEstado(
    @Param('id', NumericParamPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: UpdateReporteEstadoDto,
  ) {
    return this.reportesService.updateEstadoReporte(id, body.Id_Estado_Reporte);
  }

  @Post(':id/responder')
  async responder(
    @Param('id', NumericParamPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: ResponderReporteDto,
  ) {
    return this.reportesService.responderReporte(id, body.Respuesta);
  }

  @Delete(':id')
  async remove(@Param('id', NumericParamPipe) id: number) {
    return this.reportesService.remove(id);
  }
}
