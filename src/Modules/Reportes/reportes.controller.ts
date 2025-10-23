import { Body, Controller, Delete, Get, Param, Post, UploadedFiles, UseInterceptors, Patch, BadRequestException } from '@nestjs/common';
import { CreateReporteDto } from './ReportesDto/CreateReporte.dto';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { UpdateReporteEstadoDto } from './ReportesDto/UpdateReporteEstado.dto';
import { ResponderReporteDto } from './ReportesDto/ResponderReporte.dto';
import { Public } from "src/Modules/auth/Decorator/Public.decorator";


@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  
  @Get()
  getAll() {
    return this.reportesService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', NumericParamPipe) id: number) {
    return this.reportesService.getOne(id);
  }

  @Public()
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Adjunto', maxCount: 10 },
  ]))
  create(
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true, forbidUnknownValues: false })) body: CreateReporteDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    return this.reportesService.create(body, files);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id', NumericParamPipe) id: number, @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: UpdateReporteEstadoDto) {
    const nuevo = body.IdEstadoReporte;
    return this.reportesService.updateEstado(id, nuevo);
  }

  
  @Post(':id/responder')
  responder(
    @Param('id', NumericParamPipe) id: number,
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: ResponderReporteDto,
  ) {
    return this.reportesService.responderReporte(id, body);
  }

  @Delete(':id')
  remove(@Param('id', NumericParamPipe) id: number) {
    return this.reportesService.remove(id);
  }
}
