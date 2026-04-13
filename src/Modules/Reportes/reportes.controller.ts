import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors, Patch , Request} from '@nestjs/common';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { Public } from '../auth/Decorator/Public.decorator';
import { CreateReporteDto } from './ReporteDTO\'s/CreateReporte.dto';
import { ResponderReporteDto } from './ReporteDTO\'s/ResponderReporte.dto';
import { UpdateReporteEstadoDto } from './ReporteDTO\'s/UpdateReporteEstado.dto';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) { }

  @Get()
  getAll() {
    return this.reportesService.getAll();
  }

  @Get('archivados')
  getArchivados() {
    return this.reportesService.getAllArchivados();
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
  updateEstado(
    @Param('id', NumericParamPipe) id: number, 
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: UpdateReporteEstadoDto,
    @Request() req: any,
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    const nuevo = body.Id_Estado_Reporte;
    return this.reportesService.updateEstado(id, nuevo, idUsuario);
  }

  @Patch(':id/responder')
  responder(
    @Param('id', NumericParamPipe) id: number,
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: ResponderReporteDto,
    @Request() req: any,
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.reportesService.responderReporte(id, body, idUsuario);
  }
}